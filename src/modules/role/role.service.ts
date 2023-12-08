import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable, catchError, lastValueFrom, map, tap } from 'rxjs';

@Injectable()
export class RoleService {
  constructor(private readonly httpService: HttpService) {}

  private apiKey: string = '543C-EF0B-4137-A27F';

  async sample(createdBy: string, phase?: string): Promise<any> {
    const apiUrl = `https://api.gmf-aeroasia.co.id/th/soev2/v2/employee/${createdBy}/get-manager-and-sm`;
    const headers = {
      'x-api-key': this.apiKey,
    };

    let result;
    const data = await lastValueFrom(
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

    return {
      ...result.body,
      personalSuperior: data2.data.body.personalSuperior,
    };
  }
}
