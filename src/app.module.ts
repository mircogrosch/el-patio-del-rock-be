// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BandModule } from './band/band.module';
import { ShowModule } from './show/show.module';
import { Band } from './band/entities/band.entity';
import { Show } from './show/entities/show.entity';
import { Reservation } from './reservations/entities/reservation.entity';
import { ReservationsModule } from './reservations/reservations.module';
import { SeedModule } from './seed/seed.module';
import { PaymentsModule } from './payments/payments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Band, Show, Reservation],
      synchronize: true, // ¡Ojo! Solo para desarrollo, crea las tablas automáticamente
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: process.env.SMTP_FROM,
      },
    }),
    BandModule,
    ShowModule,
    ReservationsModule,
    SeedModule,
    PaymentsModule,
  ],
})
export class AppModule {}
