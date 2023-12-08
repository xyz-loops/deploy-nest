import { Test, TestingModule } from '@nestjs/testing';
import { MDocCategoryController } from './m-doc-category.controller';
import { MDocCategoryService } from './m-doc-category.service';

describe('MDocCategoryController', () => {
  let controller: MDocCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MDocCategoryController],
      providers: [MDocCategoryService],
    }).compile();

    controller = module.get<MDocCategoryController>(MDocCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
