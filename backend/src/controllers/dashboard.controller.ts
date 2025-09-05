import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: '대시보드 통계 조회' })
  @ApiResponse({ status: 200, description: '대시보드 통계 반환' })
  async getDashboardStats() {
    return this.dashboardService.getStats();
  }

  @Get('budget')
  @ApiOperation({ summary: '예산 현황 조회' })
  @ApiResponse({ status: 200, description: '예산 사용 현황 반환' })
  async getBudgetOverview() {
    return this.dashboardService.getBudgetOverview();
  }
}