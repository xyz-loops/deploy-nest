import { Test, TestingModule } from '@nestjs/testing';
import { KursController } from './kurs.controller';
import { KursService } from './kurs.service';

describe('KursController', () => {
  let controller: KursController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KursController],
      providers: [KursService],
    }).compile();

    controller = module.get<KursController>(KursController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
