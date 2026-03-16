import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reservation, ReservationStatus } from '../reservations/entities/reservation.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
  ) {}

  async generateRevenueReport(from: string, to: string) {
    // 1. Buscamos las reservas en el rango y con estado CONFIRMED
    const reservations = await this.reservationRepo.find({
      where: {
        status: ReservationStatus.PAID,
        createdAt: Between(new Date(from), new Date(to)),
      },
      relations: ['show', 'show.band'],
    });

    // 2. Procesamos la data para el ranking de bandas
    const bandStats = new Map<number, any>();
    let totalRevenue = 0;
    let totalTickets = 0;

    reservations.forEach((res) => {
      const band = res.show.band;
      const revenue = res.spots * res.show.price;
      
      totalRevenue += revenue;
      totalTickets += res.spots;

      if (!bandStats.has(band.id)) {
        bandStats.set(band.id, {
          id: band.id,
          name: band.name,
          showCount: new Set().add(res.show.id).size,
          ticketsSold: 0,
          revenue: 0,
        });
      }

      const current = bandStats.get(band.id);
      current.ticketsSold += res.spots;
      current.revenue += revenue;
      // Usamos un Set para contar shows únicos de esa banda en el periodo
      current.shows = (current.shows || new Set()).add(res.show.id);
    });

    // 3. Formateamos la respuesta final
    const bandsArray = Array.from(bandStats.values()).map(b => ({
      ...b,
      showCount: b.shows.size,
      shows: undefined // Limpiamos el Set antes de enviar
    }));

    return {
      stats: {
        totalRevenue,
        totalTickets,
        averagePerShow: bandsArray.length > 0 ? totalRevenue / reservations.length : 0,
      },
      bands: bandsArray.sort((a, b) => b.revenue - a.revenue), // Ranking por guita
    };
  }
}