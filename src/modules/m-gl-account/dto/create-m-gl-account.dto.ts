import { IsNotEmpty, IsString, IsDecimal, IsBoolean } from '@nestjs/class-validator';

export class CreateMGlAccountDto {
  @IsNotEmpty()
  @IsDecimal()
  glAccount: number;

  @IsNotEmpty()
  @IsString()
  groupDetail: string;

  @IsNotEmpty()
  @IsString()
  groupGl: string;

  @IsBoolean()
  sap: boolean;

  @IsBoolean()
  active: boolean;

  @IsNotEmpty()
  @IsString()
  createdBy: string;
}
