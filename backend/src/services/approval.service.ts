import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessExpense, ExpenseStatus } from '../domains/business-expense/business-expense.entity';
import { BusinessCard } from '../domains/business-card/business-card.entity';
import { Employee } from '../entities/employee.entity';

export interface ApprovalData {
  approverId: string;
  approved: boolean;
  comment?: string;
}

export interface ApprovalQueryOptions {
  status: 'pending' | 'approved' | 'rejected';
  companyId?: string;
  employeeId?: string;
  limit: number;
  offset: number;
}

export interface BulkApprovalData {
  expenseIds: string[];
  approverId: string;
  approved: boolean;
  comment?: string;
}

@Injectable()
export class ApprovalService {
  constructor(
    @InjectRepository(BusinessExpense)
    private expenseRepository: Repository<BusinessExpense>,
    @InjectRepository(BusinessCard)
    private cardRepository: Repository<BusinessCard>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  /**
   * 승인 대기 목록 조회
   */
  async getPendingApprovals(options: ApprovalQueryOptions) {
    const queryBuilder = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.card', 'card')
      .leftJoinAndSelect('expense.employee', 'employee')
      .leftJoinAndSelect('expense.company', 'company')
      .orderBy('expense.transactionDate', 'DESC')
      .skip(options.offset)
      .take(options.limit);

    // 상태별 필터링
    if (options.status === 'pending') {
      queryBuilder.where('expense.status = :status', { status: ExpenseStatus.PENDING });
    } else if (options.status === 'approved') {
      queryBuilder.where('expense.status = :status', { status: ExpenseStatus.APPROVED });
    } else if (options.status === 'rejected') {
      queryBuilder.where('expense.status = :status', { status: ExpenseStatus.REJECTED });
    }

    // 회사별 필터링
    if (options.companyId) {
      queryBuilder.andWhere('expense.companyId = :companyId', { companyId: options.companyId });
    }

    // 직원별 필터링
    if (options.employeeId) {
      queryBuilder.andWhere('expense.employeeId = :employeeId', { employeeId: options.employeeId });
    }

    const [expenses, total] = await queryBuilder.getManyAndCount();

    // 승인자 정보 추가
    const expensesWithApprover = await Promise.all(
      expenses.map(async (expense) => {
        let approver = null;
        if (expense.approverId) {
          approver = await this.employeeRepository.findOne({
            where: { id: expense.approverId }
          });
        }

        return {
          ...expense,
          approver,
          // 위험도에 따른 우선순위 계산
          priority: this.calculatePriority(expense),
          // 일본 세무 관련 정보
          taxInfo: this.getTaxInfo(expense),
          // 정책 위반 정보
          violations: expense.policyViolations || [],
        };
      })
    );

    return {
      expenses: expensesWithApprover,
      total,
      hasMore: options.offset + options.limit < total,
      statistics: {
        pending: expenses.filter(e => e.status === ExpenseStatus.PENDING).length,
        highRisk: expenses.filter(e => e.riskScore > 0.7).length,
        overBudget: expenses.filter(e => e.amount > 100000).length, // 10만엔 이상
      }
    };
  }

  /**
   * 승인/거절 처리
   */
  async processApproval(expenseId: string, approvalData: ApprovalData) {
    const expense = await this.expenseRepository.findOne({
      where: { id: expenseId },
      relations: ['card', 'employee', 'company']
    });

    if (!expense) {
      throw new Error('지출 내역을 찾을 수 없습니다');
    }

    if (expense.status !== ExpenseStatus.PENDING) {
      throw new Error('이미 처리된 지출입니다');
    }

    // 승인자 권한 확인
    const approver = await this.employeeRepository.findOne({
      where: { id: approvalData.approverId }
    });

    if (!approver || !approver.canApprove) {
      throw new Error('승인 권한이 없습니다');
    }

    if (approver.approvalLimit && expense.amount > approver.approvalLimit) {
      throw new Error('승인 한도를 초과했습니다');
    }

    // 승인/거절 처리
    if (approvalData.approved) {
      expense.approve(approvalData.approverId, approvalData.comment);
    } else {
      expense.reject(approvalData.approverId, approvalData.comment || '거절됨');
    }

    const savedExpense = await this.expenseRepository.save(expense);

    // 후속 처리 (비동기)
    this.processApprovalAsync(savedExpense, approvalData.approved);

    return {
      ...savedExpense,
      approver,
    };
  }

  /**
   * 일괄 승인/거절 처리
   */
  async processBulkApproval(bulkData: BulkApprovalData) {
    const results = [];
    const errors = [];

    for (const expenseId of bulkData.expenseIds) {
      try {
        const result = await this.processApproval(expenseId, {
          approverId: bulkData.approverId,
          approved: bulkData.approved,
          comment: bulkData.comment,
        });
        results.push(result);
      } catch (error) {
        errors.push({
          expenseId,
          error: error.message,
        });
      }
    }

    return {
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  /**
   * 승인 통계 조회
   */
  async getApprovalStats(companyId: string) {
    const baseQuery = this.expenseRepository.createQueryBuilder('expense');
    
    if (companyId) {
      baseQuery.where('expense.companyId = :companyId', { companyId });
    }

    // 이번 달 통계
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyQuery = baseQuery.clone()
      .andWhere('expense.transactionDate >= :thisMonth', { thisMonth });

    const [
      totalPending,
      totalApproved,
      totalRejected,
      monthlyPending,
      monthlyApproved,
      monthlyRejected,
      highRiskCount,
    ] = await Promise.all([
      baseQuery.clone().andWhere('expense.status = :status', { status: ExpenseStatus.PENDING }).getCount(),
      baseQuery.clone().andWhere('expense.status = :status', { status: ExpenseStatus.APPROVED }).getCount(),
      baseQuery.clone().andWhere('expense.status = :status', { status: ExpenseStatus.REJECTED }).getCount(),
      monthlyQuery.clone().andWhere('expense.status = :status', { status: ExpenseStatus.PENDING }).getCount(),
      monthlyQuery.clone().andWhere('expense.status = :status', { status: ExpenseStatus.APPROVED }).getCount(),
      monthlyQuery.clone().andWhere('expense.status = :status', { status: ExpenseStatus.REJECTED }).getCount(),
      baseQuery.clone().andWhere('expense.riskScore > :riskScore', { riskScore: 0.7 }).getCount(),
    ]);

    // 평균 승인 시간 계산
    const approvedExpenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.createdAt', 'createdAt')
      .addSelect('expense.approvedAt', 'approvedAt')
      .where('expense.status = :status', { status: ExpenseStatus.APPROVED })
      .andWhere('expense.approvedAt IS NOT NULL')
      .andWhere('expense.transactionDate >= :thisMonth', { thisMonth })
      .getRawMany();

    let averageApprovalTime = 0;
    if (approvedExpenses.length > 0) {
      const totalTime = approvedExpenses.reduce((sum, expense) => {
        const timeDiff = new Date(expense.approvedAt).getTime() - new Date(expense.createdAt).getTime();
        return sum + timeDiff;
      }, 0);
      averageApprovalTime = Math.round(totalTime / approvedExpenses.length / (1000 * 60 * 60)); // 시간 단위
    }

    return {
      total: {
        pending: totalPending,
        approved: totalApproved,
        rejected: totalRejected,
        highRisk: highRiskCount,
      },
      monthly: {
        pending: monthlyPending,
        approved: monthlyApproved,
        rejected: monthlyRejected,
      },
      performance: {
        averageApprovalTimeHours: averageApprovalTime,
        approvalRate: totalApproved + totalRejected > 0 
          ? Math.round((totalApproved / (totalApproved + totalRejected)) * 100)
          : 0,
      },
    };
  }

  /**
   * 승인자별 대기 건수 조회
   */
  async getPendingCountsByApprover(companyId: string) {
    const approvers = await this.employeeRepository
      .createQueryBuilder('employee')
      .where('employee.canApprove = :canApprove', { canApprove: true })
      .andWhere('employee.companyId = :companyId', { companyId })
      .getMany();

    const counts = await Promise.all(
      approvers.map(async (approver) => {
        const count = await this.expenseRepository
          .createQueryBuilder('expense')
          .where('expense.status = :status', { status: ExpenseStatus.PENDING })
          .andWhere('expense.companyId = :companyId', { companyId })
          .andWhere('expense.amount <= :approvalLimit', { 
            approvalLimit: approver.approvalLimit || 999999999 
          })
          .getCount();

        return {
          approver,
          pendingCount: count,
        };
      })
    );

    return counts.sort((a, b) => b.pendingCount - a.pendingCount);
  }

  // Private 메서드들
  private calculatePriority(expense: BusinessExpense): 'low' | 'medium' | 'high' | 'urgent' {
    let priority = 0;

    // 금액에 따른 우선순위
    if (expense.amount > 500000) priority += 3; // 50만엔 이상
    else if (expense.amount > 100000) priority += 2; // 10만엔 이상
    else priority += 1;

    // 위험도에 따른 우선순위
    if (expense.riskScore > 0.8) priority += 3;
    else if (expense.riskScore > 0.5) priority += 2;

    // 정책 위반에 따른 우선순위
    if (expense.policyViolations && expense.policyViolations.length > 0) {
      priority += expense.policyViolations.length;
    }

    // 오래된 건에 대한 우선순위
    const daysSinceTransaction = Math.floor(
      (Date.now() - expense.transactionDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceTransaction > 7) priority += 2;
    else if (daysSinceTransaction > 3) priority += 1;

    if (priority >= 7) return 'urgent';
    if (priority >= 5) return 'high';
    if (priority >= 3) return 'medium';
    return 'low';
  }

  private getTaxInfo(expense: BusinessExpense) {
    return {
      taxType: expense.taxType,
      taxAmount: expense.taxAmount,
      amountExcludingTax: expense.amountExcludingTax,
      qualifiedInvoice: expense.qualifiedInvoice,
      invoiceNumber: expense.invoiceNumber,
    };
  }

  private async processApprovalAsync(expense: BusinessExpense, approved: boolean) {
    try {
      if (approved) {
        // 승인된 경우 freee 회계에 동기화 (구현 예정)
        console.log(`Expense ${expense.id} approved, syncing to accounting system`);
      }

      // 알림 발송 (구현 예정)
      console.log(`Approval notification sent for expense ${expense.id}`);

      // 예산 업데이트 (구현 예정)
      console.log(`Budget updated for expense ${expense.id}`);

    } catch (error) {
      console.error('Failed to process approval async:', error);
    }
  }
}