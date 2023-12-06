import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalController } from './approval.controller';
import { ApprovalService } from './approval.service';

describe('ApprovalController', () => {
  let controller: ApprovalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApprovalController],
      providers: [ApprovalService],
    }).compile();

    controller = module.get<ApprovalController>(ApprovalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
