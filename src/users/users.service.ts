import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MailerService } from '@nestjs-modules/mailer';
import * as crypto from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';
@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User) 
    private userRepo: Repository<User>,
    private readonly mailerService: MailerService,
  ) {}

  // 👇 ESTO SE EJECUTA AL INICIAR LA APP
  async onModuleInit() {
    const adminExists = await this.findOne('admin');
    // if (!adminExists) {
    //   console.log('⚡ Creando usuario Admin por defecto...');
    //   const passwordHash = await bcrypt.hash('Elpatiodelrock2026', 10); 
    //   const newAdmin = this.userRepo.create({
    //     username: 'admin',
    //     password: passwordHash,
    //     rol: 'admin'
    //   });
    //   await this.userRepo.save(newAdmin);
    //   console.log('✅ Admin creado: User: admin | Pass: Elpatiodelrock2026');
    // }
  }

  async findOne(username: string): Promise<User | null> {
    return this.userRepo.findOneBy({ username }) || null;
  }
  async findById(id: string): Promise<User> {
  const user = await this.userRepo.findOne({
    where: { id },
    select: ['id', 'username', 'rol', 'recoveryEmail', 'createdAt']
  });

  if (!user) {
    throw new NotFoundException('El usuario ya no existe en la base de datos');
  }

  return user;
}
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (dto.username) user.username = dto.username;
    if (dto.recoveryEmail) user.recoveryEmail = dto.recoveryEmail;
    
    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    return await this.userRepo.save(user);
  }

  async forgotPassword(username: string) {
    const user = await this.userRepo.findOneBy({ username });
    if (!user || !user.recoveryEmail) {
      throw new NotFoundException('No hay un email de recuperación asociado a este usuario');
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); 
    await this.userRepo.save(user);
    const baseUrl = process.env.PASSWORD_RESET_URL
    const resetUrl = `${baseUrl}?token=${token}`;
    
    await this.mailerService.sendMail({
      to: user.recoveryEmail,
      subject: 'Recuperar Contraseña - El Patio del Rock',
      template: 'recovery',
      context: {
        username: user.username,
        url: resetUrl,
      },
    });

    return {
      message: 'Email enviado con éxito',
      emailHint: this.obfuscateEmail(user.recoveryEmail),
    };
  }
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepo.findOne({
      where: {
        resetPasswordToken: dto.token,
        resetPasswordExpires: MoreThan(new Date()), // Que no esté vencido
      },
    });

    if (!user) {
      throw new BadRequestException('El token es inválido o ha expirado');
    }

    // Actualizamos clave y limpiamos tokens
    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepo.save(user);
    return { message: 'Contraseña actualizada correctamente' };
  }
  private obfuscateEmail(email: string): string {
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `*@${domain}`;
    return `${name[0]}${'*'.repeat(name.length - 2)}${name.slice(-1)}@${domain}`;
  }
}