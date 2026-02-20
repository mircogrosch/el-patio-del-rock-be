import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Show } from './entities/show.entity';
import { Band } from 'src/band/entities/band.entity';
import { Repository } from 'typeorm';
import { MoreThanOrEqual } from 'typeorm';
import { MONTS_MAPS } from './constants/constants';
import { ReservationStatus } from 'src/reservations/entities/reservation.entity';

@Injectable()
export class ShowService {
  constructor(
    @InjectRepository(Show) private showRepository: Repository<Show>,
    @InjectRepository(Band) private bandRepository: Repository<Band>,
  ) {}
  async create(createShowDto: CreateShowDto) {
    const band = await this.bandRepository.findOneBy({
      id: createShowDto.bandId,
    });
    if (!band) throw new NotFoundException('La banda no existe');

    const newShow = this.showRepository.create({
      ...createShowDto,
      band,
    });
    return await this.showRepository.save(newShow);
  }

  async findAll(month?: string) {
    // 1. Obtenemos la fecha de "hoy" al inicio del día (00:00:00)
    // Esto asegura que si hoy hay un show a la noche, todavía aparezca.
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const query = this.showRepository
      .createQueryBuilder('show')
      .leftJoinAndSelect('show.band', 'band')
      .leftJoinAndSelect('show.reservations', 'reservations')
      // FILTRO CLAVE: Solo shows de hoy en adelante
      .where('show.date >= :today', { today })
      .orderBy('show.date', 'ASC');

    if (month) {
      const monthNumber = MONTS_MAPS[month.toUpperCase()];
      if (monthNumber) {
        query.andWhere('EXTRACT(MONTH FROM show.date) = :monthNumber', {
          monthNumber,
        });
      }
    }

    const shows = await query.getMany();
    return shows.map(show => this.mapShowResponse(show)); 
  }
  async findUpcoming() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const shows = await this.showRepository.find({
      where: {
        date: MoreThanOrEqual(today),
      },
      relations: ['band', 'reservations'],
      order: {
        date: 'ASC',
      },
      take: 4, 
    });

     return shows.map(show => this.mapShowResponse(show));
  }

  async findAvailableMonths() {
    try {
      const rawMonths = await this.showRepository
        .createQueryBuilder('show')
        .select("DATE_TRUNC('month', show.date)", 'month_val')
        .distinct(true)
        .orderBy("DATE_TRUNC('month', show.date)", 'ASC')
        .getRawMany();

      if (!rawMonths || rawMonths.length === 0) return [];

      return rawMonths
        .map((item) => {
          const date = new Date(item.month_val);
          if (isNaN(date.getTime())) return null;
          return date
            .toLocaleString('es-AR', {
              month: 'short',
              timeZone: 'UTC',
            })
            .toUpperCase()
            .replace('.', '');
        })
        .filter(Boolean);
    } catch (error) {
      console.error('Error en la query de meses:', error);
      throw error;
    }
  }
  async findAllByBand(bandId: number) {
    const shows= await this.showRepository.find({
      where: {
        band: { id: bandId },
        date: MoreThanOrEqual(new Date())
      },
      order: {
        date: 'ASC', 
      },
      relations: ['band', 'reservations']
    });
    return shows.map(show => this.mapShowResponse(show));
  }
  private mapShowResponse(show: Show) {
    const occupied = show.reservations?.reduce((acc, res) => {
    // Reservamos el lugar tanto para los que ya pagaron 
    // como para los que están en el proceso (PENDING)
    if (
      res.status === ReservationStatus.PAID ||
      res.status === ReservationStatus.PENDING
    ) {
      return acc + res.spots;
    }
    return acc;
  }, 0) || 0;
    
    const dateObj = new Date(show.date);

    return {
      id: show.id,
      month: dateObj
        .toLocaleString('es-AR', { month: 'short', timeZone: 'UTC' })
        .toUpperCase()
        .replace('.', ''),
      date: dateObj.getUTCDate().toString().padStart(2, '0'),
      fullDate: dateObj,
      band: show.band.name,
      genre: show.band.genre,
      description: show.band.description,
      imageMobile: show.band.imgMobile,
      imageDekstop: show.band.imgDesktop,
      time: `${show.startTime} — ${show.endTime}`, 
      availableSpots: show.capacity - occupied,
      price: show.price,
      bandId:show.band.id
    };
  }

  async findOne(id: number) {
    const show = this.showRepository.findOneBy({ id });
    if (!show) throw new NotFoundException(`El show con ${id} no existe`);
    return show;
  }

  async update(id: number, updateShowDto: CreateShowDto) {
   // 1. Buscamos el show
  const show = await this.showRepository.findOne({ 
    where: { id },
    relations: ['band'] 
  });
  if (!show) throw new NotFoundException('Show no encontrado');

  // 2. Si cambian la banda, buscamos la nueva
  if (updateShowDto.bandId) {
    const band = await this.bandRepository.findOneBy({ id: updateShowDto.bandId });
    if (!band) throw new NotFoundException('La nueva banda no existe');
    show.band = band;
  }

  // 3. Pisamos el resto de los campos
  Object.assign(show, updateShowDto);

  return await this.showRepository.save(show);
  }

  async remove(id: number) {
    const show = await this.showRepository.findOne({
      where: { id },
      relations: ['reservations'],
    });
    if (!show) throw new NotFoundException('Show no encontrado');

    // Podríamos validar si tiene reservas antes de borrar
    if (show.reservations.length > 0) {
      // Opcional: Impedir borrar si ya hay gente anotada
    }

    return await this.showRepository.remove(show);
  }
}
