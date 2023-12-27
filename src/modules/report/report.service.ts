import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { PrismaService } from 'src/core/service/prisma.service';
import { SortOrder } from '@elastic/elasticsearch/lib/api/types';
import { MCostCenter } from '../m-cost-center/entities/m-cost-center.entity';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  create(createReportDto: CreateReportDto) {
    return 'This action adds a new report';
  }

  async getAllBudget(queryParams: any) {
    try {
      // Dapatkan nilai filter dari queryParams
      const { years, costCenter } = queryParams;

      // Logika filter sesuai dengan kebutuhan
      let filter: any = {};
      if (years) {
        filter.years = +years; // konversi ke number jika diperlukan
      }
      if (costCenter) {
        filter.mCostCenter = { dinas: costCenter };
      }

      // Panggil metode prisma atau logika lainnya dengan filter
      const results = await this.prisma.budget.findMany({
        where: filter, // Apply the filter to the query
        include: {
          mGlAccount: {
            select: {
              idGlAccount: true,
              glAccount: true,
              groupGl: true,
              groupDetail: true,
            },
          },
          mCostCenter: {
            select: {
              idCostCenter: true,
              costCenter: true,
              dinas: true,
            },
          },
        },
      });

      if (!results || results.length === 0) {
        throw new NotFoundException(
          'No realizations found with the specified filter.',
        );
      }
      const allGlAccounts = await this.prisma.mGlAccount.findMany();
      const groupedData = allGlAccounts.reduce((result, glAccount) => {
        const { groupGl, groupDetail } = glAccount;

        if (!result[groupGl]) {
          result[groupGl] = [];
        }

        result[groupGl].push(groupDetail);

        return result;
      }, {});
      const uniqueGroupGlValues = Object.keys(groupedData);

      const months = [
        'JANUARI',
        'FEBRUARI',
        'MARET',
        'APRIL',
        'MEI',
        'JUNI',
        'JULI',
        'AGUSTUS',
        'SEPTEMBER',
        'OKTOBER',
        'NOVEMBER',
        'DESEMBER',
      ];

      function sumByGroup(results, group, detail = null) {
        return results
          .filter((item) =>
            detail
              ? item.mGlAccount.groupGl === group &&
                item.mGlAccount.groupDetail === detail
              : item.mGlAccount.groupGl === group,
          )
          .reduce((sum, item) => sum + item.total, 0);
      }
      function sumByGroupAndMonth(results, group, detail = null) {
        return months.reduce((result, month, i) => {
          result[month] = results
            .filter((item) =>
              detail
                ? item.mGlAccount.groupGl === group &&
                  item.mGlAccount.groupDetail === detail
                : item.mGlAccount.groupGl === group,
            )
            .reduce((sum, item) => sum + (item[`value${i + 1}`] || 0), 0);
          return result;
        }, {});
      }
      function getGlAccount(results, group, detail) {
        return results
          .filter(
            (item) =>
              item.mGlAccount.groupGl === group &&
              item.mGlAccount.groupDetail === detail,
          )
          .reduce((acc, item) => {
            // Anda dapat menyesuaikan nilai sesuai kebutuhan
            return parseInt(item.mGlAccount.glAccount);
          }, {});
      }
      function getTotalSum(results) {
        return uniqueGroupGlValues.reduce((total, group) => {
          const groupTotal = sumByGroup(results, group);
          return total + groupTotal;
        }, 0);
      }
      function getTotalSumByMonth(results) {
        return months.reduce((totalByMonth, month, i) => {
          totalByMonth[month] = uniqueGroupGlValues.reduce((sum, group) => {
            return sum + sumByGroupAndMonth(results, group)[month];
          }, 0);
          return totalByMonth;
        }, {});
      }

      //For Detail or Child or Nested
      const createCategoryObject = (group, detail, results) => {
        const monthTotalKey = `month${detail.replace(/\s+/g, '')}`;
        return {
          glAccount: getGlAccount(results, group, detail),
          total: sumByGroup(results, group, detail),
          [monthTotalKey]: sumByGroupAndMonth(results, group, detail),
        };
      };

      //For Parent
      const convertToCategoryObject = (group, details, results) => {
        const categoryObject = {
          total: sumByGroup(results, group),
          monthTotal: sumByGroupAndMonth(results, group),
          details: {},
        };

        details.forEach((detail) => {
          categoryObject.details[detail] = createCategoryObject(
            group,
            detail,
            results,
          );
        });
        return categoryObject;
      };

      const uniqueYears = await this.prisma.budget.findMany({
        distinct: ['years'],
        select: { years: true },
      });

      const transformedData = uniqueYears.map(async (year) => {
        const yearData = await this.prisma.budget.findMany({
          where: { years: year.years },
          include: {
            mGlAccount: {
              select: {
                idGlAccount: true,
                glAccount: true,
                groupGl: true,
                groupDetail: true,
              },
            },
            mCostCenter: {
              select: {
                idCostCenter: true,
                costCenter: true,
                dinas: true,
              },
            },
          },
        });

        const categories = Object.keys(groupedData).map((group) => {
          const categoryObject = convertToCategoryObject(
            group,
            groupedData[group],
            yearData,
          );

          return {
            title: group,
            total: categoryObject.total,
            month: { ...categoryObject.monthTotal },
            groupDetail: Object.keys(categoryObject.details).map((detail) => {
              const subcategoryObject = categoryObject.details[detail];
              const subcategoryMonthTotalKey = `month${detail.replace(
                /\s+/g,
                '',
              )}`;

              return {
                title: detail,
                glNumber: subcategoryObject.glAccount,
                total: subcategoryObject.total,
                month: { ...subcategoryObject[subcategoryMonthTotalKey] },
              };
            }),
          };
        });

        const DirectExpenses = {
          title: 'All Direct Expenses',
          total: getTotalSum(yearData),
          month: getTotalSumByMonth(yearData),
        };

        return {
          years: year.years,
          data: [DirectExpenses, ...categories],
        };
      });

      return { data: await Promise.all(transformedData) };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // NestJS will handle NotFoundException and send a 404 response
      }
      // Log the error or handle other types of errors
      throw new BadRequestException('Invalid request.'); // NestJS will handle BadRequestException and send a 400 response
    }
  }

  async findAllWithPaginationAndFilter(
    page: number,
    order: string = 'asc',
    queryParams: any,
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
        dinas,
        month,
        years,
        type,
        status,
        requestBy,
        responsibleOfRequest,
      } = queryParams;
      let filter: any = {};
      if (dinas) {
        filter.m_cost_center = { dinas: dinas };
      }
      if (month) {
        filter.month = +month;
      }
      if (years) {
        filter.years = +years; // konversi ke number jika diperlukan
      }
      if (type) {
        filter.type = type; // konversi ke number jika diperlukan
      }
      if (status) {
        filter.status = status;
      }
      if (requestBy) {
        filter.requestBy = requestBy; // konversi ke number jika diperlukan
      }
      if (responsibleOfRequest) {
        filter.responsibleOfRequest = responsibleOfRequest;
      }
      // Count total items with applied filters
      const totalItems = await this.prisma.realization.count({
        where: filter,
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
        where: filter,
        include: {
          m_cost_center: {
            select: {
              idCostCenter: true,
              costCenter: true,
              description: true,
              bidang: true,
              dinas: true,
              directorat: true,
              groupDinas: true,
              profitCenter: true,
              active: true,
            },
          },
          realizationItem: true,
        },
      });
      // const remainingItems = totalItems % perPage;
      const remainingItems = totalItems - skip;
      const isLastPage = page * perPage >= totalItems;
      const personalReport = realization.map((item) => {
        const totalAmount = item.realizationItem.reduce(
          (accumulator, currentItem) => accumulator + (currentItem.amount || 0),
          0,
        );

        return {
          idRealization: item.idRealization,
          dinas: item.m_cost_center.dinas,
          month: item.month,
          years: item.years,
          requestNumber: item.requestNumber,
          typeSubmission: item.type,
          submissionValue: totalAmount,
          status: item.status,
          requestBy: item.createdBy,
          responsibleOfRequest: item.responsibleNopeg,
          description: item.titleRequest,
        };
      });

      const totalSubmissionValue = personalReport.reduce(
        (total, item) => total + item.submissionValue,
        0,
      );
      const totalItemsPerPage = isLastPage ? remainingItems : perPage;

      return {
        data: {
          totalSubmissionValue,
          data: personalReport},
        meta: {
          currentPage: Number(page),
          totalItems,
          lastpage: Math.ceil(totalItems / perPage),
          // totalItemsPerPage: Number(isLastPage ? remainingItems : perPage),
          totalItemsPerPage: Number(totalItemsPerPage),
        },
        message: 'Pagination dashboard retrieved',
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

  findOne(id: number) {
    return `This action returns a #${id} report`;
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`;
  }

  remove(id: number) {
    return `This action removes a #${id} report`;
  }
}
