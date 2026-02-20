import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Preference, MercadoPagoConfig, Payment } from 'mercadopago';
import { ConfigService } from '@nestjs/config';
import { ReservationsService } from 'src/reservations/reservations.service';
import { ReservationStatus } from 'src/reservations/entities/reservation.entity';
import { MailerService } from '@nestjs-modules/mailer';
import * as QRCode from 'qrcode';
@Injectable()
export class PaymentsService {
  private client: MercadoPagoConfig;
  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => ReservationsService))
    private reservationsService: ReservationsService,
    private readonly mailerService: MailerService,
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
    totalPrice:number
  ) {
    const qrCodeDataUrl = await QRCode.toDataURL(reservationId);
    await this.mailerService.sendMail({
  to: customerEmail,
  subject: `🤘 ¡Confirmado! Tu entrada para ${showName}`,
  html: `
    <div style="max-width: 500px; margin: 0 auto; font-family: 'Helvetica', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 30px; border: 1px solid #27272a;">
      
      <div style="text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="text-transform: uppercase; letter-spacing: -1px; margin: 0; font-size: 28px;">¡Estás <span style="color: #dc2626;">adentro</span>!</h1>
        <p style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Confirmación de Reserva #${reservationId}</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h2 style="margin: 0; font-size: 20px; color: #f4f4f5;">${showName}</h2>
        <p style="margin: 5px 0; color: #dc2626; font-weight: bold;">${showDate} — ${showTime} hs</p>
        <p style="margin: 0; color: #a1a1aa;">${spots} entradas — Total: $${totalPrice}</p>
      </div>

      <div style="background-color: #ffffff; padding: 20px; text-align: center; border-radius: 4px;">
        <img src="cid:ticket_qr" style="width: 200px; height: 200px;" />
        <p style="color: #0a0a0a; font-size: 10px; font-weight: bold; margin-top: 10px; text-transform: uppercase;">Presentá este código en la puerta</p>
      </div>

      <div style="margin-top: 30px; background-color: #18181b; padding: 20px; border-left: 4px solid #dc2626;">
        <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #dc2626;">Reglas de la Casa:</h3>
        <ul style="font-size: 12px; color: #d4d4d8; padding-left: 18px; line-height: 1.6;">
          <li><strong>Puntualidad:</strong> Abrimos puertas 30 min antes. Si el show arranca y no estás, podemos reasignar tu lugar.</li>
          <li><strong>Ubicación:</strong> Los asientos son por orden de llegada.</li>
          <li><strong>Cambios:</strong> No hay reembolsos. Podés cambiar tu fecha avisando con 24hs de antelación a <a href="mailto:reservas@elpatiodelrock.com" style="color: #dc2626;">nuestro mail</a>.</li>
          <li><strong>Consumo:</strong> Mínimo una bebida por persona durante el show.</li>
        </ul>
      </div>

      <div style="margin-top: 30px; text-align: center;">
        <p style="font-size: 10px; color: #52525b; text-transform: uppercase;">El Patio del Rock — Av Fontana y Perito Moreno, Trevelin Patagonia</p>
      </div>
    </div>
  `,
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
