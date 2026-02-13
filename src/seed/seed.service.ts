import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Band } from 'src/band/entities/band.entity';
import { Show } from 'src/show/entities/show.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Band) private bandRepo: Repository<Band>,
    @InjectRepository(Show) private showRepo: Repository<Show>,
  ) {}

async runSeed() {


  // 2. Creamos las Bandas (Panteón del Rock Nacional)
  const bands = await this.bandRepo.save([
    {
      name: 'Pappo\'s Blues',
      genre: 'Blues Rock',
      description: 'El Carpo vuelve a sonar en el patio. Una noche de blues local, guitarras pesadas y pura mística rockera.',
      imgDesktop: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?q=80&w=2070', // Guitarra Gibson
      imgMobile: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?q=80&w=1974',   // Close up cuerdas
    },
    {
      name: 'Divididos',
      genre: 'Rock / Funk',
      description: 'La aplanadora del rock. Un show potente con la energía única de Mollo y Arnedo en formato íntimo.',
      imgDesktop: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070', // Stage wide
      imgMobile: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?q=80&w=2076',   // Micrófono y luces
    },
    {
      name: 'Riff',
      genre: 'Hard Rock',
      description: 'Ruedas de metal y mucho cuero. El sonido más crudo y potente del heavy nacional aterriza en el escenario.',
      imgDesktop: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2070', // Black & White concert
      imgMobile: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2070',   // Crowd lights
    },
    {
      name: 'Los Tipitos',
      genre: 'Rock Nacional',
      description: 'Melodías clásicas y canciones que sabemos todos. El formato acústico ideal para una noche bajo las estrellas.',
      imgDesktop: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=1974', // Piano/Keys
      imgMobile: 'https://images.unsplash.com/photo-1514525253361-b83f859b73c0?q=80&w=1974',   // Atmosphere
    },
    {
      name: 'La Renga',
      genre: 'Hard Rock',
      description: 'El banquete llega al patio. Un recorrido por los himnos del barrio en una noche a puro sentimiento.',
      imgDesktop: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070', // Epic stage
      imgMobile: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070',   // Silhouette
    },
  ]);

  // 3. Creamos los Shows (Fechas de 2026)
  await this.showRepo.save([
    {
      date: new Date('2026-02-14'),
      startTime: '21:00',
      endTime: '23:30',
      capacity: 40,
      price: 12000,
      band: bands[0], // Pappo
    },
    {
      date: new Date('2026-02-21'),
      startTime: '22:00',
      endTime: '01:00',
      capacity: 80,
      price: 15000,
      band: bands[1], // Divididos
    },
    {
      date: new Date('2026-03-07'),
      startTime: '21:30',
      endTime: '00:00',
      capacity: 50,
      price: 11000,
      band: bands[2], // Riff
    },
    {
      date: new Date('2026-03-15'),
      startTime: '20:30',
      endTime: '23:00',
      capacity: 100,
      price: 9500,
      band: bands[3], // Los Tipitos
    },
    {
      date: new Date('2026-04-05'),
      startTime: '22:00',
      endTime: '02:00',
      capacity: 120,
      price: 18000,
      band: bands[4], // La Renga
    },
    {
      date: new Date('2026-05-10'),
      startTime: '21:00',
      endTime: '23:30',
      capacity: 70,
      price: 15000,
      band: bands[1], // Divididos (Vuelven en Mayo)
    },
  ]);

  return { message: '¡Database Seeded! 🤘 El Patio del Rock está listo con Pappo, Riff y más.' };
}
}