import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { PrismaService } from 'src/core/service/prisma.service';
import { SortOrder } from '@elastic/elasticsearch/lib/api/types';
import * as countHelper from 'src/core/utils/counthelper';
import { RoleService } from '../role/role.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ReportService {
  httpService: HttpService;
  constructor(private readonly prisma: PrismaService,
    private readonly roleService: RoleService,) {}

  async getAllBudget(queryParams: any) {
    try {
      // Dapatkan nilai filter dari queryParams
      const { years, dinas } = queryParams;

      // Logika filter sesuai dengan kebutuhan
      let filter: any = {};
      if (years) {
        filter.years = +years; // konversi ke number jika diperlukan
      }
      if (dinas) {
        filter.mCostCenter = { dinas: dinas };
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

      if (!results || results.length === 0) {
        // const publicFinalResult = [
        //   {
        //     title: 'All Direct Expenses',
        //     total: 0,
        //     month: months.reduce((acc, month) => {
        //       acc[month] = 0;
        //       return acc;
        //     }, {}),
        //   },
        // ];
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

      const categories = Object.keys(groupedData).reduce((result, group) => {
        const categoryObject = convertToCategoryObject(
          group,
          groupedData[group],
          results,
        );

        // Menghilangkan tingkat "details" dan menyertakan nilainya langsung
        result[group] = {
          title: group,
          total: categoryObject.total,
          month: {
            ...categoryObject.monthTotal,
          },
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
              month: {
                ...subcategoryObject[subcategoryMonthTotalKey],
              },
            };
          }),
        };

        return result;
      }, {});

      const DirectExpenses = {
        title: 'All Direct Expenses',
        total: getTotalSum(results),
        month: getTotalSumByMonth(results),
      };

      const finalResult = [DirectExpenses, ...Object.values(categories)];

      return finalResult;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // NestJS will handle NotFoundException and send a 404 response
      }
      // Log the error or handle other types of errors
      throw new BadRequestException('Invalid request.'); // NestJS will handle BadRequestException and send a 400 response
    }
  }

  async getActualRealization(queryParams: any) {
    const { years, dinas } = queryParams;

    let filter: any = {};
    if (years) {
      filter.realization = { years: +years };
    }
    if (dinas) {
      filter.realization = {
        ...filter.realization,
        m_cost_center: {
          dinas: dinas,
        },
      };
    }

    const realizationItemData = await this.prisma.realizationItem.findMany({
      where: filter,
      include: {
        m_gl_account: true,
        realization: {
          include: {
            m_cost_center: {
              select: {
                costCenter: true,
                dinas: true,
              },
            },
          },
        },
      },
    });

    const groupedItems = {};

    realizationItemData.forEach((item) => {
      const realization = item.realization;

      if (!(realization.idRealization in groupedItems)) {
        groupedItems[realization.idRealization] = {
          years: realization.years,
          idCostCenter: realization.costCenterId,
          idGlAccount: item.glAccountId,
          total: 0,
          value1: 0,
          value2: 0,
          value3: 0,
          value4: 0,
          value5: 0,
          value6: 0,
          value7: 0,
          value8: 0,
          value9: 0,
          value10: 0,
          value11: 0,
          value12: 0,
          value13: null,
          value14: null,
          value15: null,
          value16: null,
          mGlAccount: {
            glAccount: item.m_gl_account.glAccount,
            groupGl: item.m_gl_account.groupGl,
            groupDetail: item.m_gl_account.groupDetail,
          },
          mCostCenter: {
            costCenter: realization.m_cost_center.costCenter,
            dinas: realization.m_cost_center.dinas,
          },
        };
      }

      // Accumulate the value based on the month
      groupedItems[realization.idRealization][`value${realization.month}`] +=
        item.amount;
      // Accumulate the totalValues
      groupedItems[realization.idRealization].total += item.amount;
    });

    const results = Object.values(groupedItems);

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

    const categories = Object.keys(groupedData).reduce((result, group) => {
      const categoryObject = convertToCategoryObject(
        group,
        groupedData[group],
        results,
      );

      // Menghilangkan tingkat "details" dan menyertakan nilainya langsung
      result[group] = {
        title: group,
        total: categoryObject.total,
        month: {
          ...categoryObject.monthTotal,
        },
        groupDetail: Object.keys(categoryObject.details).map((detail) => {
          const subcategoryObject = categoryObject.details[detail];
          const subcategoryMonthTotalKey = `month${detail.replace(/\s+/g, '')}`;

          return {
            title: detail,
            glNumber: subcategoryObject.glAccount,
            total: subcategoryObject.total,
            month: {
              ...subcategoryObject[subcategoryMonthTotalKey],
            },
          };
        }),
      };

      return result;
    }, {});

    const DirectExpenses = {
      title: 'All Direct Expenses',
      total: getTotalSum(results),
      month: getTotalSumByMonth(results),
    };

    const finalResult = [DirectExpenses, ...Object.values(categories)];

    return finalResult;
  }

  private getMonthAbbreviation(month: number): string {
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    if (month >= 1 && month <= 12) {
      return monthNames[month - 1];
    }
    return ''; // Return empty string for invalid months
  }

  private getMonthIndex(month: string): number | null {
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];

    const monthIndex = monthNames.findIndex(
      (m) => m.toLowerCase() === month.toLowerCase(),
    );
    return monthIndex !== -1 ? monthIndex + 1 : null;
  }

  async findRealizationFilter(
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
        // Cek apakah nilai month adalah angka atau nama bulan
        const monthIndex = this.getMonthIndex(month);
        if (monthIndex !== null) {
          filter.month = monthIndex;
        }
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
        filter.createdBy = requestBy; // konversi ke number jika diperlukan
      }
      if (responsibleOfRequest) {
        filter.responsibleNopeg = responsibleOfRequest;
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
      const personalReport = await Promise.all(
        realization.map(async (item) => {
          const totalAmount = item.realizationItem.reduce(
            (accumulator, currentItem) =>
              accumulator + (currentItem.amount || 0),
            0,
          );
          const responsible =
            item.createdBy !== null
              ? await this.roleService.getName(item.responsibleNopeg)
              : null;
          const requestBy =
            item.createdBy !== null
              ? await this.roleService.getName(item.createdBy)
              : null;

          return {
            idRealization: item.idRealization,
            dinas: item.m_cost_center.dinas,
            month: this.getMonthAbbreviation(item.month),
            years: item.years,
            requestNumber: item.requestNumber,
            typeSubmission: item.type,
            submissionValue: totalAmount,
            status: item.status,
            requestBy: requestBy !== null ? requestBy : null,
            responsibleOfRequest: responsible !== null ? responsible : null,
            description: item.titleRequest,
          };
        }),
      );

      const totalSubmissionValue = personalReport.reduce(
        (total, item) => total + item.submissionValue,
        0,
      );
      const totalItemsPerPage = isLastPage ? remainingItems : perPage;

      return {
        data: {
          totalSubmissionValue,
          data: personalReport,
        },
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
        throw new InternalServerErrorException('Must Using Parameters');
      }
    }
  }

  async groupingRequestBy() {
    try {
      const requestBy = await this.prisma.realization.findMany({
        distinct: ['createdBy'],
      });
      const uniqueRequestBy = requestBy.map((requestBy) => requestBy.createdBy);

      return {
        data: uniqueRequestBy,
        meta: null,
        message: 'RequestBy',
        status: HttpStatus.OK,
        time: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Failed to group RequestBy',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          time: new Date(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async groupingResponsibleNopeg() {
    try {
      const responsibleNopeg = await this.prisma.realization.findMany({
        distinct: ['responsibleNopeg'],
      });
      const uniqueResponsibleNopeg = responsibleNopeg.map(
        (responsibleNopeg) => responsibleNopeg.responsibleNopeg,
      );

      return {
        data: uniqueResponsibleNopeg,
        meta: null,
        message: 'RequestBy',
        status: HttpStatus.OK,
        time: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Failed to group RequestBy',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          time: new Date(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`;
  }

  remove(id: number) {
    return `This action removes a #${id} report`;
  }

  async create(createReportDto: CreateReportDto) {
    const allGlAccounts = await this.prisma.mGlAccount.findMany();
    const groupedData = countHelper.getGroupedData(allGlAccounts);
    console.log(allGlAccounts);
    return groupedData;
  }
}
