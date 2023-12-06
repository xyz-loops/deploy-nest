import { Test, TestingModule } from '@nestjs/testing';
import { BudgetUploadService } from './budget-upload.service';

describe('BudgetUploadService', () => {
  let service: BudgetUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BudgetUploadService],
    }).compile();

    service = module.get<BudgetUploadService>(BudgetUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
