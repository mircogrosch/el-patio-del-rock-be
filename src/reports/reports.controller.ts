import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  async getRevenueReport(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportsService.generateRevenueReport(from, to);
  }
}