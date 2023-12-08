import { Test, TestingModule } from '@nestjs/testing';
import { MDocCategoryService } from './m-doc-category.service';

describe('MDocCategoryService', () => {
  let service: MDocCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MDocCategoryService],
    }).compile();

    service = module.get<MDocCategoryService>(MDocCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
