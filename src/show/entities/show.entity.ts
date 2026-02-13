import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Band } from '../../band/entities/band.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity()
export class Show {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  startTime: string; // "20:00"

  @Column()
  endTime: string;   // "22:00"

  @Column()
  capacity: number;

  @Column()
  price: number

  @ManyToOne(() => Band, (band) => band.shows)
  band: Band;

  @OneToMany(() => Reservation, (reservation) => reservation.show)
  reservations: Reservation[];
}