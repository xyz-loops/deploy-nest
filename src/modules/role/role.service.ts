import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, tap } from 'rxjs';
import { RoleDto } from './dto/role.dto';
import { AllRoleDto } from '../realization/dto/create-realization.dto';

@Injectable()
export class RoleService {
  constructor(private readonly httpService: HttpService) {}

  private apiKey: string = '543C-EF0B-4137-A27F';

  async getRole(createdBy: string): Promise<RoleDto> {
    const apiUrl = `https://api.gmf-aeroasia.co.id/th/soev2/v2/employee/${createdBy}/get-manager-and-sm`;
    const headers = {
      'x-api-key': this.apiKey,
    };

    let result;

    await lastValueFrom(
      this.httpService.get(apiUrl, { headers }).pipe(
        tap((v) => {
          result = v.data;
        }),
      ),
    );

    // SM USER
    const SM_USER = result.body.seniorManager.personalNumber;

    const apiUrl2 = `https://api.gmf-aeroasia.co.id/th/soev2/v2/employee/${SM_USER}?superior=true`;
    const data2 = await lastValueFrom(
      this.httpService.get(apiUrl2, { headers }),
    );

    //SM TAB
    const SM_TAB = 533194;

    const apiUrl3 = `https://api.gmf-aeroasia.co.id/th/soev2/v2/employee/${SM_TAB}`;
    const data3 = await lastValueFrom(
      this.httpService.get(apiUrl3, { headers }),
    );

    //VP TA
    const VP_TA = 528127;

    const apiUrl4 = `https://api.gmf-aeroasia.co.id/th/soev2/v2/employee/${VP_TA}`;
    const data4 = await lastValueFrom(
      this.httpService.get(apiUrl4, { headers }),
    );

    //SM_TXC
    const SM_TXC = 533195;

    const apiUrl6 = `https://api.gmf-aeroasia.co.id/th/soev2/v2/employee/${SM_TXC}`;
    const data6 = await lastValueFrom(
      this.httpService.get(apiUrl6, { headers }),
    );

    //VP TX
    const VP_TX = 532236;

    const apiUrl7 = `https://api.gmf-aeroasia.co.id/th/soev2/v2/employee/${VP_TX}`;
    const data7 = await lastValueFrom(
      this.httpService.get(apiUrl7, { headers }),
    );

    const result2 = {
      ...result.body,
      vicePresident: data2.data.body.personalSuperior,
      SM_TAB: data3.data.body,
      vicePresidentTA: data4.data.body,
      SM_TXC: data6.data.body,
      vicePresidentTX: data7.data.body,
    } as RoleDto;

    for (const role in RoleDto) {
      if (Object.prototype.hasOwnProperty.call(RoleDto, role))
        result2[role] ||= null;
    }

    //console.log(result2);
    return result2;
  }

  async getUserData(personalNumberTo: string): Promise<RoleDto> {
    const apiUrl = `https://api.gmf-aeroasia.co.id/th/soev2/v2/employee/${personalNumberTo}`;
    const headers = {
      'x-api-key': this.apiKey,
    };

    let result;

    await lastValueFrom(
      this.httpService.get(apiUrl, { headers }).pipe(
        tap((v) => {
          result = v.data;
        }),
      ),
    );

    const result2 = {
      ...result.body,
    } as RoleDto;

    for (const role in RoleDto) {
      if (Object.prototype.hasOwnProperty.call(RoleDto, role))
        result2[role] ||= null;
    }

    //console.log(result2);
    return result2;
  }
}
