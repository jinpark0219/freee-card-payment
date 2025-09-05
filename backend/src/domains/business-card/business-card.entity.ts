import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CardProvider } from '../card-provider/card-provider.entity';
import { BusinessExpense } from '../business-expense/business-expense.entity';
import { Company } from '../../entities/company.entity';
import { Employee } from '../../entities/employee.entity';

export enum BusinessCardStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum BusinessCardType {
  CORPORATE = 'corporate',    // 법인카드 (회사 직접 결제)
  EMPLOYEE = 'employee',      // 직원카드 (직원 사용 후 정산)
  PREPAID = 'prepaid'        // 선불카드 (예산 제한)
}

@Entity('business_cards')
export class BusinessCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 카드 기본 정보
  @Column({ name: 'card_number_masked' }) // 마스킹된 카드번호 (****-****-****-1234)
  cardNumberMasked: string;

  @Column({ name: 'card_holder_name' })
  cardHolderName: string;

  @Column({ name: 'card_holder_name_en', nullable: true })
  cardHolderNameEn?: string; // 영문명 (해외 결제용)

  @Column({ name: 'expiry_date', length: 5 }) // MM/YY
  expiryDate: string;

  @Column({
    type: 'enum',
    enum: BusinessCardStatus,
    default: BusinessCardStatus.ACTIVE,
  })
  status: BusinessCardStatus;

  @Column({
    type: 'enum',
    enum: BusinessCardType,
  })
  type: BusinessCardType;

  // 관계
  @Column({ name: 'provider_id' })
  providerId: string;

  @ManyToOne(() => CardProvider, provider => provider.cards)
  @JoinColumn({ name: 'provider_id' })
  provider: CardProvider;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company, company => company.cards)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'employee_id', nullable: true })
  employeeId?: string;

  @ManyToOne(() => Employee, employee => employee.cards)
  @JoinColumn({ name: 'employee_id' })
  employee?: Employee;

  // 한도 및 예산 관리
  @Column({ name: 'credit_limit', type: 'bigint' })
  creditLimit: number; // 신용한도 (엔화)

  @Column({ name: 'monthly_budget', type: 'bigint', nullable: true })
  monthlyBudget?: number; // 월별 예산

  @Column({ name: 'daily_limit', type: 'int', nullable: true })
  dailyLimit?: number; // 일별 한도

  @Column({ name: 'single_transaction_limit', type: 'int', nullable: true })
  singleTransactionLimit?: number; // 1회 결제 한도

  // 사용 통계 (캐시)
  @Column({ name: 'current_month_usage', type: 'bigint', default: 0 })
  currentMonthUsage: number;

  @Column({ name: 'available_balance', type: 'bigint' })
  availableBalance: number;

  @Column({ name: 'last_transaction_date', nullable: true })
  lastTransactionDate?: Date;

  // 정책 설정
  @Column({ name: 'requires_approval', default: false })
  requiresApproval: boolean; // 모든 거래에 승인 필요

  @Column({ name: 'approval_threshold', type: 'int', nullable: true })
  approvalThreshold?: number; // 이 금액 이상만 승인 필요

  @Column({ name: 'allowed_categories', type: 'simple-array', nullable: true })
  allowedCategories?: string[]; // 허용된 카테고리

  @Column({ name: 'blocked_merchants', type: 'simple-array', nullable: true })
  blockedMerchants?: string[]; // 차단된 가맹점

  // 외부 연동 정보
  @Column({ name: 'external_card_id', nullable: true })
  externalCardId?: string; // 카드사의 카드 ID

  @Column({ name: 'last_sync_at', nullable: true })
  lastSyncAt?: Date; // 마지막 동기화 시간

  @Column({ name: 'sync_status', default: 'synced' })
  syncStatus: string; // synced, syncing, failed

  @OneToMany(() => BusinessExpense, expense => expense.card)
  expenses: BusinessExpense[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 비즈니스 메서드
  canTransact(amount: number): boolean {
    if (this.status !== BusinessCardStatus.ACTIVE) return false;
    if (this.availableBalance < amount) return false;
    if (this.singleTransactionLimit && amount > this.singleTransactionLimit) return false;
    return true;
  }

  needsApproval(amount: number): boolean {
    if (this.requiresApproval) return true;
    if (this.approvalThreshold && amount >= this.approvalThreshold) return true;
    return false;
  }

  updateMonthlyUsage(amount: number): void {
    this.currentMonthUsage += amount;
    this.availableBalance = Math.max(0, this.availableBalance - amount);
    this.lastTransactionDate = new Date();
  }

  isOverBudget(): boolean {
    if (!this.monthlyBudget) return false;
    return this.currentMonthUsage > this.monthlyBudget;
  }

  getBudgetUtilization(): number {
    if (!this.monthlyBudget) return 0;
    return Math.min(100, (this.currentMonthUsage / this.monthlyBudget) * 100);
  }

  isHighRiskCard(): boolean {
    return (
      this.isOverBudget() || 
      this.syncStatus === 'failed' || 
      this.getBudgetUtilization() > 90
    );
  }
}