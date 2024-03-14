import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
//import { format } from 'date-fns';
import { ItemsBudgetUploadDto } from './dto/budget-upload.dto';
import { ExcelBudgetUploadService } from './excel-budget-upload.service';
import { format, subMonths, addDays, addMonths } from 'date-fns';
import { ReadBudgetUploadSheetDto } from './dto/read-budget-upload.dto';
import { PrismaService } from 'src/core/service/prisma.service';
import { SavaSimulate } from './dto/save-simulate.dto';

@Injectable()
export class BudgetUploadService {
  constructor(
    private readonly excelService: ExcelBudgetUploadService,
    private readonly prisma: PrismaService,
  ) {
    BudgetUploadService?.name;
  }

  async convertBudgetUploadFromExcelToJson<T>(req: Request): Promise<any> {
    try {
      const read = await this.excelService.readFormatExcel(req);
      // console.log(read);

      if (!read?.budgetUpload)
        throw new BadRequestException(
          'Failed to read Excel, sheetname invalid',
        );
      const items: ItemsBudgetUploadDto[] = read?.budgetUpload;
      const years = req?.body?.years ? Number(req?.body?.years) : undefined;
      const createdBy = req?.body?.createdBy;
      // await this.prisma.budget.deleteMany();

      // Find existing data for the same years, costCenterId, and glAccountId
      const existingData = await this.prisma.budget.findMany({
        where: {
          years,
        },
      });

      // If existing data found, delete it
      if (existingData.length > 0) {
        await this.prisma.budget.deleteMany({
          where: {
            years,
          },
        });
      }

      const results = await Promise.all(
        items?.map(async (item) => {
          item.years = years;
          const dataCostCenters = await this.prisma.mCostCenter.findMany({
            select: {
              idCostCenter: true,
            },
            where: {
              costCenter: String(item.costCenterId),
            },
          });

          const dataGlAccount = await this.prisma.mGlAccount.findMany({
            select: {
              idGlAccount: true,
            },
            where: {
              glAccount: Number(item.glAccountId),
            },
          });

          const data = {
            years,
            costCenterId: Number(dataCostCenters?.[0]?.idCostCenter),
            glAccountId: Number(dataGlAccount?.[0]?.idGlAccount),
            total: parseFloat(
              String(
                item.value1 +
                  item.value2 +
                  item.value3 +
                  item.value4 +
                  item.value5 +
                  item.value6 +
                  item.value7 +
                  item.value8 +
                  item.value9 +
                  item.value10 +
                  item.value11 +
                  item.value12,
              ),
            ),
            value1: parseFloat(String(item.value1)),
            value2: parseFloat(String(item.value2)),
            value3: parseFloat(String(item.value3)),
            value4: parseFloat(String(item.value4)),
            value5: parseFloat(String(item.value5)),
            value6: parseFloat(String(item.value6)),
            value7: parseFloat(String(item.value7)),
            value8: parseFloat(String(item.value8)),
            value9: parseFloat(String(item.value9)),
            value10: parseFloat(String(item.value10)),
            value11: parseFloat(String(item.value11)),
            value12: parseFloat(String(item.value12)),
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: item.createdBy,
          };
          const prismaResult = await this.prisma.budget.create({
            data: {
              ...data,
              createdBy,
            },
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
          return prismaResult;
        }),
      );

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

      return await Promise.all(transformedData);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message || error.stack);
    }
  }

  async getAllBudget() {
    try {
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

  async getViewBudget(queryParams: any): Promise<any[]> {
    try {
      // Dapatkan nilai filter dari queryParams
      const { years, dinas, percentage } = queryParams;

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

      // Check if a percentage is provided and it is a valid number
      if (percentage && !isNaN(percentage)) {
        const multiplier = 1 - +percentage / 100; // Convert percentage to a multiplier
        // Multiply each entry in results by the specified percentage
        const results1 = results.map((item) => {
          const updatedValues = {};

          for (let i = 1; i <= 12; i++) {
            updatedValues[`value${i}`] = item[`value${i}`] * multiplier;
          }
          return {
            ...item,
            total: item.total * multiplier,
            ...updatedValues,
          };
        });

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

        function sumByGroup(results1, group, detail = null) {
          return results1
            .filter((item) =>
              detail
                ? item.mGlAccount.groupGl === group &&
                  item.mGlAccount.groupDetail === detail
                : item.mGlAccount.groupGl === group,
            )
            .reduce((sum, item) => sum + item.total, 0);
        }
        function sumByGroupAndMonth(results1, group, detail = null) {
          return months.reduce((result, month, i) => {
            result[month] = results1
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
        function getGlAccount(results1, group, detail) {
          return results1
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
        function getTotalSum(results1) {
          return uniqueGroupGlValues.reduce((total, group) => {
            const groupTotal = sumByGroup(results1, group);
            return total + groupTotal;
          }, 0);
        }
        function getTotalSumByMonth(results1) {
          return months.reduce((totalByMonth, month, i) => {
            totalByMonth[month] = uniqueGroupGlValues.reduce((sum, group) => {
              return sum + sumByGroupAndMonth(results1, group)[month];
            }, 0);
            return totalByMonth;
          }, {});
        }

        //For Detail or Child or Nested
        const createCategoryObject = (group, detail, results1) => {
          const monthTotalKey = `month${detail.replace(/\s+/g, '')}`;
          return {
            glAccount: getGlAccount(results1, group, detail),
            total: sumByGroup(results1, group, detail),
            [monthTotalKey]: sumByGroupAndMonth(results1, group, detail),
          };
        };

        //For Parent
        const convertToCategoryObject = (group, details, results1) => {
          const categoryObject = {
            total: sumByGroup(results1, group),
            monthTotal: sumByGroupAndMonth(results1, group),
            details: {},
          };

          details.forEach((detail) => {
            categoryObject.details[detail] = createCategoryObject(
              group,
              detail,
              results1,
            );
          });
          return categoryObject;
        };

        const categories = Object.keys(groupedData).reduce((result, group) => {
          const categoryObject = convertToCategoryObject(
            group,
            groupedData[group],
            results1,
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
          total: getTotalSum(results1),
          month: getTotalSumByMonth(results1),
        };

        const finalResult = [DirectExpenses, ...Object.values(categories)];

        return finalResult;
      } else {
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
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // NestJS will handle NotFoundException and send a 404 response
      } else {
        // Log the error or handle other types of errors
        throw new BadRequestException('Invalid request.'); // NestJS will handle BadRequestException and send a 400 response
      }
    }
  }

  async getActualRealization(queryParams: any): Promise<any[]> {
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
      const glNumber = getGlAccount(results, group, detail);
      return {
        glAccount:
          typeof glNumber === 'number' ||
          (typeof glNumber === 'object' && Object.keys(glNumber).length !== 0)
            ? glNumber
            : '-',
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

  //Belum benar
  async getBudgetAndActual(queryParams: any): Promise<any[]> {
    try {
      const budgetResults = await this.getViewBudget(queryParams);
      const actualResults = await this.getActualRealization(queryParams);

      // Menggabungkan hasil budget dan actual
      const mergedResults = budgetResults.map((budgetItem: any) => {
        const correspondingActualItem = actualResults.find(
          (actualItem: any) => actualItem.title === budgetItem.title,
        );

        if (correspondingActualItem) {
          return {
            ...budgetItem,
            actual: correspondingActualItem,
          };
        } else {
          return budgetItem;
        }
      });

      return mergedResults;
    } catch (error) {
      // Handle errors as needed
      throw error;
    }
  }

  async getRemainingTable(queryParams) {
    const budgetResults = await this.getViewBudget(queryParams);
    const actualResults = await this.getActualRealization(queryParams);

    // Hitung total sisa (remaining)
    const remainingTotal = budgetResults.map((budgetItem, index) => {
      const actualItem = actualResults[index];
      const remainingItem = {
        title: budgetItem.title,
        total: budgetItem.total - actualItem.total,
        month: {},
        groupDetail: {}, // Inisialisasi groupDetail kosong
      };

      // Hitung sisa untuk setiap bulan
      for (let month of Object.keys(budgetItem.month)) {
        remainingItem.month[month] =
          budgetItem.month[month] - actualItem.month[month];
      }

      // Hitung sisa untuk setiap groupDetail
      if (budgetItem.groupDetail) {
        for (let detail of Object.keys(budgetItem.groupDetail)) {
          // Pastikan actualItem juga memiliki groupDetail yang sesuai
          if (
            actualItem.groupDetail &&
            actualItem.groupDetail.hasOwnProperty(detail)
          ) {
            remainingItem.groupDetail[detail] =
              budgetItem.groupDetail[detail] - actualItem.groupDetail[detail];
          } else {
            // Jika actualItem tidak memiliki groupDetail yang sesuai, set nilai remaining menjadi 0
            remainingItem.groupDetail[detail] = budgetItem.groupDetail[detail];
          }
        }
      }

      return remainingItem;
    });

    return remainingTotal;
  }

  async countingRealization(queryParams) {
    // Dapatkan nilai filter dari queryParams
    const { groupGl, groupDetail } = queryParams;

    // Logika filter sesuai dengan kebutuhan
    let filter: any = {};
    if (groupGl) {
      filter.m_gl_account = { groupGl: groupGl }; // konversi ke number jika diperlukan
    }
    if (groupDetail) {
      filter.m_gl_account = { groupDetail: groupDetail };
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
          month: realization.month,
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
          status: realization.status,
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

    // Calculate MTD and YTD totals
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-based
    const currentYear = currentDate.getFullYear();

    let mtdTotal = 0;
    let ytdTotal = 0;

    results.forEach((entity: any) => {
      const entityMonth = entity.years === currentYear ? entity.month : null;
      const entityYear = entity.years;

      // Check if the entity status is not "REJECT"
      if (entity.status !== 'REJECT') {
        if (entityMonth === currentMonth && entityYear === currentYear) {
          // MTD calculation for the current month
          mtdTotal += entity.total;
        }

        if (entityYear === currentYear && entityMonth <= currentMonth) {
          // YTD calculation for the current year
          ytdTotal += entity.total;
        }
      }
    });

    return { ActualMTD: mtdTotal, ActualYTD: ytdTotal };
  }

  async countingBudget(queryParams) {
    // Dapatkan nilai filter dari queryParams
    const { groupGl, groupDetail, years } = queryParams;

    // Logika filter sesuai dengan kebutuhan
    let filter: any = {};
    if (groupGl) {
      filter.mGlAccount = { groupGl: groupGl };
    }
    if (groupDetail) {
      filter.mGlAccount = { groupDetail: groupDetail };
    }

    const result = await this.prisma.budget.findMany({
      where: filter,
      include: {
        mGlAccount: {
          select: {
            idGlAccount: true,
            groupDetail: true,
            groupGl: true,
          },
        },
      },
    });

    // Calculate MTD and YTD totals
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-based
    const currentYear = currentDate.getFullYear();

    let mtdTotal = 0;
    let ytdTotal = 0;
    let totalBudget = 0;

    result.forEach((budget) => {
      const budgetMonth = budget.years === currentYear ? currentMonth : null;
      const budgetYear = budget.years;

      if (budgetMonth === currentMonth && budgetYear === currentYear) {
        // MTD calculation for the current month
        mtdTotal += budget[`value${currentMonth}`] || 0; // Gunakan nilai kolom value sesuai dengan currentMonth
      }

      if (
        budgetYear === currentYear &&
        budgetMonth !== null &&
        budgetMonth <= currentMonth
      ) {
        // YTD calculation for the current year and months up to the current month
        for (let i = currentMonth; i >= 1; i--) {
          ytdTotal += budget[`value${i}`] || 0; // Akumulasi nilai kolom value dari bulan sekarang hingga bulan 1
        }
      }
      if (
        budgetYear === currentYear &&
        budgetMonth !== null &&
        budgetMonth <= currentMonth
      ) {
        // YTD calculation for the current year and months up to the current month
        totalBudget += budget.total;
      }
    });

    return {
      BudgetMTD: mtdTotal,
      BudgetYTD: ytdTotal,
      totalBudget: totalBudget,
    };
  }

  async calculateRemainingTotal(queryParams) {
    // Hitung actualYTD
    const actualYTDResult = await this.countingRealization(queryParams);

    // Hitung total budget untuk tahun yang diminta
    const budgetRemaining = await this.countingBudget(queryParams);

    // Hitung total sisa (remaining)
    const remainingTotal =
      budgetRemaining.totalBudget - actualYTDResult.ActualYTD;

    return remainingTotal;
  }

  async saveSimulate(saveSimulate: SavaSimulate) {
    try {
      const simulate = await this.prisma.simulation.create({
        data: saveSimulate,
      });
      return {
        data: simulate,
        meta: null,
        message: 'Document category created successfully',
        status: HttpStatus.CREATED,
        time: new Date(),
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Failed to create document category',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          time: new Date(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSimulationBudget() {
    const latestSimulation = await this.prisma.simulation.findFirst({
      orderBy: {
        createdAt: 'desc', // Assuming you want to order by createdAt in descending order
      },
      select: {
        years: true,
        costCenterId: true,
        simulationBudget: true,
      },
    });
    console.log(latestSimulation);
    const result = await this.prisma.simulation.findMany({});
  }
}
