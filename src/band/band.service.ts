import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Band } from './entities/band.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BandService {
  constructor(
    @InjectRepository(Band)
    private readonly bandRepository: Repository<Band>,
  ) {}
  async create(createBandDto: CreateBandDto) {
    const newBand = this.bandRepository.create(createBandDto);
    return await this.bandRepository.save(newBand);
  }

  async findAll() {
    return await this.bandRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number) {
    // Agregamos 'shows' a las relaciones
    const band = await this.bandRepository.findOne({
      where: { id },
      relations: ['shows'],
      order: {
        shows: {
          date: 'ASC', // Ordenamos los shows del más cercano al más lejano
        },
      },
    });

    if (!band) throw new NotFoundException(`La banda no existe`);
    return band;
  }

  async update(id: number, updateBandDto: UpdateBandDto) {
    const band = await this.findOne(id);
    const updatedBand = this.bandRepository.merge(band, updateBandDto);
    return await this.bandRepository.save(updatedBand);
  }

  async remove(id: number) {
    const band = await this.findOne(id);
    return await this.bandRepository.remove(band);
  }
}
