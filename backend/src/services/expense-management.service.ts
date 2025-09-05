import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessExpense, ExpenseStatus, ExpenseCategory } from '../domains/business-expense/business-expense.entity';
import { BusinessCard } from '../domains/business-card/business-card.entity';
import { CardGatewayFactory } from '../integrations/card-gateway/card-gateway-factory.service';

export interface ExpenseProcessingRequest {
  cardId: string;
  amount: number;
  merchantName: string;
  merchantCategoryCode?: string;
  transactionDate: Date;
  autoClassify?: boolean;
}

export interface ExpenseApprovalRequest {
  expenseId: string;
  approverId: string;
  approved: boolean;
  comment?: string;
}

export interface BudgetAlert {
  companyId: string;
  cardId?: string;
  department?: string;
  currentUsage: number;
  budgetLimit: number;
  utilizationRate: number;
  severity: 'warning' | 'danger';
}

/**
 * freee 통합 지출 관리 서비스
 * 모든 카드사의 거래를 통합하여 관리하는 핵심 비즈니스 로직
 */
@Injectable()
export class ExpenseManagementService {
  constructor(
    @InjectRepository(BusinessExpense)
    private expenseRepository: Repository<BusinessExpense>,
    @InjectRepository(BusinessCard)
    private cardRepository: Repository<BusinessCard>,
    private readonly gatewayFactory: CardGatewayFactory,
    private readonly aiClassificationService: any,  // AI 기반 자동 분류
    private readonly budgetService: any,            // 예산 관리
    private readonly approvalService: any,          // 승인 워크플로우
    private readonly freeeAccountingApi: any,       // freee 회계 API
    private readonly notificationService: any       // 알림 서비스
  ) {}

  /**
   * 새로운 지출 처리 (카드 결제 발생 시)
   * 모든 카드사에서 공통으로 사용되는 로직
   */
  async processNewExpense(request: ExpenseProcessingRequest): Promise<BusinessExpense> {
    // 1. 카드 정보 조회 및 검증
    const card = await this.cardRepository.findOne({
      where: { id: request.cardId },
      relations: ['provider', 'company', 'employee']
    });

    if (!card || !card.canTransact(request.amount)) {
      throw new Error('Card is not available for transaction');
    }

    // 2. AI 기반 자동 분류 (선택적)
    let category = ExpenseCategory.OTHER;
    let accountCode: string | undefined;
    
    if (request.autoClassify !== false) {
      const classification = await this.aiClassificationService.classifyExpense({
        merchantName: request.merchantName,
        merchantCategoryCode: request.merchantCategoryCode,
        amount: request.amount,
        companyId: card.companyId
      });
      category = classification.category;
      accountCode = classification.accountCode;
    }

    // 3. 세금 계산 (일본 소비세)
    const taxCalculation = this.calculateJapanConsumptionTax(request.amount, category);

    // 4. 지출 엔티티 생성
    const expense = this.expenseRepository.create({
      amount: request.amount,
      amountExcludingTax: taxCalculation.amountExcludingTax,
      taxAmount: taxCalculation.taxAmount,
      merchantName: request.merchantName,
      merchantCategoryCode: request.merchantCategoryCode,
      transactionDate: request.transactionDate,
      cardId: request.cardId,
      companyId: card.companyId,
      employeeId: card.employeeId,
      category,
      accountCode,
      taxType: taxCalculation.taxType as any,
      status: card.needsApproval(request.amount) ? ExpenseStatus.PENDING : ExpenseStatus.APPROVED
    });

    // 5. 정책 검사
    const policyViolations = await this.checkExpensePolicy(expense, card);
    expense.policyViolations = policyViolations;

    // 6. 부정사용 위험도 계산
    expense.riskScore = await this.calculateRiskScore(expense, card);

    // 7. 데이터베이스 저장
    const savedExpense = await this.expenseRepository.save(expense);

    // 8. 카드 사용 통계 업데이트
    card.updateMonthlyUsage(request.amount);
    await this.cardRepository.save(card);

    // 9. 후속 처리 (비동기)
    this.processExpenseAsync(savedExpense, card);

    return savedExpense;
  }

