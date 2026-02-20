import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 👇 ESTO SE EJECUTA AL INICIAR LA APP
  async onModuleInit() {
    const adminExists = await this.findOne('admin');
    if (!adminExists) {
      console.log('⚡ Creando usuario Admin por defecto...');
      const passwordHash = await bcrypt.hash('Elpatiodelrock2026', 10); // ⚠️ CAMBIA ESTA CLAVE LUEGO
      const newAdmin = this.usersRepository.create({
        username: 'admin',
        password: passwordHash,
        rol: 'admin'
      });
      await this.usersRepository.save(newAdmin);
      console.log('✅ Admin creado: User: admin | Pass: Elpatiodelrock2026');
    }
  }

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username }) || null;
  }
}