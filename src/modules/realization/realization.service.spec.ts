import { Test, TestingModule } from '@nestjs/testing';
import { RealizationService } from './realization.service';

describe('RealizationService', () => {
  let service: RealizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RealizationService],
    }).compile();

    service = module.get<RealizationService>(RealizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
