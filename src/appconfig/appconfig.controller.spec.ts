import { Test, TestingModule } from '@nestjs/testing';
import { AppconfigController } from './appconfig.controller';
import { AppconfigService } from './appconfig.service';

describe('AppconfigController', () => {
  let controller: AppconfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppconfigController],
      providers: [AppconfigService],
    }).compile();

    controller = module.get<AppconfigController>(AppconfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
