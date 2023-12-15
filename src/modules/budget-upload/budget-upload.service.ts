import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
//import { format } from 'date-fns';
import { ItemsBudgetUploadDto } from './dto/budget-upload.dto';
import { ExcelBudgetUploadService } from './excel-budget-upload.service';
import { ReadBudgetUploadSheetDto } from './dto/read-budget-upload.dto';
import { PrismaService } from 'src/core/service/prisma/prisma.service';
import { glAccount } from 'prisma/dummy-data';

@Injectable()
export class BudgetUploadService {
  constructor(
    private readonly excelService: ExcelBudgetUploadService,
    private readonly prisma: PrismaService,
  ) {
    BudgetUploadService?.name;
  }

  async convertBudgetUploadFromExcelToJson<T>(
    req: Request,
    //WriteResponseBase
  ): Promise<any> {
    try {
      const read = await this.excelService.readFormatExcel(req);
      // console.log(read);
      if (!read?.budgetUpload)
        throw new BadRequestException(
          'Failed to read Excel, sheetname invalid',
        );
      const items: ItemsBudgetUploadDto[] = read?.budgetUpload;
      const createdBy = req?.body?.createdBy;
      await this.prisma.budget.deleteMany();

      const results = await Promise.all(
        items?.map(async (item) => {
          const dataCostCenters = await this.prisma.mCostCenter.findMany({
            select: {
              idCostCenter: true,
            },
            where: {
              dinas: String(item.costCenterId),
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
            years: Number(item.years),
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

      const categories = Object.keys(groupedData).reduce((result, group) => {
        const categoryObject = convertToCategoryObject(
          group,
          groupedData[group],
          results,
        );

        const monthTotalKey = `month${group.replace(/\s+/g, '')}`;
        // Menghilangkan tingkat "details" dan menyertakan nilainya langsung
        result[group] = {
          total: categoryObject.total,
          [monthTotalKey]: categoryObject.monthTotal,
          ...categoryObject.details, // Menggabungkan nilai details langsung
        };

        return result;
      }, {});

      const DirectExpenses = {
        totalDirectExpenses: getTotalSum(results),
        monthDirectExpenses: getTotalSumByMonth(results),
      };

      return {
        DirectExpenses,
        ...categories,
      };
    } catch (error) {
      console.error;
      throw new BadRequestException(error.message || error.stack);
    }
  }

  async findAllRealization(queryParams: any) {
    try {
      // Dapatkan nilai filter dari queryParams
      const { years, costCenter, percentage } = queryParams;

      // Logika filter sesuai dengan kebutuhan
      let filter: any = {};
      if (years) {
        filter.years = +years; // konversi ke number jika diperlukan
      }
      if (costCenter) {
        filter.mCostCenter = { dinas: costCenter }; // konversi ke number jika diperlukan
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

      // Check if a percentage is provided and it is a valid number
      if (percentage && !isNaN(percentage)) {
        const multiplier = +percentage / 100; // Convert percentage to a multiplier
        // Multiply each entry in results1 by the specified percentage
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
          return months.reduce((result1, month, i) => {
            result1[month] = results1
              .filter((item) =>
                detail
                  ? item.mGlAccount.groupGl === group &&
                    item.mGlAccount.groupDetail === detail
                  : item.mGlAccount.groupGl === group,
              )
              .reduce((sum, item) => sum + (item[`value${i + 1}`] || 0), 0);
            return result1;
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
            results,
          );

          const monthTotalKey = `month${group.replace(/\s+/g, '')}`;
          // Menghilangkan tingkat "details" dan menyertakan nilainya langsung
          result[group] = {
            total: categoryObject.total,
            [monthTotalKey]: categoryObject.monthTotal,
            ...categoryObject.details, // Menggabungkan nilai details langsung
          };

          return result;
        }, {});

        const DirectExpenses = {
          totalDirectExpenses: getTotalSum(results1),
          monthDirectExpenses: getTotalSumByMonth(results1),
        };

        return {
          DirectExpenses,
          ...categories,
        };
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

          const monthTotalKey = `month${group.replace(/\s+/g, '')}`;
          // Menghilangkan tingkat "details" dan menyertakan nilainya langsung
          result[group] = {
            total: categoryObject.total,
            [monthTotalKey]: categoryObject.monthTotal,
            ...categoryObject.details, // Menggabungkan nilai details langsung
          };

          return result;
        }, {});

        const DirectExpenses = {
          totalDirectExpenses: getTotalSum(results),
          monthDirectExpenses: getTotalSumByMonth(results),
        };

        return {
          DirectExpenses,
          ...categories,
        };
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
}
