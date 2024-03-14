import { Test, TestingModule } from '@nestjs/testing';
import { ReallocationController } from './reallocation.controller';
import { ReallocationService } from './reallocation.service';

describe('ReallocationController', () => {
  let controller: ReallocationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReallocationController],
      providers: [ReallocationService],
    }).compile();

    controller = module.get<ReallocationController>(ReallocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
