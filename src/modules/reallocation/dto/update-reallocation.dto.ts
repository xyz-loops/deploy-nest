import { PartialType } from '@nestjs/mapped-types';
import { CreateReallocationDto } from './create-reallocation.dto';

export class UpdateReallocationDto extends PartialType(CreateReallocationDto) {}
