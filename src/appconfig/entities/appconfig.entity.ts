import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('app_config')
export class AppConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', array: true }) 
  rules: string[];

  @Column({ default: 'reservas@elpatiodelrock.com' })
  contactEmail: string;

  @Column({ default: 'Av Fontana y Perito Moreno, Trevelin' })
  address: string;
}