import { Test, TestingModule } from '@nestjs/testing';
import { BudgetUploadController } from './budget-upload.controller';
import { BudgetUploadService } from './budget-upload.service';

describe('BudgetUploadController', () => {
  let controller: BudgetUploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetUploadController],
      providers: [BudgetUploadService],
    }).compile();

    controller = module.get<BudgetUploadController>(BudgetUploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
