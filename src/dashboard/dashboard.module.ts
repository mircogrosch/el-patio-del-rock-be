
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Show } from '../show/entities/show.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, Show]) 
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}