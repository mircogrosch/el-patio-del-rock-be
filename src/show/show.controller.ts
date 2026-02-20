import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ShowService } from './show.service';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';

@UseGuards(JwtAuthGuard,RolesGuard)
@Controller('show')
export class ShowController {
  constructor(private readonly showService: ShowService) {}

  @Roles('admin')
  @Post('create')
  create(@Body() createShowDto: CreateShowDto) {
    return this.showService.create(createShowDto);
  }

  @Public()
  @Get('shows')
  findAll(@Query('month') month?: string) {
    return this.showService.findAll(month);
  }

  @Public()
  @Get('upcoming')
  findUpcoming() {
    return this.showService.findUpcoming();
  }

  @Public()
  @Get('months')
  getAvailableMonths() {
    return this.showService.findAvailableMonths();
  }

  @Public()
  @Get('band/:bandId')
  async getShowsByBand(@Param('bandId', ParseIntPipe) bandId: number) {
    return this.showService.findAllByBand(bandId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.showService.findOne(+id);
  }

  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShowDto: CreateShowDto) {
    return this.showService.update(+id, updateShowDto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.showService.remove(+id);
  }
}
