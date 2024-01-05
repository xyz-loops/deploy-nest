import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/service/prisma.service';
import {
  AllRoleDto,
  CreateRealizationDto,
  CreateRealizationItemDto,
} from './dto/create-realization.dto';
import { CreateFileDto } from './dto/create-file-upload.dto';
import { PrismaClient, Realization, StatusEnum } from '@prisma/client';
import { UpdateRealizationDto } from './dto/update-realization.dto';
import { lastValueFrom, tap } from 'rxjs';
import { RoleService } from '../role/role.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class RealizationService {
  httpService: HttpService;
  prismaService: PrismaClient;
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleService: RoleService,
  ) {
    this.prismaService = new PrismaClient();
  }

  async generateRequestNumber(idCostCenter: number): Promise<string> {
    const year = new Date().getFullYear() % 100;
    const month = new Date().getMonth() + 1;

    const maxId = await this.prisma.realization.aggregate({
      _max: {
        draftNumber: true,
      },
    });

    const id = (maxId?._max?.draftNumber || 0) + 1;

    const mCostCenter = await this.prisma.mCostCenter.findUnique({
      where: { idCostCenter },
    });

    const dinas = mCostCenter.dinas;

    const requestNumber = `${dinas}/${id}/${month}/${year}`;

    return requestNumber;
  }
  async generateDepartment(idCostCenter: number): Promise<string> {
    const mCostCenter = await this.prisma.mCostCenter.findUnique({
      where: { idCostCenter },
    });

    const department = mCostCenter.bidang;

    return department;
  }

  async createRealization<T>(
    createRealization: CreateRealizationDto,
    realizationItems: CreateRealizationItemDto[],
    uploadfile: CreateFileDto[],
    status: 'save' | 'submit',
  ) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Transaction timeout')), 10000),
      );

      const transactionPromise = this.prisma.$transaction(
        async (prisma) => {
          let statusTom: number = 1;
          let statusToTom: number = 2;
          let requestNumber: string | null = null;
          let roleAssignment: any = null;
          let dtoRoleAssignment = null;
          let department = await this.generateDepartment(
            createRealization.costCenterId,
          );

          if (status && status == 'submit') {
            statusTom = 2;
            statusToTom = 4;
            requestNumber = await this.generateRequestNumber(
              createRealization.costCenterId,
            );

            roleAssignment = await this.roleService.getRole(
              createRealization.createdBy,
            );
            dtoRoleAssignment = this.mapRoleAssignment(roleAssignment);
          }

          // Extract Realization data from the DTO
          const { ...realizationData } = createRealization;

          // // Create realization within the transaction
          const createdRealization = await prisma.realization.create({
            data: {
              years: new Date().getFullYear(),
              month: new Date().getMonth() + 1,
              requestNumber: requestNumber,
              taReff: realizationData.taReff,
              responsibleNopeg: realizationData.responsibleNopeg,
              titleRequest: realizationData.titleRequest,
              noteRequest: realizationData.noteRequest,
              department: department,
              personalNumber: realizationData.personalNumber,
              departmentTo: roleAssignment?.seniorManager?.personalUnit || null,
              personalNumberTo:
                roleAssignment?.seniorManager?.personalNumber || null,
              createdBy: realizationData.createdBy,
              status: StatusEnum.OPEN,
              type: realizationData.type,
              roleAssignment: dtoRoleAssignment,
              contributors: null,
              m_status_realization_id_statusTom_status: {
                connect: {
                  idStatus: statusTom,
                },
              },
              m_status_realization_id_status_toTom_status: {
                connect: {
                  idStatus: statusToTom,
                },
              },
              m_cost_center: {
                connect: {
                  idCostCenter: realizationData.costCenterId,
                },
              },
            },
          });

          const createdItems = await Promise.all(
            realizationItems.map(async (item: CreateRealizationItemDto) => {
              return prisma.realizationItem.create({
                data: {
                  ...item,
                  realizationId: createdRealization.idRealization,
                  amount: item.amountSubmission,
                  createdBy: createdRealization.createdBy,
                  glAccountId: item.glAccountId,
                },
              });
            }),
          );

          // Create file uploads within the transaction
          const uploadFiles = await Promise.all(
            uploadfile.map(async (file: CreateFileDto) => {
              return prisma.fileUpload.create({
                data: {
                  ...file,
                  tableName: 'Realization',
                  tableId: createdRealization.idRealization,
                  department: department,
                  createdBy: createdRealization.createdBy,
                },
              });
            }),
          );

          return {
            realization: {
              ...createdRealization,
              realizationItems: createdItems,
              uploadFiles,
            },
          };
        },
        {
          timeout: 100000, // default: 5000
        },
      );

      const result = await Promise.race([timeoutPromise, transactionPromise]);

      if (result instanceof Error) {
        throw result;
      }

      return result;
    } catch (error) {
      console.log(error.message);
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Failed to create new request',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          time: new Date(),
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private mapRoleAssignment(roleAssignment: any) {
    const roleKeys = AllRoleDto.propertyNames;
    const mappedRoleAssignment: any = {};

    roleKeys.forEach((key) => {
      mappedRoleAssignment[key] = roleAssignment?.[key] ?? null;
    });

    return mappedRoleAssignment;
  }

  async findAllRealization() {
    const realization = await this.prisma.realization.findMany({
      include: {
        realizationItem: true,
      },
    });

    const fileUpload = await this.prisma.fileUpload.findMany({
      where: {
        tableName: 'Realization',
      },
    });

    const realizationWithFileUpload = realization.map((realizationItem) => {
      const correspondingFileUploads = fileUpload.filter(
        (fileUpload) => fileUpload.tableId === realizationItem.idRealization,
      );

      return {
        realization: {
          ...realizationItem,
          fileUploads: correspondingFileUploads || [], // Array of file uploads or an empty array
        },
      };
    });

    return {
      data: realizationWithFileUpload,
      meta: null,
      message: 'All realization retrieved',
      status: HttpStatus.OK,
      time: new Date(),
    };
  }

  async findOneRealization(id: number) {
    const realization = await this.prisma.realization.findUnique({
      where: {
        idRealization: id,
      },
      include: {
        realizationItem: true,
      },
    });

    if (!realization) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Realization not found',
          status: HttpStatus.NOT_FOUND,
          time: new Date(),
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const fileUpload = await this.prisma.fileUpload.findMany({
      where: {
        tableName: 'Realization',
      },
    });

    const correspondingFileUploads = fileUpload.filter(
      (fileUpload) => fileUpload.tableId === realization.idRealization,
    );

    const realizationWithFileUpload = {
      realization: {
        ...realization,
        fileUploads: correspondingFileUploads || [], // Array of file uploads or an empty array
      },
      meta: null,
      message: 'Realization found',
      status: HttpStatus.OK,
      time: new Date(),
    };

    return realizationWithFileUpload;
  }

  // async updateRealization(
  //   id: number,
  //   updateRealization: UpdateRealizationDto,
  //   updateRealizationItems: UpdateRealizationItemDto[],
  //   updateUploadFiles: UpdateFileDto[],
  //   status?: StatusEnum,
  // ) {
  //   return this.prisma.$transaction(async (prisma) => {
  //     try {
  //       let statusTom: number = 1;
  //       let statusToTom: number = 2;
  //       let requestNumber: string | null = null;

  //       if (status && status == StatusEnum.PROGRESS) {
  //         statusTom = 2;
  //         statusToTom = 3;

  //         const year = new Date().getFullYear();
  //         const month = new Date().getMonth() + 1;
  //         requestNumber = `${month}/${year}`;
  //       }

  //       // Find existing realization
  //       const existingRealization = await prisma.realization.findUnique({
  //         where: {
  //           idRealization: id,
  //         },
  //       });

  //       if (!existingRealization) {
  //         throw new HttpException(
  //           {
  //             data: null,
  //             meta: null,
  //             message: 'Realization not found',
  //             status: HttpStatus.NOT_FOUND,
  //             time: new Date(),
  //           },
  //           HttpStatus.NOT_FOUND,
  //         );
  //       }

  //       const { ...realizationData } = updateRealization;

  //       // Update realization data
  //       const updatedRealization = await prisma.realization.update({
  //         where: {
  //           idRealization: id,
  //         },
  //         data: {
  //           years: new Date().getFullYear(),
  //           month: new Date().getMonth() + 1,
  //           requestNumber: requestNumber,
  //           taReff: realizationData.taReff,
  //           responsibleNopeg: realizationData.responsibleNopeg,
  //           titleRequest: realizationData.titleRequest,
  //           noteRequest: realizationData.noteRequest,
  //           department: realizationData.department,
  //           personalNumber: realizationData.personalNumber,
  //           departmentTo: realizationData.departmentTo,
  //           personalNumberTo: realizationData.personalNumberTo,
  //           createdBy: realizationData.createdBy,
  //           status: status ? status : StatusEnum.OPEN,
  //           type: realizationData.type,
  //           m_status_realization_id_statusTom_status: {
  //             connect: {
  //               idStatus: statusTom,
  //             },
  //           },
  //           m_status_realization_id_status_toTom_status: {
  //             connect: {
  //               idStatus: statusToTom,
  //             },
  //           },
  //           m_cost_center: {
  //             connect: {
  //               idCostCenter: realizationData.costCenterId,
  //             },
  //           },
  //         },
  //       });

  //       const existingRealizationItem = await prisma.realizationItem.findMany({
  //         where: {
  //           realizationId: updatedRealization.idRealization,
  //         },
  //       });

  //       const listProjectId2: number[] = existingRealizationItem.map(
  //         (data) => data.idRealizationItem,
  //       );

  //       console.log('listProjectId2 length =>', listProjectId2);

  //       const updatedItems = await Promise.all(
  //         updateRealizationItems.map(async (item: UpdateRealizationItemDto) => {
  //           const promises = listProjectId2.map(async (id) => {
  //             return prisma.realizationItem.upsert({
  //               where: {
  //                 idRealizationItem: id,
  //               },
  //               update: {
  //                 ...item,
  //                 amount: item.amountSubmission,
  //                 createdBy: updateRealization.createdBy,
  //                 glAccountId: item.glAccountId,
  //               },
  //               create: {
  //                 ...item,
  //                 realizationId: id,
  //                 createdBy: updatedRealization.createdBy,
  //                 amount: item.amountSubmission,
  //               },
  //             });
  //           });

  //           // Use Promise.all to wait for all promises in the inner map
  //           return Promise.all(promises);
  //         }),
  //       );

  //       // Flatten the array of arrays into a single array of updated items
  //       const flattenedUpdatedItems = updatedItems.flat();

  //       console.log('Updated Items:', flattenedUpdatedItems);

  //       // Update file uploads
  //       const updatedUploadFiles = await Promise.all(
  //         updateUploadFiles.map(async (file: UpdateFileDto) => {
  //           const existingUploadFiles = await prisma.fileUpload.findMany({
  //             where: {
  //               tableId: updatedRealization.idRealization,
  //             },
  //           });

  //           const listProjectId: number[] = existingUploadFiles.map(
  //             (data) => data.idUpload,
  //           );

  //           // Use map instead of forEach and return the promise
  //           return listProjectId.map(async (id) => {
  //             return prisma.fileUpload.upsert({
  //               where: {
  //                 idUpload: id,
  //               },
  //               update: {
  //                 // Update the fields you need to change
  //                 docCategoryId: file.docCategoryId,
  //                 // ... other fields
  //               },
  //               create: {
  //                 ...file,
  //                 tableName: 'Realization',
  //                 tableId: updatedRealization.idRealization,
  //                 createdBy: updatedRealization.createdBy,
  //               },
  //             });
  //           });
  //         }),
  //       );

  //       // Flatten the array of promises
  //       const flattenedUpdatedUploadFiles = updatedUploadFiles.flat();

  //       // Wait for all promises to settle
  //       const results = await Promise.all(flattenedUpdatedUploadFiles);

  //       return {
  //         realization: {
  //           ...updatedRealization,
  //           realizationItems: updatedItems,
  //           uploadFiles: results,
  //         },
  //         meta: null,
  //         message: 'Realization updated successfully',
  //         status: HttpStatus.OK,
  //         time: new Date(),
  //       };
  //     } catch (error) {
  //       console.log(error.message);
  //       throw new HttpException(
  //         {
  //           data: null,
  //           meta: null,
  //           message: 'Failed to update realization',
  //           status: HttpStatus.INTERNAL_SERVER_ERROR,
  //           time: new Date(),
  //           error: error.message,
  //         },
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     }
  //   });
  // }

  // async uupdateRealization(
  //   id: number,
  //   updateRealization: UpdateRealizationDto,
  //   updateRealizationItems: UpdateRealizationItemDto[],
  //   updateUploadFiles: UpdateFileDto[],
  //   status?: StatusEnum,
  // ) {
  //   return this.prisma.$transaction(async (prisma) => {
  //     try {
  //       let statusTom: number = 1;
  //       let statusToTom: number = 2;
  //       let requestNumber: string | null = null;

  //       if (status && status == StatusEnum.PROGRESS) {
  //         statusTom = 2;
  //         statusToTom = 3;

  //         const year = new Date().getFullYear();
  //         const month = new Date().getMonth() + 1;
  //         requestNumber = `${month}/${year}`;
  //       }

  //       // Find existing realization
  //       const existingRealization = await prisma.realization.findUnique({
  //         where: {
  //           idRealization: id,
  //         },
  //       });

  //       if (!existingRealization) {
  //         throw new HttpException(
  //           {
  //             data: null,
  //             meta: null,
  //             message: 'Realization not found',
  //             status: HttpStatus.NOT_FOUND,
  //             time: new Date(),
  //           },
  //           HttpStatus.NOT_FOUND,
  //         );
  //       }

  //       // Update realization data
  //       const updatedRealization = await prisma.realization.update({
  //         where: {
  //           idRealization: id,
  //         },
  //         data: {
  //           years: new Date().getFullYear(),
  //           month: new Date().getMonth() + 1,
  //           requestNumber: requestNumber,
  //           taReff: updateRealization.taReff,
  //           responsibleNopeg: updateRealization.responsibleNopeg,
  //           titleRequest: updateRealization.titleRequest,
  //           noteRequest: updateRealization.noteRequest,
  //           department: updateRealization.department,
  //           personalNumber: updateRealization.personalNumber,
  //           departmentTo: updateRealization.departmentTo,
  //           personalNumberTo: updateRealization.personalNumberTo,
  //           createdBy: updateRealization.createdBy,
  //           status: status ? status : StatusEnum.OPEN,
  //           type: updateRealization.type,
  //           m_status_realization_id_statusTom_status: {
  //             connect: {
  //               idStatus: statusTom,
  //             },
  //           },
  //           m_status_realization_id_status_toTom_status: {
  //             connect: {
  //               idStatus: statusToTom,
  //             },
  //           },
  //           m_cost_center: {
  //             connect: {
  //               idCostCenter: updateRealization.costCenterId,
  //             },
  //           },
  //         },
  //       });

  //       // Update realization items
  //       const updatedItems = await Promise.all(
  //         updateRealizationItems.map(async (item: UpdateRealizationItemDto) => {
  //           const existingRealizationItem =
  //             await prisma.realizationItem.findMany({
  //               where: {
  //                 realizationId: id,
  //               },
  //             });
  //           console.log(existingRealizationItem);

  //           const listProjectId2: number[] = existingRealizationItem.map(
  //             (data) => data.idRealizationItem,
  //           );

  //           return listProjectId2.forEach((itemId) => {
  //             prisma.realizationItem.upsert({
  //               where: {
  //                 idRealizationItem: itemId,
  //               },
  //               update: {
  //                 ...item,
  //                 amount: item.amountSubmission,
  //               },
  //               create: {
  //                 ...item,
  //                 realizationId: id,
  //                 createdBy: updatedRealization.createdBy,
  //               },
  //             });
  //           });
  //         }),
  //       );

  //       // Update file uploads
  //       const updatedUploadFiles = await Promise.all(
  //         updateUploadFiles.map(async (file: UpdateFileDto) => {
  //           const existingUploadFiles = await prisma.fileUpload.findMany({
  //             where: {
  //               tableId: id,
  //             },
  //           });

  //           const listProjectId: number[] = existingUploadFiles.map(
  //             (data) => data.tableId,
  //           );

  //           return listProjectId.forEach((existingFile) =>
  //             prisma.fileUpload.upsert({
  //               where: {
  //                 idUpload: existingFile,
  //               },
  //               update: {
  //                 docCategoryId: file.docCategoryId,
  //               },
  //               create: {
  //                 tableName: 'Realization',
  //                 tableId: id,
  //                 createdBy: updatedRealization.createdBy,
  //                 docCategoryId: file.docCategoryId,
  //                 docName: file.docName,
  //                 docSize: file.docSize,
  //                 docLink: file.docLink,
  //                 docType: file.docType,
  //               },
  //             }),
  //           );

  //           // return Promise.all(updatePromises);
  //         }),
  //       );

  //       return {
  //         realization: {
  //           ...updatedRealization,
  //           realizationItems: updatedItems,
  //           uploadFiles: updatedUploadFiles,
  //         },
  //         meta: null,
  //         message: 'Realization updated successfully',
  //         status: HttpStatus.OK,
  //         time: new Date(),
  //       };
  //     } catch (error) {
  //       console.error(error);
  //       throw new HttpException(
  //         {
  //           data: null,
  //           meta: null,
  //           message: 'Failed to update realization',
  //           status: HttpStatus.INTERNAL_SERVER_ERROR,
  //           time: new Date(),
  //           error: error.message,
  //         },
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     }
  //   });
  // }

  async available(glAccountId: number, costCenterId: number) {
    try {
      // amount from realization and realization items
      const realizationItems = await this.prisma.realizationItem.findMany({
        where: {
          realization: {
            costCenterId: costCenterId,
            statusId: {
              not: 1,
            },
            status: {
              not: StatusEnum.REJECT,
            },
          },
          m_gl_account: {
            idGlAccount: glAccountId,
          },
        },
        select: {
          amount: true,
        },
      });

      const amount = realizationItems.reduce(
        (sum, item) => sum + item.amount,
        0,
      );
      // plus minus from budget reallocation
      const budgetReallocation = await this.prisma.budgetReallocation.findFirst(
        {
          where: {
            costCenterId: costCenterId,
            glAccountId: glAccountId,
          },
          include: {
            mGlAccount: true,
          },
        },
      );
      const budgetReallocationPlus = budgetReallocation
        ? budgetReallocation.plus
        : 0;
      const budgetReallocationMinus = budgetReallocation
        ? budgetReallocation.minus
        : 0;

      // total from budget
      const budget = await this.prisma.budget.findFirst({
        where: {
          glAccountId: glAccountId,
          costCenterId: costCenterId,
        },
        include: {
          mCostCenter: true,
          mGlAccount: true,
        },
      });

      if (!budgetReallocation && !budget) {
        throw new NotFoundException(
          `BudgetReallocation and Budget with GL Account ID ${glAccountId} and Cost Center ID ${costCenterId} not found`,
        );
      }

      const totalBudget = budget ? budget.total : 0;

      // Calculate the total amount
      const totalAvailable =
        totalBudget - amount + budgetReallocationPlus - budgetReallocationMinus;

      return {
        data: {
          available: totalAvailable,
          mGlAccount: budget.mGlAccount,
          mCostCenter: budget.mCostCenter,
        },
        meta: null,
        message: 'Successfully calculated available budget',
        status: HttpStatus.OK,
        time: new Date(),
      };
    } catch (error) {
      // Handle the error
      console.error(error);
      throw new NotFoundException('Error calculating total amount');
    }
  }
}
