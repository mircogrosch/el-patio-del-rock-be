import { Module } from '@nestjs/common';
import { AppConfigService } from './appconfig.service';
import { AppConfigController } from './appconfig.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from './entities/appconfig.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppConfig])],
  controllers: [AppConfigController],
  providers: [AppConfigService],
  exports: [AppConfigService]
})
export class AppconfigModule {}
