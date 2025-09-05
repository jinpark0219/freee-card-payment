import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApprovalService } from '../services/approval.service';

export interface ApprovalRequest {
  approverId: string;
  approved: boolean;
  comment?: string;
}

export interface ApprovalQueryParams {
  status?: 'pending' | 'approved' | 'rejected';
  companyId?: string;
  employeeId?: string;
  limit?: number;
  offset?: number;
}

@Controller('approvals')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  /**
   * 승인 대기 목록 조회
   */
  @Get()
  async getPendingApprovals(@Query() query: ApprovalQueryParams) {
    return await this.approvalService.getPendingApprovals({
      status: query.status || 'pending',
      companyId: query.companyId,
      employeeId: query.employeeId,
      limit: query.limit || 20,
      offset: query.offset || 0,
    });
  }

  /**
   * 특정 지출의 승인 처리
   */
  @Post(':expenseId/approve')
  @HttpCode(HttpStatus.OK)
  async approveExpense(
    @Param('expenseId') expenseId: string,
    @Body() approvalData: ApprovalRequest,
  ) {
    return await this.approvalService.processApproval(expenseId, {
      ...approvalData,
      approved: true,
    });
  }

  /**
   * 특정 지출의 거절 처리
   */
  @Post(':expenseId/reject')
  @HttpCode(HttpStatus.OK)
  async rejectExpense(
    @Param('expenseId') expenseId: string,
    @Body() approvalData: ApprovalRequest,
  ) {
    return await this.approvalService.processApproval(expenseId, {
      ...approvalData,
      approved: false,
    });
  }

  /**
   * 일괄 승인 처리
   */
  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  async bulkApproval(@Body() bulkData: {
    expenseIds: string[];
    approverId: string;
    approved: boolean;
    comment?: string;
  }) {
    return await this.approvalService.processBulkApproval(bulkData);
  }

  /**
   * 승인 통계 조회
   */
  @Get('stats')
  async getApprovalStats(@Query('companyId') companyId: string) {
    return await this.approvalService.getApprovalStats(companyId);
  }

  /**
   * 승인자별 대기 건수 조회  
   */
  @Get('pending-counts')
  async getPendingCounts(@Query('companyId') companyId: string) {
    return await this.approvalService.getPendingCountsByApprover(companyId);
  }
}