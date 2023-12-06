import { Test, TestingModule } from '@nestjs/testing';
import { RealizationController } from './realization.controller';
import { RealizationService } from './realization.service';

describe('RealizationController', () => {
  let controller: RealizationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RealizationController],
      providers: [RealizationService],
    }).compile();

    controller = module.get<RealizationController>(RealizationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
