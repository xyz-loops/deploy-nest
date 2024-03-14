import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateReallocationDto } from './dto/create-reallocation.dto';
import { UpdateReallocationDto } from './dto/update-reallocation.dto';
import { PrismaService } from 'src/core/service/prisma.service';
import { SortOrder } from '@elastic/elasticsearch/lib/api/types';
import { RoleService } from '../role/role.service';
import {
  CreateRealizationDto,
  CreateRealizationItemDto,
} from '../realization/dto/create-realization.dto';
import { CreateFileDto } from '../realization/dto/create-file-upload.dto';
import { StatusEnum } from '@prisma/client';

@Injectable()
export class ReallocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleService: RoleService,
  ) {}

  async findAllWithPaginationAndFilter(
    page: number,
    order: string = 'asc',
    personalNumberTo: string,
    queryParams: any,
    isTAB: boolean,
    isTXC3: boolean,
    isTAP: boolean,
  ) {
    try {
      const perPage = 10;

      if (!['asc', 'desc'].includes(order.toLowerCase())) {
        throw new BadRequestException(
          'Invalid order parameter. Use "asc" or "desc".',
        );
      }

      // Filter logic
      const {
        taReff,
        requestNumber,
        dinas,
        typeOfReallocation,
        status,
        statusTo,
        departmentTo,
        entryDate,
        entryDateTo,
      } = queryParams;
      let filter: any = {};
      if (taReff) {
        filter.taReff = taReff; // konversi ke number jika diperlukan
      }
      if (requestNumber) {
        filter.requestNumber = requestNumber; // konversi ke number jika diperlukan
      }
      if (dinas) {
        filter.departmentTo = { startsWith: dinas };
      }
      if (typeOfReallocation) {
        filter.type = typeOfReallocation; // konversi ke number jika diperlukan
      }
      if (status) {
        filter.status = status;
      }
      if (statusTo) {
        if (statusTo === 'TAB') {
          filter.personalNumberTo = null;
        } else if (statusTo === 'TXC-3') {
          filter.personalNumberTo = null;
        } else {
          filter.personalNumberTo = statusTo;
        }
      }

      if (entryDate && entryDateTo) {
        const formattedEntryDate = new Date(entryDate)
          .toISOString()
          .split('T')[0];
        const formattedEntryDateTo = new Date(entryDateTo)
          .toISOString()
          .split('T')[0];
        filter.createdAt = {
          gte: new Date(formattedEntryDate), // gte: greater than or equal
          lte: new Date(formattedEntryDateTo + 'T23:59:59.999Z'), // lte: less than or equal
        };
      }

      let conditions: any;
      if (isTAB === true) {
        conditions = {
          ...filter,
          OR: [
            { personalNumberTo: personalNumberTo },
            { personalNumberTo: null, departmentTo: 'TAB' },
          ],
        };
      } else if (isTXC3 === true) {
        conditions = {
          ...filter,
          OR: [
            { personalNumberTo: personalNumberTo },
            { personalNumberTo: null, departmentTo: 'TXC-3' },
          ],
        };
      } else if (isTAP === true) {
        conditions = {
          ...filter,
          OR: [
            { personalNumberTo: personalNumberTo },
            { personalNumberTo: null, departmentTo: 'TAP' },
          ],
        };
      } else {
        conditions = {
          ...filter,
          personalNumberTo: personalNumberTo,
        };
      }

      // Count total items with applied filters
      const totalItems = await this.prisma.reallocation.count({
        where: conditions,
      });

      const skip = (page - 1) * perPage;

      // Determine the last available page
      const lastPage = Math.ceil(totalItems / perPage);

      // Check if the requested page exceeds the last available page
      if (page > lastPage) {
        return {
          data: [],
          meta: {
            currentPage: Number(page),
            totalItems,
            lastpage: lastPage,
            totalItemsPerPage: 0, // Set to 0 when the requested page exceeds the last available page
          },
          message: 'Pagination dashboard retrieved',
          status: HttpStatus.OK,
          time: new Date(),
        };
      }

      const realization = await this.prisma.realization.findMany({
        skip,
        take: perPage,
        orderBy: {
          createdAt: order.toLowerCase() as SortOrder,
        },
        where: conditions,
        include: {
          realizationItem: true,
        },
      });

      // const remainingItems = totalItems % perPage;
      const remainingItems = totalItems - skip;
      const isLastPage = page * perPage >= totalItems;

      const realizationData = await Promise.all(
        realization.map(async (realizationItem) => {
          const totalAmount = realizationItem.realizationItem.reduce(
            (accumulator, currentItem) =>
              accumulator + (currentItem.amount || 0),
            0,
          );
          const name =
            realizationItem.personalNumberTo !== null
              ? await this.roleService.getName(realizationItem.personalNumberTo)
              : null;

          return {
            idRealization: realizationItem.idRealization,
            taReff: realizationItem.taReff,
            requestNumber: realizationItem.requestNumber,
            typeOfLetter: realizationItem.typeOfLetter,
            entryDate: realizationItem.createdAt,
            amountSubmission: totalAmount,
            status: realizationItem.status,
            statusTo: name !== null ? name : null,
            departmentTo: realizationItem.departmentTo,
            description: realizationItem.titleRequest,
          };
        }),
      );

      const totalItemsPerPage = isLastPage ? remainingItems : perPage;

      return {
        data: realizationData,
        meta: {
          currentPage: Number(page),
          totalItems,
          lastpage: Math.ceil(totalItems / perPage),
          totalItemsPerPage: Number(totalItemsPerPage),
        },
        message: 'Pagination need approval retrieved',
        status: HttpStatus.OK,
        time: new Date(),
      };
    } catch (error) {
      // Handle errors
      if (error instanceof BadRequestException) {
        throw new BadRequestException(
          'Invalid filter parameters. ' + error.message,
        );
      } else {
        throw new InternalServerErrorException(
          'Internal Server Error: ' + error.message,
        );
      }
    }
  }

  async createReallocation(
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

          if (status && status == 'submit') {
            statusTom = 2;
            statusToTom = 4;

            roleAssignment = await this.roleService.getRole(
              createRealization.createdBy,
            );

            const kurs = await this.prisma.mKurs.findUnique({
              where: {
                years: new Date().getFullYear(),
              },
            });

            if (
              !(
                createRealization.type === 'PENGADAAN' &&
                realizationItems.reduce(
                  (sum, item) => sum + item.amountSubmission,
                  0,
                ) *
                  kurs.value >
                  10000000
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
              dtoRoleAssignment = null;
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
              department: realizationData.department,
              personalNumber: realizationData.personalNumber,
              departmentTo: roleAssignment?.seniorManager?.personalUnit || null,
              personalNumberTo:
                roleAssignment?.seniorManager?.personalNumber || null,
              createdBy: realizationData.createdBy,
              status: StatusEnum.OPEN,
              type: realizationData.type,
              roleAssignment: dtoRoleAssignment,
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
                  department: createdRealization.department,
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
          timeout: 600000,
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

  findAll() {
    return `This action returns all reallocation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reallocation`;
  }

  update(id: number, updateReallocationDto: UpdateReallocationDto) {
    return `This action updates a #${id} reallocation`;
  }

  remove(id: number) {
    return `This action removes a #${id} reallocation`;
  }
}
