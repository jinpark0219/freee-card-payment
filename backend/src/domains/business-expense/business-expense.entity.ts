import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BusinessCard } from '../business-card/business-card.entity';
import { Company } from '../../entities/company.entity';
import { Employee } from '../../entities/employee.entity';

export enum ExpenseStatus {
  PENDING = 'pending',           // 승인 대기
  APPROVED = 'approved',         // 승인됨
  REJECTED = 'rejected',         // 거절됨
  COMPLETED = 'completed',       // 회계처리 완료
  CANCELLED = 'cancelled'        // 취소됨
}

export enum ExpenseCategory {
  // 일반 경비
  OFFICE_SUPPLIES = 'office_supplies',      // 사무용품
  TRAVEL = 'travel',                        // 여비교통비
  ENTERTAINMENT = 'entertainment',          // 접대비
  ADVERTISING = 'advertising',              // 광고선전비
  EDUCATION = 'education',                  // 교육연수비
  COMMUNICATION = 'communication',          // 통신비
  UTILITIES = 'utilities',                  // 수도광열비
  RENT = 'rent',                           // 임차료
  MAINTENANCE = 'maintenance',              // 수선비
  INSURANCE = 'insurance',                  // 보험료
  
  // IT 관련
  SOFTWARE = 'software',                    // 소프트웨어
  CLOUD_SERVICE = 'cloud_service',          // 클라우드 서비스
  DOMAIN = 'domain',                        // 도메인/호스팅
  
  // 기타
  OTHER = 'other'                          // 기타
}

export enum JapanTaxType {
  TAXABLE_10 = 'taxable_10',               // 소비세 10%
  TAXABLE_8 = 'taxable_8',                 // 소비세 8% (식품 등)
  TAX_FREE = 'tax_free',                   // 비과세
  TAX_EXEMPT = 'tax_exempt'                // 면세
}

@Entity('business_expenses')
export class BusinessExpense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 기본 거래 정보
  @Column({ type: 'bigint' })
  amount: number; // 결제 금액 (세금 포함)

  @Column({ name: 'amount_excluding_tax', type: 'bigint' })
  amountExcludingTax: number; // 세금 제외 금액

  @Column({ name: 'tax_amount', type: 'int' })
  taxAmount: number; // 세금 금액

  @Column({ name: 'merchant_name' })
  merchantName: string;

  @Column({ name: 'merchant_category_code', nullable: true })
  merchantCategoryCode?: string; // MCC 코드

  @Column({ name: 'transaction_date' })
  transactionDate: Date; // 거래 발생일

  @Column({ name: 'posted_date', nullable: true })
  postedDate?: Date; // 매출전표 승인일

  // 관계
  @Column({ name: 'card_id' })
  cardId: string;

  @ManyToOne(() => BusinessCard, card => card.expenses)
  @JoinColumn({ name: 'card_id' })
  card: BusinessCard;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'employee_id', nullable: true })
  employeeId?: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee?: Employee;

  // 승인 프로세스
  @Column({
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.PENDING,
  })
  status: ExpenseStatus;

  @Column({ name: 'approver_id', nullable: true })
  approverId?: string;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'approval_comment', nullable: true })
  approvalComment?: string;

  // 회계 분류
  @Column({
    type: 'enum',
    enum: ExpenseCategory,
  })
  category: ExpenseCategory;

  @Column({ name: 'account_code', nullable: true })
  accountCode?: string; // 계정과목 코드

  @Column({ name: 'project_id', nullable: true })
  projectId?: string; // 프로젝트/부서

  @Column({ name: 'cost_center', nullable: true })
  costCenter?: string; // 비용센터

  // 일본 세무
  @Column({
    type: 'enum',
    enum: JapanTaxType,
    default: JapanTaxType.TAXABLE_10,
  })
  taxType: JapanTaxType;

  @Column({ name: 'invoice_number', nullable: true })
  invoiceNumber?: string; // 세금계산서 번호

  @Column({ name: 'qualified_invoice', default: false })
  qualifiedInvoice: boolean; // 적격청구서 여부 (일본 2023년 제도)

  // 영수증 정보
  @Column({ name: 'receipt_url', nullable: true })
  receiptUrl?: string;

  @Column({ name: 'receipt_ocr_data', type: 'json', nullable: true })
  receiptOcrData?: any; // OCR로 추출한 데이터

  @Column({ name: 'receipt_verified', default: false })
  receiptVerified: boolean; // 영수증 검증 완료

  // 메모 및 추가 정보
  @Column({ nullable: true })
  memo?: string;

  @Column({ name: 'business_purpose', nullable: true })
  businessPurpose?: string; // 사업 목적

  @Column({ name: 'attendees', type: 'simple-array', nullable: true })
  attendees?: string[]; // 참석자 (접대비의 경우)

  // 외부 연동
  @Column({ name: 'external_transaction_id', nullable: true })
  externalTransactionId?: string; // 카드사 거래 ID

  @Column({ name: 'freee_accounting_id', nullable: true })
  freeeAccountingId?: string; // freee 회계 거래 ID

  @Column({ name: 'sync_status', default: 'pending' })
  syncStatus: string; // pending, synced, failed

  // 정책 검사 결과
  @Column({ name: 'policy_violations', type: 'simple-array', nullable: true })
  policyViolations?: string[]; // 위반된 정책 목록

  @Column({ name: 'risk_score', type: 'decimal', precision: 3, scale: 2, default: 0 })
  riskScore: number; // 0.00 ~ 1.00, 부정사용 위험도

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 비즈니스 메서드
  approve(approverId: string, comment?: string): void {
    this.status = ExpenseStatus.APPROVED;
    this.approverId = approverId;
    this.approvedAt = new Date();
    this.approvalComment = comment;
  }

  reject(approverId: string, reason: string): void {
    this.status = ExpenseStatus.REJECTED;
    this.approverId = approverId;
    this.approvalComment = reason;
  }

  calculateTax(): void {
    switch (this.taxType) {
      case JapanTaxType.TAXABLE_10:
        this.taxAmount = Math.round(this.amountExcludingTax * 0.1);
        break;
      case JapanTaxType.TAXABLE_8:
        this.taxAmount = Math.round(this.amountExcludingTax * 0.08);
        break;
      default:
        this.taxAmount = 0;
    }
    this.amount = this.amountExcludingTax + this.taxAmount;
  }

  isHighRisk(): boolean {
    return this.riskScore > 0.7 || (this.policyViolations?.length || 0) > 0;
  }

  needsReceiptVerification(): boolean {
    return this.amount >= 30000 && !this.receiptVerified; // 3만엔 이상
  }

  isEntertainmentExpense(): boolean {
    return this.category === ExpenseCategory.ENTERTAINMENT;
  }

  getAccountingPeriod(): string {
    // 일본 회계연도: 4월~3월
    const year = this.transactionDate.getMonth() >= 3 ? 
      this.transactionDate.getFullYear() : 
      this.transactionDate.getFullYear() - 1;
    return `${year}`;
  }
}