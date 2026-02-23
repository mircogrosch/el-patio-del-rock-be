import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Reservation,
  ReservationStatus,
} from 'src/reservations/entities/reservation.entity';
import { Show, ShowStatus } from 'src/show/entities/show.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Reservation) private resRepo: Repository<Reservation>,
    @InjectRepository(Show) private showRepo: Repository<Show>,
  ) {}

  async getStats() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    //  Recaudación Total (Sólo reservas PAID)
    const { totalRevenue } = await this.resRepo
      .createQueryBuilder('res')
      .leftJoin('res.show', 'show')
      .where('res.status = :status', { status: 'PAID' })
      .select('SUM(res.spots * show.price)', 'totalRevenue')
      .getRawOne();

    //  Reservas Activas (Total de personas que ya pagaron)
    const { totalSpots } = await this.resRepo
      .createQueryBuilder('res')
      .where('res.status = :status', { status: 'PAID' })
      .select('SUM(res.spots)', 'totalSpots')
      .getRawOne();

    // Conteo de Shows próximos (Solo los que están PUBLICADOS)
    const upcomingShowsCount = await this.showRepo.count({
      where: {
        date: MoreThanOrEqual(today),
        status: ShowStatus.PUBLICADO,
      },
    });

    //  Últimas 5 reservas
    const latestReservations = await this.resRepo.find({
      relations: ['show', 'show.band'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    //  El show más cercano
    const nextShow = await this.showRepo.findOne({
      where: {
        date: MoreThanOrEqual(today),
        status: ShowStatus.PUBLICADO,
      },
      relations: ['band', 'reservations'],
      order: { date: 'ASC' },
    });

    return {
      revenue: Number(totalRevenue) || 0,
      activeReservations: Number(totalSpots) || 0,
      upcomingShowsCount,
      latestReservations,
      nextShow: nextShow ? this.mapNextShow(nextShow) : null,
    };
  }

  private mapNextShow(show: Show) {
    const occupied = show.reservations
      ? show.reservations
          .filter((r) => r.status === ReservationStatus.PAID)
          .reduce((acc, r) => acc + r.spots, 0)
      : 0;

    return {
      id: show.id,
      bandName: show.band.name,
      genre: show.band.genre,
      date: show.date,
      startTime: show.startTime,
      endTime: show.endTime,
      price: show.price,
      capacity: show.capacity,
      occupiedSpots: occupied,
      availableSpots: show.capacity - occupied,
    };
  }
}
