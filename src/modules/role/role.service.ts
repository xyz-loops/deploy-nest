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

    const apiSM_USER = `https://api.gmf-aeroasia.co.id/th/soev2/v2/employee/${SM_USER}?superior=true`;
    const dataSM_USER = await lastValueFrom(
      this.httpService.get(apiSM_USER, { headers }),
    );

    //SM TAB
    const SM_TAB = 533194;

    const apiSM_TAB = `https://api.gmf-aeroasia.co.id/th/soev2/v2/employee/${SM_TAB}`;
    const dataSM_TAB = await lastValueFrom(
      this.httpService.get(apiSM_TAB, { headers }),
    );

    //VP TA
    const VP_TA = 528127;

    const apiVP_TA = `https://api.gmf-aeroasia.co.id/th/soev2/v2/employee/${VP_TA}`;
    const dataVP_TA = await lastValueFrom(
      this.httpService.get(apiVP_TA, { headers }),
    );

    //SM_TXC
    const SM_TXC = 533195;

    const apiSM_TXC = `https://api.gmf-aeroasia.co.id/th/soev2/v2/employee/${SM_TXC}`;
    const dataSM_TXC = await lastValueFrom(
      this.httpService.get(apiSM_TXC, { headers }),
    );

    //VP TX
    const VP_TX = 532236;

    const apiVP_TX = `https://api.gmf-aeroasia.co.id/th/soev2/v2/employee/${VP_TX}`;
    const dataVP_TX = await lastValueFrom(
      this.httpService.get(apiVP_TX, { headers }),
    );

    const result2 = {
      ...result.body,
      vicePresident: dataSM_USER.data.body.personalSuperior,
      SM_TAB: dataSM_TAB.data.body,
      vicePresidentTA: dataVP_TA.data.body,
      SM_TXC: dataSM_TXC.data.body,
      vicePresidentTX: dataVP_TX.data.body,
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

    // console.log(result2);
    return result2;
  }

  async getName(personalNumber: string): Promise<RoleDto> {
    const apiUrl = `https://api.gmf-aeroasia.co.id/th/soev2/v2/employee/${personalNumber}`;
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

    return result.body.personalName;
  }
}
