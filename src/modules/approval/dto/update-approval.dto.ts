import { PartialType } from '@nestjs/mapped-types';
import { ApprovalDto } from './create-approval.dto';

export class UpdateApprovalDto extends PartialType(ApprovalDto) {}
