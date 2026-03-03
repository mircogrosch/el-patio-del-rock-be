import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Preference, MercadoPagoConfig, Payment } from 'mercadopago';
import { ConfigService } from '@nestjs/config';
import { ReservationsService } from 'src/reservations/reservations.service';
import { ReservationStatus } from 'src/reservations/entities/reservation.entity';
import { MailerService } from '@nestjs-modules/mailer';
import * as QRCode from 'qrcode';
import {  AppConfigService } from 'src/appconfig/appconfig.service';
@Injectable()
export class PaymentsService {
  private client: MercadoPagoConfig;
  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => ReservationsService))
    private reservationsService: ReservationsService,
    private readonly mailerService: MailerService,
     @Inject(forwardRef(() => AppConfigService))
    private readonly appconfig: AppConfigService
  ) {
    this.client = new MercadoPagoConfig({
      accessToken: this.configService.get<string>('MP_ACCESS_TOKEN') as string,
    });
  }
  async createPreference(createPaymentDto: CreatePaymentDto) {
    const preference = new Preference(this.client);
    const body = {
      items: [
        {
          id: String(createPaymentDto.reservationId),
          title: `Entrada: ${createPaymentDto.bandName}`,
          quantity: 1,
          unit_price: createPaymentDto.unitPrice,
        },
      ],
      external_reference: String(createPaymentDto.reservationId),
      notification_url: this.configService.get<string>('NOTIFICACION_WEBHOOK_MP'),
    };
    const response = await preference.create({ body });
    return response.init_point;
  }

  async handleWebHook(paymentId: string) {
    try {
      const payment = new Payment(this.client);
      const data = await payment.get({ id: paymentId });
      if (data.status === 'approved') {
        const reservationId = data.external_reference;
        if (reservationId) {
          await this.reservationsService.updateStatus(
            reservationId,
            ReservationStatus.PAID,
          );
          const reservation = await this.reservationsService.findOne(
            Number(reservationId),
          );
          if (reservation) {
            await this.sendTicketEmail(
              reservation.email,
              String(reservation.id),
              reservation.show.band.name,
              reservation.spots,
              reservation.show.startTime,
              reservation.show.endTime,
              reservation.spots * reservation.show.price
            );
          }
        }
      }
    } catch (error) {
      console.error('Error procesando el webhook:', error);
    }
  }
private async sendTicketEmail(
  customerEmail: string,
  reservationId: string,
  showName: string,
  spots: number,
  showDate: string,
  showTime: string,
  totalPrice: number
) {

  const config = await this.appconfig.getOrCreateConfig();

  const qrCodeDataUrl = await QRCode.toDataURL(reservationId);

  await this.mailerService.sendMail({
    to: customerEmail,
    subject: `🤘 ¡Confirmado! Tu entrada para ${showName}`,
    template: 'ticket', 
    context: {
      reservationId,
      showName,
      showDate,
      showTime,
      spots,
      totalPrice,
      rules: config.rules,       
      contactEmail: config.contactEmail,
      address: config.address
    },
    attachments: [
      {
        filename: 'ticket-qr.png',
        content: qrCodeDataUrl.split('base64,')[1],
        encoding: 'base64',
        cid: 'ticket_qr',
      },
    ],
  });
}
  findAll() {
    return `This action returns all payments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
