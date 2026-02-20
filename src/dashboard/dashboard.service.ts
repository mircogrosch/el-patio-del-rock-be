import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from 'src/reservations/entities/reservation.entity';
import { Show } from 'src/show/entities/show.entity';
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

    // 1. Recaudación Total (Sólo reservas PAID)
    // Usamos QueryBuilder para multiplicar spots * precio del show
    const { totalRevenue } = await this.resRepo
      .createQueryBuilder('res')
      .leftJoin('res.show', 'show')
      .where('res.status = :status', { status: 'PAID' })
      .select('SUM(res.spots * show.price)', 'totalRevenue')
      .getRawOne();

    // 2. Reservas Activas (Total de personas que ya pagaron)
    const { totalSpots } = await this.resRepo
      .createQueryBuilder('res')
      .where('res.status = :status', { status: 'PAID' })
      .select('SUM(res.spots)', 'totalSpots')
      .getRawOne();

    // 3. Conteo de Shows próximos
    const upcomingShowsCount = await this.showRepo.count({
      where: { date: MoreThanOrEqual(today) }
    });

    // 4. Últimas 5 reservas para la lista rápida
    const latestReservations = await this.resRepo.find({
      relations: ['show', 'show.band'],
      order: { createdAt: 'DESC' },
      take: 5
    });

    // 5. Highlight: El show más cercano
    const nextShow = await this.showRepo.findOne({
      where: { date: MoreThanOrEqual(today) },
      relations: ['band', 'reservations'],
      order: { date: 'ASC' }
    });

    return {
      revenue: Number(totalRevenue) || 0,
      activeReservations: Number(totalSpots) || 0,
      upcomingShowsCount,
      latestReservations,
      nextShow: nextShow ? this.mapNextShow(nextShow) : null
    };
  }

  private mapNextShow(show: Show) {
    const occupied = show.reservations?.reduce((acc, r) => acc + r.spots, 0) || 0;
    return {
      bandName: show.band.name,
      availableSpots: show.capacity - occupied,
      id: show.id
    };
  }
}
