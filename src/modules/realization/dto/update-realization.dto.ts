import { PartialType } from '@nestjs/mapped-types';
import { CreateRealizationDto } from './create-realization.dto';

export class UpdateRealizationDto extends PartialType(CreateRealizationDto) {}
