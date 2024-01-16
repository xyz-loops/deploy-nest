import {
  IsNumber,
  IsString,
  IsInt,
} from 'class-validator';
export class SavaSimulate {
  @IsInt()
  years: number;

  @IsInt()
  costCenterId: number;

  @IsNumber()
  simulationBudget: number;

  @IsString()
  createdBy: string;
}
