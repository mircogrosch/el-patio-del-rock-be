import { Test, TestingModule } from '@nestjs/testing';
import { AppconfigService } from './appconfig.service';

describe('AppconfigService', () => {
  let service: AppconfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppconfigService],
    }).compile();

    service = module.get<AppconfigService>(AppconfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
