import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Show } from 'src/show/entities/show.entity'; // Importá Show
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, Show]),
    forwardRef(() => PaymentsModule) 
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports:[ReservationsService]
})
export class ReservationsModule {}