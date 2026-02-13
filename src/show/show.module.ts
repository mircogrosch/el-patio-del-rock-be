// src/shows/show.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Show } from './entities/show.entity';
import { Band } from 'src/band/entities/band.entity'; // Importá la entidad Band
import { ShowService } from './show.service';
import { ShowController } from './show.controller';

@Module({
  imports: [
    // CLAVE: Tenés que pasarle TODAS las entidades que el servicio use
    TypeOrmModule.forFeature([Show, Band]) 
  ],
  controllers: [ShowController],
  providers: [ShowService],
})
export class ShowModule {}