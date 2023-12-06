import { Test, TestingModule } from '@nestjs/testing';
import { MGlAccountController } from './m-gl-account.controller';
import { MGlAccountService } from './m-gl-account.service';

describe('MGlAccountController', () => {
  let controller: MGlAccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MGlAccountController],
      providers: [MGlAccountService],
    }).compile();

    controller = module.get<MGlAccountController>(MGlAccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
