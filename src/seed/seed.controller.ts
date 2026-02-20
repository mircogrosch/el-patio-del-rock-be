import { Controller, Post, UseGuards } from '@nestjs/common';
import { SeedService } from './seed.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Roles('admin')
  @Post('/')
  run() {
    return this.seedService.runSeed();
  }
}
