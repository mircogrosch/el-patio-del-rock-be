import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { BandService } from './band.service';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('band')
export class BandController {
  constructor(private readonly bandService: BandService) {}

  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createBandDto: CreateBandDto,
  ) {
    return this.bandService.create(createBandDto, file);
  }

  @Public()
  @Get()
  findAll(@Query('search') search?: string) {
    return this.bandService.findAll({ search });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bandService.findOne(+id);
  }
  @Roles('admin')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() updateBandDto: CreateBandDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.bandService.update(+id, updateBandDto, file);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bandService.remove(+id);
  }
}
