import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Band } from './entities/band.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class BandService {
  constructor(
    @InjectRepository(Band)
    private readonly bandRepository: Repository<Band>,
    private cloudinaryService: CloudinaryService
  ) {}
 async create(createBandDto: CreateBandDto, file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadFile(file);
    const newBand = this.bandRepository.create({
      ...createBandDto,
      imgDesktop: result.secure_url, 
      imgMobile: result.secure_url,  
    });

    return await this.bandRepository.save(newBand);
  }

async findAll(query: { search?: string }) {
  const { search } = query;

  const queryBuilder = this.bandRepository
    .createQueryBuilder('band')
    .orderBy('band.name', 'ASC'); 

  if (search) {
    queryBuilder.andWhere('band.name ILike :search', { search: `%${search}%` });
  }

  return await queryBuilder.getMany();
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

 async update(id: number, updateBandDto: CreateBandDto, file?: Express.Multer.File) {
  const band = await this.bandRepository.findOneBy({ id });
  if (!band) throw new NotFoundException('Banda no encontrada');

  // Si viene un archivo nuevo, lo subimos a Cloudinary y pisamos la URL
  if (file) {
    const result = await this.cloudinaryService.uploadFile(file);
    band.imgDesktop = result.secure_url;
    band.imgMobile = result.secure_url;
  }

  Object.assign(band, updateBandDto);

  return await this.bandRepository.save(band);
}

  async remove(id: number) {
    const band = await this.findOne(id);
    return await this.bandRepository.remove(band);
  }
}
