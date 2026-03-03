import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AppConfigService } from './appconfig.service';
import { UpdateConfigDto } from './dto/update-appconfig.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('config')
export class AppConfigController {
  constructor(private readonly configService: AppConfigService) {}

  @Get()
  getConfig() {
    return this.configService.getOrCreateConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  updateConfig(@Body() updateConfigDto: UpdateConfigDto) {
    return this.configService.updateConfig(updateConfigDto);
  }
}