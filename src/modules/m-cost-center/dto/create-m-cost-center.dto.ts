import {
          IsNotEmpty,
          IsString,
          IsBoolean,
          IsUUID,
          IsOptional,
          IsDateString,
        } from '@nestjs/class-validator';
        
        export class CreateMCostCenterDto {
          @IsNotEmpty()
          @IsString()
          costCenter: string;
        
          @IsString()
          description: string;
        
          @IsString()
          bidang: string;
        
          @IsString()
          dinas: string;
        
          @IsString()
          directorat: string;
        
          @IsString()
          groupDinas: string;
        
          @IsString()
          profitCenter: string;
        
          @IsBoolean()
          active: boolean;
        
          @IsString()
          createdBy: string;
        }
        