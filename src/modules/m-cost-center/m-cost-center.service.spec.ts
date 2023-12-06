import { Test, TestingModule } from '@nestjs/testing';
import { MCostCenterService } from './m-cost-center.service';

describe('MCostCenterService', () => {
  let service: MCostCenterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MCostCenterService],
    }).compile();

    service = module.get<MCostCenterService>(MCostCenterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
