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

      await this.prisma.budget.deleteMany();

      const results = await Promise.all(
        items?.map(async (item) => {
          const dataCostCenters = await this.prisma.mCostCenter.findMany({
            select: {
              idCostCenter: true,
            },
            where: {
              bidang: String(item.costCenterId),
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
          };

          const prismaResult = await this.prisma.budget.create({
            data,
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

      const GroupGl = await this.prisma.mGlAccount.findMany({
        distinct: ['groupGl'],
      });
      const uniqueGroupGlValues = GroupGl.map((GroupGl) => GroupGl.groupGl);

      const GroupDetail = await this.prisma.mGlAccount.findMany({
        distinct: ['groupDetail'],
      });
      const uniqueGroupDetailValues = GroupDetail.map(
        (GroupDetail) => GroupDetail.groupDetail,
      );

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

      const MaterialExpenses = {
        totalMaterialExpenses: sumByGroup(results, uniqueGroupGlValues[0]),
        monthMaterialExpenses: sumByGroupAndMonth(
          results,
          uniqueGroupGlValues[0],
        ),
        ExpendableMaterial: {
          glAccount: getGlAccount(
            results,
            uniqueGroupGlValues[0],
            uniqueGroupDetailValues[0],
          ),
          totalExpendableMaterial: sumByGroup(
            results,
            uniqueGroupGlValues[0],
            uniqueGroupDetailValues[0],
          ),
          monthExpendableMaterial: sumByGroupAndMonth(
            results,
            uniqueGroupGlValues[0],
            uniqueGroupDetailValues[0],
          ),
        },
        RepairableMaterial: {
          glAccount: getGlAccount(
            results,
            uniqueGroupGlValues[0],
            uniqueGroupDetailValues[1],
          ),
          totalRepairableMaterial: sumByGroup(
            results,
            uniqueGroupGlValues[0],
            uniqueGroupDetailValues[1],
          ),
          monthRepairableMaterial: sumByGroupAndMonth(
            results,
            uniqueGroupGlValues[0],
            uniqueGroupDetailValues[1],
          ),
        },
      };

      const SubcontractExpenses = {
        totalSubcontractExpenses: sumByGroup(results, uniqueGroupGlValues[1]),
        monthSubcontractExpenses: sumByGroupAndMonth(
          results,
          uniqueGroupGlValues[1],
        ),
        RotablepartsSubcont: {
          glAccount: getGlAccount(
            results,
            uniqueGroupGlValues[1],
            uniqueGroupDetailValues[2],
          ),
          totalRotablepartsSubcont: sumByGroup(
            results,
            uniqueGroupGlValues[1],
            uniqueGroupDetailValues[2],
          ),
          monthRotablepartsSubcont: sumByGroupAndMonth(
            results,
            uniqueGroupGlValues[1],
            uniqueGroupDetailValues[2],
          ),
        },
        RepairablepartsSubcont: {
          glAccount: getGlAccount(
            results,
            uniqueGroupGlValues[1],
            uniqueGroupDetailValues[3],
          ),
          totalRepairablepartsSubcont: sumByGroup(
            results,
            uniqueGroupGlValues[1],
            uniqueGroupDetailValues[3],
          ),
          monthRepairablepartsSubcont: sumByGroupAndMonth(
            results,
            uniqueGroupGlValues[1],
            uniqueGroupDetailValues[3],
          ),
        },
      };

      const StaffExpenses = {
        totalStaffExpenses: sumByGroup(results, uniqueGroupGlValues[2]),
        monthStaffExpenses: sumByGroupAndMonth(results, uniqueGroupGlValues[2]),
        BaseSalary: {
          glAccount: getGlAccount(
            results,
            uniqueGroupGlValues[2],
            uniqueGroupDetailValues[4],
          ),
          totalBaseSalary: sumByGroup(
            results,
            uniqueGroupGlValues[2],
            uniqueGroupDetailValues[4],
          ),
          monthBaseSalary: sumByGroupAndMonth(
            results,
            uniqueGroupGlValues[2],
            uniqueGroupDetailValues[4],
          ),
        },
        Honorarium: {
          glAccount: getGlAccount(
            results,
            uniqueGroupGlValues[2],
            uniqueGroupDetailValues[5],
          ),
          totalHonorarium: sumByGroup(
            results,
            uniqueGroupGlValues[2],
            uniqueGroupDetailValues[5],
          ),
          monthHonorarium: sumByGroupAndMonth(
            results,
            uniqueGroupGlValues[2],
            uniqueGroupDetailValues[5],
          ),
        },
      };

      const CompanyAccommodation = {
        totalCompanyAccommodation: sumByGroup(results, uniqueGroupGlValues[3]),
        monthCompanyAccommodation: sumByGroupAndMonth(
          results,
          uniqueGroupGlValues[3],
        ),
        Travel: {
          glAccount: getGlAccount(
            results,
            uniqueGroupGlValues[3],
            uniqueGroupDetailValues[6],
          ),
          totalTravel: sumByGroup(
            results,
            uniqueGroupGlValues[3],
            uniqueGroupDetailValues[6],
          ),
          monthTravel: sumByGroupAndMonth(
            results,
            uniqueGroupGlValues[3],
            uniqueGroupDetailValues[6],
          ),
        },
        Transport: {
          glAccount: getGlAccount(
            results,
            uniqueGroupGlValues[3],
            uniqueGroupDetailValues[7],
          ),
          totalTransport: sumByGroup(
            results,
            uniqueGroupGlValues[3],
            uniqueGroupDetailValues[7],
          ),
          monthTransport: sumByGroupAndMonth(
            results,
            uniqueGroupGlValues[3],
            uniqueGroupDetailValues[7],
          ),
        },
      };

      const DepreciationAndAmortisation = {
        totalDepreciationAndAmortisation: sumByGroup(
          results,
          uniqueGroupGlValues[4],
        ),
        monthDepreciationAndAmortisation: sumByGroupAndMonth(
          results,
          uniqueGroupGlValues[4],
        ),
        RotablePart: {
          glAccount: getGlAccount(
            results,
            uniqueGroupGlValues[4],
            uniqueGroupDetailValues[8],
          ),
          totalRotablePart: sumByGroup(
            results,
            uniqueGroupGlValues[4],
            uniqueGroupDetailValues[8],
          ),
          monthRotablePart: sumByGroupAndMonth(
            results,
            uniqueGroupGlValues[4],
            uniqueGroupDetailValues[8],
          ),
        },
        Amortization: {
          glAccount: getGlAccount(
            results,
            uniqueGroupGlValues[4],
            uniqueGroupDetailValues[9],
          ),
          totalAmortization: sumByGroup(
            results,
            uniqueGroupGlValues[4],
            uniqueGroupDetailValues[9],
          ),
          monthAmortization: sumByGroupAndMonth(
            results,
            uniqueGroupGlValues[4],
            uniqueGroupDetailValues[9],
          ),
        },
      };

      const FacilityMaintenanceExpenses = {
        totalDepreciationAndAmortisation: sumByGroup(
          results,
          uniqueGroupGlValues[5],
        ),
        monthDepreciationAndAmortisation: sumByGroupAndMonth(
          results,
          uniqueGroupGlValues[5],
        ),
        MaintenanceandRepairHangar: {
          glAccount: getGlAccount(
            results,
            uniqueGroupGlValues[5],
            uniqueGroupDetailValues[10],
          ),
          totalMaintenanceandRepairHangar: sumByGroup(
            results,
            uniqueGroupGlValues[5],
            uniqueGroupDetailValues[10],
          ),
          monthMaintenanceandRepairHangar: sumByGroupAndMonth(
            results,
            uniqueGroupGlValues[5],
            uniqueGroupDetailValues[10],
          ),
        },
        MaintenanceandRepairHardware: {
          glAccount: getGlAccount(
            results,
            uniqueGroupGlValues[5],
            uniqueGroupDetailValues[11],
          ),
          totalMaintenanceandRepairHardware: sumByGroup(
            results,
            uniqueGroupGlValues[5],
            uniqueGroupDetailValues[11],
          ),
          monthMaintenanceandRepairHardware: sumByGroupAndMonth(
            results,
            uniqueGroupGlValues[5],
            uniqueGroupDetailValues[11],
          ),
        },
      };

      const RentalExpenses = {
        totalRentalExpenses: sumByGroup(results, uniqueGroupGlValues[6]),
        monthRentalExpenses: sumByGroupAndMonth(
          results,
          uniqueGroupGlValues[6],
        ),
        BuildingRental: {
          glAccount: getGlAccount(
            results,
            uniqueGroupGlValues[6],
            uniqueGroupDetailValues[12],
          ),
          totalBuildingRental: sumByGroup(
            results,
            uniqueGroupGlValues[6],
            uniqueGroupDetailValues[12],
          ),
          monthBuildingRental: sumByGroupAndMonth(
            results,
            uniqueGroupGlValues[6],
            uniqueGroupDetailValues[12],
          ),
        },
        ComponentRental: {
          glAccount: getGlAccount(
            results,
            uniqueGroupGlValues[6],
            uniqueGroupDetailValues[13],
          ),
          totalComponentRental: sumByGroup(
            results,
            uniqueGroupGlValues[6],
            uniqueGroupDetailValues[13],
          ),
          monthComponentRental: sumByGroupAndMonth(
            results,
            uniqueGroupGlValues[6],
            uniqueGroupDetailValues[13],
          ),
        },
      };

      const OtherOperatingExpenses = {
        totalOtherOperating: sumByGroup(results, uniqueGroupGlValues[7]),
        monthOtherOperating: sumByGroupAndMonth(
          results,
          uniqueGroupGlValues[7],
        ),
        ElectricityConsumption: {
          glAccount: getGlAccount(
            results,
            uniqueGroupGlValues[7],
            uniqueGroupDetailValues[14],
          ),
          totalElectricityConsumption: sumByGroup(
            results,
            uniqueGroupGlValues[7],
            uniqueGroupDetailValues[14],
          ),
          monthElectricityConsumption: sumByGroupAndMonth(
            results,
            uniqueGroupGlValues[7],
            uniqueGroupDetailValues[14],
          ),
        },
        Gas: {
          glAccount: getGlAccount(
            results,
            uniqueGroupGlValues[7],
            uniqueGroupDetailValues[15],
          ),
          totalGas: sumByGroup(
            results,
            uniqueGroupGlValues[7],
            uniqueGroupDetailValues[15],
          ),
          monthGas: sumByGroupAndMonth(
            results,
            uniqueGroupGlValues[7],
            uniqueGroupDetailValues[15],
          ),
        },
      };

      const DirectExpenses = {
        totalDirectExpenses: getTotalSum(results),
        monthDirectExpenses: getTotalSumByMonth(results),
      };

      return {
        DirectExpenses,
        MaterialExpenses,
        SubcontractExpenses,
        OtherOperatingExpenses,
        StaffExpenses,
        CompanyAccommodation,
        DepreciationAndAmortisation,
        FacilityMaintenanceExpenses,
        RentalExpenses,
        // results,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message || error.stack);
    }
  }
}
