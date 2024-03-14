import { Test, TestingModule } from '@nestjs/testing';
import { ReallocationService } from './reallocation.service';

describe('ReallocationService', () => {
  let service: ReallocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReallocationService],
    }).compile();

    service = module.get<ReallocationService>(ReallocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
