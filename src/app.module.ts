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
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { DashboardModule } from './dashboard/dashboard.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AppconfigModule } from './appconfig/appconfig.module';
import { AppConfig } from './appconfig/entities/appconfig.entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Band, Show, Reservation, User, AppConfig],
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
      template: {
        dir: join(__dirname, 'mail/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    BandModule,
    ShowModule,
    ReservationsModule,
    SeedModule,
    PaymentsModule,
    AuthModule,
    UsersModule,
    DashboardModule,
    CloudinaryModule,
    AppconfigModule,
  ],
})
export class AppModule {}
