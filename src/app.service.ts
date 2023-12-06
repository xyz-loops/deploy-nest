import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return ('<h1 style="text-align:center">API OPEX GMF AEROASIA</h1>');
  }
}
