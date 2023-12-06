import { Test, TestingModule } from '@nestjs/testing';
import { MStatusController } from './m-status.controller';
import { MStatusService } from './m-status.service';

describe('MStatusController', () => {
  let controller: MStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MStatusController],
      providers: [MStatusService],
    }).compile();

    controller = module.get<MStatusController>(MStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