  /**
   * 지출 승인 처리
   */
  async approveExpense(request: ExpenseApprovalRequest): Promise<BusinessExpense> {
    const expense = await this.expenseRepository.findOne({
      where: { id: request.expenseId },
      relations: ['card', 'company']
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    if (expense.status !== ExpenseStatus.PENDING) {
      throw new Error('Expense is not pending approval');
    }

    // 승인/거절 처리
    if (request.approved) {
      expense.approve(request.approverId, request.comment);
      
      // 승인 시 freee 회계에 반영
      await this.syncToFreeeAccounting(expense);
    } else {
      expense.reject(request.approverId, request.comment || 'Rejected');
    }

    const savedExpense = await this.expenseRepository.save(expense);

    // 알림 발송
    await this.notificationService.sendApprovalNotification(savedExpense);

    return savedExpense;
  }

  /**
   * 예산 모니터링 및 알림
   */
  async monitorBudgets(companyId: string): Promise<BudgetAlert[]> {
    const alerts: BudgetAlert[] = [];

    // 1. 회사 전체 예산 체크
    const companyAlert = await this.checkCompanyBudget(companyId);
    if (companyAlert) alerts.push(companyAlert);

    // 2. 카드별 예산 체크
    const cardAlerts = await this.checkCardBudgets(companyId);
    alerts.push(...cardAlerts);

    // 3. 부서별 예산 체크
    const departmentAlerts = await this.checkDepartmentBudgets(companyId);
    alerts.push(...departmentAlerts);

    // 4. 심각한 알림은 즉시 발송
    const urgentAlerts = alerts.filter(alert => alert.severity === 'danger');
    if (urgentAlerts.length > 0) {
      await this.notificationService.sendUrgentBudgetAlerts(urgentAlerts);
    }

    return alerts;
  }

  /**
   * 다중 카드사 거래 동기화
   * 배치 작업으로 실행 (매일 새벽)
   */
  async synchronizeAllTransactions(companyId: string): Promise<void> {
    const company = await this.getCompanyWithCards(companyId);
    const syncResults = [];

    // 각 카드별로 병렬 동기화
    for (const card of company.cards) {
      try {
        const gateway = this.gatewayFactory.createGateway(card.provider);

        // 지난 7일간 거래 동기화
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        const transactions = await gateway.getTransactions(card.externalCardId, startDate, endDate);
        
        const processedCount = await this.processTransactionBatch(card, transactions);
        
        syncResults.push({
          cardId: card.id,
          providerType: card.provider.type,
          transactionCount: processedCount,
          success: true
        });

      } catch (error) {
        syncResults.push({
          cardId: card.id,
          providerType: card.provider.type,
          error: error.message,
          success: false
        });
      }
    }

    // 동기화 결과 로깅
    console.log('Synchronization completed:', syncResults);
  }

  // Private 메서드들
  private calculateJapanConsumptionTax(amount: number, category: ExpenseCategory) {
    let taxRate = 0.10; // 기본 소비세 10%
    
    // 식품 등은 경감세율 8%
    if (category === ExpenseCategory.OTHER) { // 실제로는 더 세분화된 분류 필요
      taxRate = 0.08;
    }

    const amountExcludingTax = Math.round(amount / (1 + taxRate));
    const taxAmount = amount - amountExcludingTax;

    return {
      amountExcludingTax,
      taxAmount,
      taxType: taxRate === 0.10 ? 'taxable_10' : 'taxable_8'
    };
  }

  private async checkExpensePolicy(expense: BusinessExpense, card: BusinessCard): Promise<string[]> {
    const violations = [];

    // 금액 한도 체크
    if (card.singleTransactionLimit && expense.amount > card.singleTransactionLimit) {
      violations.push('EXCEEDS_SINGLE_TRANSACTION_LIMIT');
    }

    // 카테고리 제한 체크
    if (card.allowedCategories?.length && !card.allowedCategories.includes(expense.category)) {
      violations.push('RESTRICTED_CATEGORY');
    }

    // 가맹점 제한 체크
    if (card.blockedMerchants?.some(blocked => 
      expense.merchantName.toLowerCase().includes(blocked.toLowerCase())
    )) {
      violations.push('BLOCKED_MERCHANT');
    }

    return violations;
  }

  private async calculateRiskScore(expense: BusinessExpense, card: BusinessCard): Promise<number> {
    // 부정사용 위험도 계산 로직
    let riskScore = 0;

    // 금액이 평소보다 비정상적으로 큰 경우
    const avgAmount = await this.getCardAverageTransactionAmount(card.id);
    if (expense.amount > avgAmount * 3) {
      riskScore += 0.3;
    }

    // 정책 위반이 있는 경우
    if (expense.policyViolations && expense.policyViolations.length > 0) {
      riskScore += 0.4;
    }

    // 해외 거래인 경우 (간단한 예시)
    if (expense.merchantName.match(/[^\u0000-\u007F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) {
      riskScore += 0.2;
    }

    return Math.min(1.0, riskScore);
  }

  private async processExpenseAsync(expense: BusinessExpense, card: BusinessCard): Promise<void> {
    // 비동기 후속 처리
    try {
      // 1. 예산 체크 및 알림
      await this.budgetService.checkAndAlert(card.companyId, expense.amount);

      // 2. 고위험 거래 검토 요청
      if (expense.riskScore > 0.7) {
        await this.approvalService.requestManualReview(expense);
      }

      // 3. 자동 승인된 경우 즉시 회계 연동
      if (expense.status === ExpenseStatus.APPROVED) {
        await this.syncToFreeeAccounting(expense);
      }

      // 4. 실시간 알림 발송
      await this.notificationService.sendTransactionNotification(expense);

    } catch (error) {
      console.error('Failed to process expense async:', error);
    }
  }

  private async syncToFreeeAccounting(expense: BusinessExpense): Promise<void> {
    try {
      const journalEntry = {
        company_id: expense.companyId,
        issue_date: expense.transactionDate,
        details: [
          {
            account_item_id: expense.accountCode,
            tax_code: expense.taxType,
            amount: expense.amountExcludingTax,
            description: `${expense.merchantName} - ${expense.memo || ''}`,
            tag_ids: expense.projectId ? [expense.projectId] : []
          }
        ]
      };

      const response = await this.freeeAccountingApi.post('/deals', journalEntry);
      
      expense.freeeAccountingId = response.data.id;
      expense.syncStatus = 'synced';
      await this.expenseRepository.save(expense);

    } catch (error) {
      expense.syncStatus = 'failed';
      await this.expenseRepository.save(expense);
      throw error;
    }
  }

  private async getCardAverageTransactionAmount(cardId: string): Promise<number> {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('AVG(expense.amount)', 'avgAmount')
      .where('expense.cardId = :cardId', { cardId })
      .andWhere('expense.transactionDate > :thirtyDaysAgo', { 
        thirtyDaysAgo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
      })
      .getRawOne();

    return result.avgAmount || 0;
  }

  private async checkCompanyBudget(companyId: string): Promise<BudgetAlert | null> {
    // 회사 전체 예산 체크 로직
    return null; // 구현 필요
  }

  private async checkCardBudgets(companyId: string): Promise<BudgetAlert[]> {
    // 카드별 예산 체크 로직
    return []; // 구현 필요
  }

  private async checkDepartmentBudgets(companyId: string): Promise<BudgetAlert[]> {
    // 부서별 예산 체크 로직
    return []; // 구현 필요
  }

  private async getCompanyWithCards(companyId: string): Promise<any> {
    // 회사 정보와 카드 목록 조회
    return {}; // 구현 필요
  }

  private async processTransactionBatch(card: BusinessCard, transactions: any[]): Promise<number> {
    let processedCount = 0;

    for (const transaction of transactions) {
      try {
        // 이미 처리된 거래인지 확인
        const existingExpense = await this.expenseRepository.findOne({
          where: { externalTransactionId: transaction.externalTransactionId }
        });

        if (!existingExpense) {
          await this.processNewExpense({
            cardId: card.id,
            amount: transaction.amount,
            merchantName: transaction.merchantName,
            merchantCategoryCode: transaction.merchantCategoryCode,
            transactionDate: transaction.transactionDate,
            autoClassify: true
          });
          processedCount++;
        }
      } catch (error) {
        console.error(`Failed to process transaction ${transaction.externalTransactionId}:`, error);
      }
    }

    return processedCount;
  }
}