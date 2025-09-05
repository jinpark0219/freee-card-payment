import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BudgetService, MonthlyBudgetSummary } from '../services/budget.service';
import { Budget } from '../entities/budget.entity';

@ApiTags('budgets')
@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get(':month')
  @ApiOperation({ summary: '월별 예산 조회' })
  @ApiParam({ name: 'month', description: '조회할 월 (YYYY-MM)', example: '2025-09' })
  @ApiQuery({ name: 'companyId', required: false, description: '회사 ID', example: 'company-1' })
  @ApiResponse({ status: 200, description: '월별 예산 데이터' })
  async getBudgetsByMonth(
    @Param('month') month: string,
    @Query('companyId') companyId?: string
  ) {
    const budgetData = await this.budgetService.getBudgetsByMonth(month, companyId);
    return {
      success: true,
      data: budgetData
    };
  }

  @Post()
  @ApiOperation({ summary: '새 예산 생성' })
  @ApiResponse({ status: 201, description: '예산이 성공적으로 생성됨' })
  async createBudget(@Body() budgetData: Partial<Budget>) {
    const budget = await this.budgetService.createBudget(budgetData);
    return {
      success: true,
      data: budget
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '예산 수정' })
  @ApiParam({ name: 'id', description: '예산 ID' })
  @ApiResponse({ status: 200, description: '예산이 성공적으로 수정됨' })
  async updateBudget(@Param('id') id: string, @Body() budgetData: Partial<Budget>) {
    const budget = await this.budgetService.updateBudget(id, budgetData);
    return {
      success: true,
      data: budget
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '예산 삭제' })
  @ApiParam({ name: 'id', description: '예산 ID' })
  @ApiResponse({ status: 200, description: '예산이 성공적으로 삭제됨' })
  async deleteBudget(@Param('id') id: string) {
    await this.budgetService.deleteBudget(id);
    return {
      success: true,
      message: '예산이 성공적으로 삭제되었습니다'
    };
  }
}