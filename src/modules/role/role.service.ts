import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable, catchError, lastValueFrom, map, tap } from 'rxjs';
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

    // VP USER
    const VP_USER = result.body.seniorManager.personalNumber;

    const apiUrl2 = `https://api.gmf-aeroasia.co.id/th/soev2/v2/employee/${VP_USER}?superior=true`;
    const data2 = await lastValueFrom(
      this.httpService.get(apiUrl2, { headers }),
    );

    const result2 = {
      ...result.body,
      vicePresident: data2.data.body.personalSuperior,
    } as RoleDto;

    //result2.map(async);
    for (const role in RoleDto) {
      if (Object.prototype.hasOwnProperty.call(RoleDto, role))
        result2[role] ||= null;
    }

    //console.log(result2);
    return result2;
  }
}
