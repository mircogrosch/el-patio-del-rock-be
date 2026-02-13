import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Show } from '../../show/entities/show.entity';

@Entity()
export class Band {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  genre: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  imgDesktop: string;
  @Column()
  imgMobile: string;
  @OneToMany(() => Show, (show) => show.band)
  shows: Show[];
}