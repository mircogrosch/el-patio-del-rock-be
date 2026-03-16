import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from 'src/reservations/entities/reservation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation])],
  controllers: [ReportsController],
  providers: [ReportsService],
  
})
export class ReportsModule {}
