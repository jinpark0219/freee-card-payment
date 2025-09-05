import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeedService } from './seed.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessExpense, ExpenseStatus, ExpenseCategory, JapanTaxType } from '../domains/business-expense/business-expense.entity';
import { Card } from '../entities/card.entity';

@ApiTags('seed')
@Controller('seed')
export class SeedController {
  constructor(
    private readonly seedService: SeedService,
    @InjectRepository(BusinessExpense)
    private expenseRepository: Repository<BusinessExpense>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create seed data for testing' })
  @ApiResponse({ status: 201, description: 'Seed data created successfully' })
  async createSeedData(): Promise<{ message: string }> {
    await this.seedService.seed();
    return { message: 'Seed data created successfully!' };
  }

  @Post('expenses')
  @ApiOperation({ summary: 'Create expense sample data directly' })
  @ApiResponse({ status: 201, description: 'Expense data created successfully' })
  async createExpenseData(): Promise<{ message: string; created: number }> {
    try {
      // 기존 BusinessExpense 데이터 삭제
      await this.expenseRepository.clear();

      // 첫 번째 카드 정보 가져오기 (외래키 참조용)
      const card = await this.cardRepository.findOne({ where: {} });
      if (!card) {
        return { message: 'No card found. Run main seed first.', created: 0 };
      }

      // 간단한 지출 데이터 직접 생성
      const expenseData = [
        {
          amount: 85000,
          amountExcludingTax: 77273,
          taxAmount: 7727,
          merchantName: '스타벅스 신주쿠점',
          merchantCategoryCode: '5812',
          transactionDate: new Date('2025-09-03T10:30:00'),
          cardId: card.id, // 기존 카드 ID 사용
          companyId: 'company-1', // 임시 ID
          employeeId: 'employee-1', // 임시 ID
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
          cardId: card.id,
          companyId: 'company-1',
          employeeId: 'employee-1',
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
          cardId: card.id,
          companyId: 'company-1',
          employeeId: 'employee-1',
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
      ];

      let created = 0;
      for (const data of expenseData) {
        try {
          const expense = this.expenseRepository.create(data);
          await this.expenseRepository.save(expense);
          created++;
        } catch (error) {
          console.error('Failed to create expense:', error.message);
        }
      }

      return { 
        message: `Successfully created ${created} expense records in DB!`,
        created
      };
    } catch (error) {
      return { message: `Error: ${error.message}`, created: 0 };
    }
  }
}