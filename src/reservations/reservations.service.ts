import { BadRequestException, forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { Repository, LessThan } from 'typeorm';
import { Show } from 'src/show/entities/show.entity';
import { PaymentsService } from 'src/payments/payments.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Raw } from 'typeorm';
@Injectable()
export class ReservationsService {
    private readonly logger = new Logger(ReservationsService.name);
    constructor(
      @Inject(forwardRef(() => PaymentsService))
      private mercadoPagoServices: PaymentsService,
      @InjectRepository(Reservation) private reservationRepository: Repository<Reservation>,
      @InjectRepository(Show) private showRepository: Repository<Show>
      
    ){}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCleanupPendingReservations() {
    this.logger.debug('Ejecutando limpieza de reservas pendientes expiradas...');

  const result = await this.reservationRepository.update(
    {
      status: ReservationStatus.PENDING,
      // Usamos Raw para que la consulta SQL sea: 
      // WHERE "createdAt" < NOW() - INTERVAL '15 minutes'
      createdAt: Raw((alias) => `${alias} < NOW() - INTERVAL '15 minutes'`),
    },
    {
      status: ReservationStatus.CANCELLED,
    },
  );

    if (result?.affected) {
      this.logger.log(`Se cancelaron ${result.affected} reservas por falta de pago.`);
    }
  }
  async create(createReservationDto: CreateReservationDto) {
    const show = await this.showRepository.findOne({
      where: { id: createReservationDto.showId },
      relations: ['reservations', 'band'],
    });

    if (!show) throw new NotFoundException('El show no existe');

    // Calculamos disponibilidad
    const occupied = show.reservations?.reduce((acc, res) => {
          // Contamos si está paga O si está pendiente (puedes sumar una lógica de tiempo aquí)
          if (
            res.status === ReservationStatus.PAID ||
            res.status === ReservationStatus.PENDING
          ) {
            return acc + res.spots;
          }
          return acc;
        }, 0) || 0;
    const available = show.capacity - occupied;

    // Validamos si hay lugar para los que pide el usuario
    if (createReservationDto.spots > available) {
      throw new BadRequestException(`Solo quedan ${available} lugares disponibles`);
    }

    const newReservation = this.reservationRepository.create({
      ...createReservationDto,
      show: show,
      status: ReservationStatus.PENDING
    });
    const newReservationSaved =  await this.reservationRepository.save(newReservation);
      const preferenceUrl = await this.mercadoPagoServices.createPreference({
        bandName: show.band.name,
        unitPrice: newReservationSaved.show.price,
        reservationId: newReservationSaved.id,
        customerEmail: createReservationDto.email,
        customerName: createReservationDto.customerName,
        quantity:1
      }) 
    return {checkoutUrl: preferenceUrl}
  }

  findAll() {
    return `This action returns all reservations`;
  }

  async findOne(id: number) {
    return await this.reservationRepository.findOne({
    where: { id },
    relations: ['show', 'show.band'], // Traemos el show y la banda asociada
  });
  }

  async updateStatus(id: string, status: ReservationStatus) {
  return await this.reservationRepository.update(id, { status });
}
  update(id:number, dto:UpdateReservationDto){
     return `This action update a #${id} reservation`;
  }
  remove(id: number) {
    return `This action removes a #${id} reservation`;
  }
}
