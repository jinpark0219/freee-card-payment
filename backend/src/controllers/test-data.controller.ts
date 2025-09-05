import { Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessExpense, ExpenseStatus, ExpenseCategory, JapanTaxType } from '../domains/business-expense/business-expense.entity';
import { BusinessCard } from '../domains/business-card/business-card.entity';
import { Employee } from '../entities/employee.entity';
import { Company } from '../entities/company.entity';

@Controller('test-data')
export class TestDataController {
  constructor(
    @InjectRepository(BusinessExpense)
    private expenseRepository: Repository<BusinessExpense>,
    @InjectRepository(BusinessCard)
    private businessCardRepository: Repository<BusinessCard>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  @Post('expenses')
  async createTestExpenses() {
    try {
      // 기존 BusinessExpense 데이터 삭제
      await this.expenseRepository.clear();

      // 첫 번째 회사와 직원 찾기
      const company = await this.companyRepository.findOne({ where: {} });
      const employee = await this.employeeRepository.findOne({ where: {} });
      const businessCard = await this.businessCardRepository.findOne({ where: {} });

      if (!company || !employee || !businessCard) {
        return { error: 'Required entities not found. Run seed first.' };
      }

      // 간단한 지출 데이터 생성
      const expenses = [
        {
          amount: 85000,
          amountExcludingTax: 77273,
          taxAmount: 7727,
          merchantName: '스타벅스 신주쿠점',
          merchantCategoryCode: '5812',
          transactionDate: new Date('2025-09-03T10:30:00'),
          cardId: businessCard.id,
          companyId: company.id,
          employeeId: employee.id,
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
          cardId: businessCard.id,
          companyId: company.id,
          employeeId: employee.id,
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
          cardId: businessCard.id,
          companyId: company.id,
          employeeId: employee.id,
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

      let createdCount = 0;
      for (const expenseData of expenses) {
        try {
          const expense = this.expenseRepository.create(expenseData);
          await this.expenseRepository.save(expense);
          createdCount++;
        } catch (error) {
          console.error('Failed to create expense:', error.message);
        }
      }

      return { 
        message: `Created ${createdCount} test expenses successfully!`,
        company: { id: company.id, name: company.name },
        employee: { id: employee.id, name: employee.name },
        businessCard: { id: businessCard.id, cardHolderName: businessCard.cardHolderName }
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}