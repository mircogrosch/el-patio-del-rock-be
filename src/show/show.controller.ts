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
} from '@nestjs/common';
import { ShowService } from './show.service';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';

@Controller('show')
export class ShowController {
  constructor(private readonly showService: ShowService) {}

  @Post('create')
  create(@Body() createShowDto: CreateShowDto) {
    return this.showService.create(createShowDto);
  }

  @Get('shows')
  findAll(@Query('month') month?: string) {
    return this.showService.findAll(month);
  }
  @Get('upcoming')
  findUpcoming() {
    return this.showService.findUpcoming();
  }
  @Get('months')
  getAvailableMonths() {
    return this.showService.findAvailableMonths();
  }
  @Get('band/:bandId')
  async getShowsByBand(@Param('bandId', ParseIntPipe) bandId: number) {
    return this.showService.findAllByBand(bandId);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.showService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShowDto: UpdateShowDto) {
    return this.showService.update(+id, updateShowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.showService.remove(+id);
  }
}
