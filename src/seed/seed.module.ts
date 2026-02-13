// src/common/seed.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Band } from 'src/band/entities/band.entity';
import { Show } from 'src/show/entities/show.entity';
import { SeedController } from './seed.controller';
@Module({
  imports: [
    // CLAVE: El Seed necesita AMBOS repositorios para funcionar
    TypeOrmModule.forFeature([Band, Show]) 
  ],
  providers: [SeedService],
  controllers:[SeedController],
  exports: [SeedService], // Para que el main.ts lo pueda ver vía app.get()
})
export class SeedModule {}