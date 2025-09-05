import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card, CardBrand, CardStatus } from '../entities/card.entity';
import { CardTransaction, TransactionStatus } from '../entities/card-transaction.entity';
import { BusinessExpense, ExpenseStatus, ExpenseCategory, JapanTaxType } from '../domains/business-expense/business-expense.entity';
import { BusinessCard, BusinessCardStatus, BusinessCardType } from '../domains/business-card/business-card.entity';
import { Employee, EmployeeRole } from '../entities/employee.entity';
import { Company, CompanySize } from '../entities/company.entity';
import { CardProvider, CardProviderType, CardProviderStatus } from '../domains/card-provider/card-provider.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(CardTransaction)
    private transactionRepository: Repository<CardTransaction>,
    @InjectRepository(BusinessExpense)
    private expenseRepository: Repository<BusinessExpense>,
    @InjectRepository(BusinessCard)
    private businessCardRepository: Repository<BusinessCard>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(CardProvider)
    private cardProviderRepository: Repository<CardProvider>,
  ) {}

  async seed() {
    // 기존 데이터 삭제 (개발 환경에서만)
    const existingTransactions = await this.transactionRepository.find();
    if (existingTransactions.length > 0) {
      await this.transactionRepository.remove(existingTransactions);
    }
    
    const existingCards = await this.cardRepository.find();
    if (existingCards.length > 0) {
      await this.cardRepository.remove(existingCards);
    }

    // 샘플 카드 데이터 생성
    const cards = await this.createSampleCards();
    
    // 샘플 거래 데이터 생성
    await this.createSampleTransactions(cards);
    
    // 샘플 카드 프로바이더 생성
    const cardProviders = await this.createSampleCardProviders();
    
    // 샘플 회사 및 직원 데이터 생성
    const companies = await this.createSampleCompanies();
    const employees = await this.createSampleEmployees(companies);
    const businessCards = await this.createSampleBusinessCards(companies, employees, cardProviders);
    
    // 샘플 지출 데이터 생성 (승인 대기용)
    await this.createSampleExpenses(businessCards, employees);

    console.log('✅ Seed data created successfully!');
  }

  private async createSampleCards(): Promise<Card[]> {
    const sampleCards = [
      {
        cardholderName: '김철수',
        lastFour: '1234',
        brand: CardBrand.VISA,
        expiryDate: '12/25',
        status: CardStatus.ACTIVE,
        userId: 'user-001',
        creditLimit: 1000000,
        availableBalance: 800000,
      },
      {
        cardholderName: '이영희',
        lastFour: '5678',
        brand: CardBrand.MASTERCARD,
        expiryDate: '06/26',
        status: CardStatus.ACTIVE,
        userId: 'user-002',
        creditLimit: 1500000,
        availableBalance: 1200000,
      },
      {
        cardholderName: '박민수',
        lastFour: '9012',
        brand: CardBrand.JCB,
        expiryDate: '03/27',
        status: CardStatus.SUSPENDED,
        userId: 'user-003',
        creditLimit: 800000,
        availableBalance: 600000,
      },
      {
        cardholderName: '최지영',
        lastFour: '3456',
        brand: CardBrand.AMEX,
        expiryDate: '09/25',
        status: CardStatus.ACTIVE,
        userId: 'user-004',
        creditLimit: 2000000,
        availableBalance: 1800000,
      },
    ];

    const cards: Card[] = [];
    for (const cardData of sampleCards) {
      const card = this.cardRepository.create(cardData);
      const savedCard = await this.cardRepository.save(card);
      cards.push(savedCard);
    }

    return cards;
  }

  private async createSampleTransactions(cards: Card[]) {
    const sampleTransactions = [
      // 김철수의 거래들
      {
        amount: 50000,
        merchantName: '스타벅스 강남점',
        transactionDate: new Date('2025-09-01T09:30:00'),
        cardLastFour: cards[0].lastFour,
        status: TransactionStatus.COMPLETED,
        userId: cards[0].userId,
        cardId: cards[0].id,
        category: '식비',
        memo: '팀 회의 커피',
      },
      {
        amount: 120000,
        merchantName: '롯데마트',
        transactionDate: new Date('2025-09-02T14:20:00'),
        cardLastFour: cards[0].lastFour,
        status: TransactionStatus.COMPLETED,
        userId: cards[0].userId,
        cardId: cards[0].id,
        category: '생활용품',
        memo: '생필품 구매',
      },
      {
        amount: 30000,
        merchantName: 'GS25 편의점',
        transactionDate: new Date('2025-09-03T19:15:00'),
        cardLastFour: cards[0].lastFour,
        status: TransactionStatus.PENDING,
        userId: cards[0].userId,
        cardId: cards[0].id,
        category: '식비',
      },
      
      // 이영희의 거래들
      {
        amount: 80000,
        merchantName: '교보문고',
        transactionDate: new Date('2025-09-01T11:00:00'),
        cardLastFour: cards[1].lastFour,
        status: TransactionStatus.COMPLETED,
        userId: cards[1].userId,
        cardId: cards[1].id,
        category: '도서',
        memo: '개발 서적 구매',
      },
      {
        amount: 200000,
        merchantName: '신세계백화점',
        transactionDate: new Date('2025-09-04T16:30:00'),
        cardLastFour: cards[1].lastFour,
        status: TransactionStatus.COMPLETED,
        userId: cards[1].userId,
        cardId: cards[1].id,
        category: '의류',
        memo: '가을 옷 구매',
      },
      {
        amount: 100000,
        merchantName: 'CGV 영화관',
        transactionDate: new Date('2025-09-05T20:00:00'),
        cardLastFour: cards[1].lastFour,
        status: TransactionStatus.FAILED,
        userId: cards[1].userId,
        cardId: cards[1].id,
        category: '엔터테인먼트',
        memo: '영화 티켓 결제 실패',
      },

      // 박민수의 거래들
      {
        amount: 150000,
        merchantName: '현대자동차',
        transactionDate: new Date('2025-08-30T10:00:00'),
        cardLastFour: cards[2].lastFour,
        status: TransactionStatus.COMPLETED,
        userId: cards[2].userId,
        cardId: cards[2].id,
        category: '차량정비',
        memo: '정기점검',
      },
      {
        amount: 60000,
        merchantName: '올리브영',
        transactionDate: new Date('2025-09-01T15:45:00'),
        cardLastFour: cards[2].lastFour,
        status: TransactionStatus.CANCELLED,
        userId: cards[2].userId,
        cardId: cards[2].id,
        category: '생활용품',
        memo: '주문 취소',
      },

      // 최지영의 거래들
      {
        amount: 45000,
        merchantName: '애플스토어',
        transactionDate: new Date('2025-09-03T13:20:00'),
        cardLastFour: cards[3].lastFour,
        status: TransactionStatus.COMPLETED,
        userId: cards[3].userId,
        cardId: cards[3].id,
        category: '전자제품',
        memo: 'AirPods 케이스',
      },
      {
        amount: 25000,
        merchantName: '투썸플레이스',
        transactionDate: new Date('2025-09-05T14:10:00'),
        cardLastFour: cards[3].lastFour,
        status: TransactionStatus.PENDING,
        userId: cards[3].userId,
        cardId: cards[3].id,
        category: '식비',
        memo: '브런치',
      },
    ];

    for (const transactionData of sampleTransactions) {
      const transaction = this.transactionRepository.create(transactionData);
      await this.transactionRepository.save(transaction);
    }
  }

  private async createSampleCompanies() {
    const companies = [
      {
        name: '테크스타트업',
        nameKana: 'テックスタートアップ',
        registrationNumber: '1234567890',
        taxId: 'T1234567890',
        size: CompanySize.SMALL,
        industry: 'IT',
        fiscalYearStartMonth: 4,
        monthlyBudget: 10000000,
        isActive: true,
      },
    ];

    const savedCompanies = [];
    for (const companyData of companies) {
      const company = this.companyRepository.create(companyData);
      const saved = await this.companyRepository.save(company);
      savedCompanies.push(saved);
    }
    return savedCompanies;
  }

  private async createSampleEmployees(companies: any[]) {
    const employees = [
      {
        name: '김대표',
        nameKana: 'キムダイヒョウ',
        email: 'ceo@company.com',
        employeeNumber: 'EMP001',
        department: '경영진',
        role: EmployeeRole.EXECUTIVE,
        companyId: companies[0].id,
        isActive: true,
        canApprove: true,
        approvalLimit: 1000000,
      },
      {
        name: '박과장',
        nameKana: 'パククァジャン',
        email: 'manager@company.com',
        employeeNumber: 'EMP002',
        department: '개발팀',
        role: EmployeeRole.MANAGER,
        companyId: companies[0].id,
        isActive: true,
        canApprove: true,
        approvalLimit: 500000,
      },
      {
        name: '이직원',
        nameKana: 'イジクウォン',
        email: 'employee@company.com',
        employeeNumber: 'EMP003',
        department: '개발팀',
        role: EmployeeRole.EMPLOYEE,
        companyId: companies[0].id,
        isActive: true,
        canApprove: false,
      },
    ];

    const savedEmployees = [];
    for (const employeeData of employees) {
      const employee = this.employeeRepository.create(employeeData);
      const saved = await this.employeeRepository.save(employee);
      savedEmployees.push(saved);
    }
    return savedEmployees;
  }

  private async createSampleCardProviders() {
    const cardProviders = [
      {
        name: 'freee',
        displayName: 'freee 네이티브 카드',
        type: CardProviderType.FREEE_NATIVE,
        status: CardProviderStatus.ACTIVE,
        realTimeSync: true,
        dataAccuracy: 1.0,
        syncIntervalMinutes: null,
        apiEndpoint: 'https://api.freee.co.jp/cards',
        webhookUrl: 'https://webhook.freee.co.jp/cards',
        requiresManualSync: false,
        revenueShareRate: 0.025,
        customerAcquisitionCost: 5000,
        processingFee: 100,
      },
    ];

    const savedProviders = [];
    for (const providerData of cardProviders) {
      const provider = this.cardProviderRepository.create(providerData);
      const saved = await this.cardProviderRepository.save(provider);
      savedProviders.push(saved);
    }
    return savedProviders;
  }

  private async createSampleBusinessCards(companies: any[], employees: any[], cardProviders: any[]) {
    const businessCards = [
      {
        cardNumberMasked: '****-****-****-1234',
        cardHolderName: '김대표',
        cardHolderNameEn: 'Kim Daepyo',
        expiryDate: '12/26',
        status: BusinessCardStatus.ACTIVE,
        type: BusinessCardType.CORPORATE,
        providerId: cardProviders[0].id,
        companyId: companies[0].id,
        employeeId: employees[0].id,
        creditLimit: 5000000,
        monthlyBudget: 1000000,
        dailyLimit: 100000,
        singleTransactionLimit: 500000,
        currentMonthUsage: 250000,
        availableBalance: 4750000,
        requiresApproval: false,
        approvalThreshold: 100000,
        allowedCategories: ['office_supplies', 'travel', 'entertainment'],
        syncStatus: 'synced',
      },
      {
        cardNumberMasked: '****-****-****-5678',
        cardHolderName: '이직원',
        cardHolderNameEn: 'Lee Jikwon',
        expiryDate: '08/27',
        status: BusinessCardStatus.ACTIVE,
        type: BusinessCardType.EMPLOYEE,
        providerId: cardProviders[0].id,
        companyId: companies[0].id,
        employeeId: employees[2].id,
        creditLimit: 1000000,
        monthlyBudget: 300000,
        dailyLimit: 50000,
        singleTransactionLimit: 100000,
        currentMonthUsage: 180000,
        availableBalance: 820000,
        requiresApproval: true,
        approvalThreshold: 50000,
        allowedCategories: ['office_supplies', 'travel'],
        syncStatus: 'synced',
      },
    ];

    const savedBusinessCards = [];
    for (const cardData of businessCards) {
      const card = this.businessCardRepository.create(cardData);
      const saved = await this.businessCardRepository.save(card);
      savedBusinessCards.push(saved);
    }
    return savedBusinessCards;
  }

  private async createSampleExpenses(businessCards: any[], employees: any[]) {
    const expenses = [
      {
        amount: 85000,
        amountExcludingTax: 77273,
        taxAmount: 7727,
        merchantName: '스타벅스 신주쿠점',
        merchantCategoryCode: '5812',
        transactionDate: new Date('2025-09-03T10:30:00'),
        cardId: businessCards[0].id,
        companyId: businessCards[0].companyId,
        employeeId: employees[0].id,
        category: ExpenseCategory.ENTERTAINMENT,
        accountCode: '605',
        taxType: JapanTaxType.TAXABLE_10,
        status: ExpenseStatus.PENDING,
        businessPurpose: '클라이언트 미팅',
        memo: '프로젝트 논의를 위한 커피 미팅',
        riskScore: 0.2,
        policyViolations: [],
        receiptVerified: true,
      },
      {
        amount: 125000,
        amountExcludingTax: 113636,
        taxAmount: 11364,
        merchantName: '아마존 재팬',
        merchantCategoryCode: '5942',
        transactionDate: new Date('2025-09-04T15:20:00'),
        cardId: businessCards[1].id,
        companyId: businessCards[1].companyId,
        employeeId: employees[2].id,
        category: ExpenseCategory.OFFICE_SUPPLIES,
        accountCode: '640',
        taxType: JapanTaxType.TAXABLE_10,
        status: ExpenseStatus.PENDING,
        businessPurpose: '사무용품 구매',
        memo: '개발팀용 노트북 스탠드 및 키보드',
        riskScore: 0.1,
        policyViolations: [],
        receiptVerified: false,
      },
      {
        amount: 180000,
        amountExcludingTax: 163636,
        taxAmount: 16364,
        merchantName: '도큐 핸즈 시부야점',
        merchantCategoryCode: '5999',
        transactionDate: new Date('2025-09-05T11:45:00'),
        cardId: businessCards[1].id,
        companyId: businessCards[1].companyId,
        employeeId: employees[2].id,
        category: ExpenseCategory.OTHER,
        accountCode: '690',
        taxType: JapanTaxType.TAXABLE_10,
        status: ExpenseStatus.PENDING,
        businessPurpose: '사무실 인테리어 용품',
        memo: '회의실 화이트보드 및 의자',
        riskScore: 0.6,
        policyViolations: ['EXCEEDS_SINGLE_TRANSACTION_LIMIT'],
        receiptVerified: false,
      },
      {
        amount: 45000,
        amountExcludingTax: 40909,
        taxAmount: 4091,
        merchantName: 'JR 동일본',
        merchantCategoryCode: '4111',
        transactionDate: new Date('2025-09-02T08:15:00'),
        cardId: businessCards[0].id,
        companyId: businessCards[0].companyId,
        employeeId: employees[0].id,
        category: ExpenseCategory.TRAVEL,
        accountCode: '618',
        taxType: JapanTaxType.TAXABLE_10,
        status: ExpenseStatus.APPROVED,
        approverId: employees[0].id,
        approvedAt: new Date('2025-09-02T10:00:00'),
        approvalComment: '정당한 출장비',
        businessPurpose: '고객사 방문',
        memo: '신칸센 도쿄-오사카 왕복',
        riskScore: 0.1,
        policyViolations: [],
        receiptVerified: true,
      },
    ];

    console.log('Creating expenses with businessCards:', businessCards.length, 'employees:', employees.length);
    
    for (let i = 0; i < expenses.length; i++) {
      try {
        console.log(`Creating expense ${i + 1}:`, expenses[i].merchantName);
        const expense = this.expenseRepository.create(expenses[i]);
        const saved = await this.expenseRepository.save(expense);
        console.log(`✅ Expense ${i + 1} created:`, saved.id);
      } catch (error) {
        console.error(`❌ Failed to create expense ${i + 1}:`, error.message);
      }
    }
  }
}