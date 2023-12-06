import { Test, TestingModule } from '@nestjs/testing';
import { MStatusService } from './m-status.service';

describe('MStatusService', () => {
  let service: MStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MStatusService],
    }).compile();

    service = module.get<MStatusService>(MStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
