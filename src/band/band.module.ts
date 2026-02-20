// src/bands/band.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Band } from './entities/band.entity'; // Verificá la ruta
import { BandService } from './band.service';
import { BandController } from './band.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  // CLAVE: Esto registra el repositorio en este módulo
  imports: [TypeOrmModule.forFeature([Band]), CloudinaryModule], 
  controllers: [BandController],
  providers: [BandService],
  exports: [BandService], // Exportalo si ShowService lo va a usar después
})
export class BandModule {}