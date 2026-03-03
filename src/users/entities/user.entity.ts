import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string; 

  @Column()
  password: string; 
  
  @Column()
  rol: string;

  @Column({type:'varchar', unique: true, nullable: true })
  recoveryEmail: string; 

  @Column({type:'varchar', nullable: true, select: false })
  resetPasswordToken: string | null; 

  @Column({ type: 'timestamp', nullable: true, select: false })
  resetPasswordExpires: Date | null; 

  @CreateDateColumn()
  createdAt: Date;
}