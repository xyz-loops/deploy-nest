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

  private async generateRequestNumber(idCostCenter: number): Promise<string> {
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
  private async generateDepartment(idCostCenter: number): Promise<string> {
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
        setTimeout(() => reject(new Error('Transaction timeout')), 600000),
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

            if (
              !(
                createRealization.type === 'PENGADAAN' &&
                realizationItems.reduce(
                  (sum, item) => sum + item.amountSubmission,
                  0,
                ) > 10000000
              )
            ) {
              dtoRoleAssignment = {
                employee: roleAssignment.employee,
                seniorManager: roleAssignment.seniorManager,
                vicePresident: roleAssignment.vicePresident,
                SM_TAB: roleAssignment.SM_TAB,
                vicePresidentTA: roleAssignment.vicePresidentTA,
                SM_TXC: roleAssignment.SM_TXC,
                vicePresidentTX: roleAssignment.vicePresidentTX,
                SM_TAP: null,
                DF: null,
              };
            } else {
              dtoRoleAssignment = this.mapRoleAssignment(roleAssignment);
            }
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
              //contributors: null,
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
          timeout: 600000, // default: 5000
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
