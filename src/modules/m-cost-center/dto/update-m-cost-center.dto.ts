import { PartialType } from '@nestjs/mapped-types';
import { CreateMCostCenterDto } from './create-m-cost-center.dto';

export class UpdateMCostCenterDto extends PartialType(CreateMCostCenterDto) {}
