import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from './entities/appconfig.entity';
import { UpdateConfigDto } from './dto/update-appconfig.dto';

@Injectable()
export class AppConfigService {
  constructor(
    @InjectRepository(AppConfig)
    private readonly configRepo: Repository<AppConfig>,
  ) {}

  // Busca la config única o la crea con valores por defecto
  async getOrCreateConfig(): Promise<AppConfig> {
    let config = await this.configRepo.findOne({ where: { id: 1 } });
    
    if (!config) {
      config = this.configRepo.create({
        id: 1,
        rules: [
          'Puntualidad: Abrimos puertas 30 min antes.',
          'Consumo: Mínimo una bebida por persona.',
          'Ubicación: Por orden de llegada.'
        ],
        contactEmail: 'reservas@elpatiodelrock.com',
        address: 'Av Fontana y Perito Moreno, Trevelin'
      });
      await this.configRepo.save(config);
    }
    
    return config;
  }

  async updateConfig(dto: UpdateConfigDto): Promise<AppConfig> {
    const config = await this.getOrCreateConfig();
    const updated = Object.assign(config, dto);
    return await this.configRepo.save(updated);
  }
}