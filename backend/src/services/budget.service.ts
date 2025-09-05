import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget, BudgetStatus, BudgetCategory } from '../entities/budget.entity';
import { BusinessExpense } from '../domains/business-expense/business-expense.entity';
import { Company } from '../entities/company.entity';

export interface MonthlyBudgetSummary {
  month: string;
  totalBudget: number;
  totalUsed: number;
  categories: Array<{
    id: string;
    name: string;
    nameKo: string;
    budgetAmount: number;
    usedAmount: number;
    percentage: number;
    status: BudgetStatus;
    description: string;
  }>;
}

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    @InjectRepository(BusinessExpense)
    private expenseRepository: Repository<BusinessExpense>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async getBudgetsByMonth(month: string, companyId?: string): Promise<MonthlyBudgetSummary> {
    try {
      // companyId가 없으면 첫 번째 회사를 가져옴
      if (!companyId) {
        const company = await this.companyRepository.findOne({ where: {} });
        if (!company) {
          throw new Error('No company found');
        }
        companyId = company.id;
      }

      // 해당 월의 예산 데이터 조회
      const budgets = await this.budgetRepository.find({
        where: { 
          month, 
          companyId,
          isActive: true 
        },
        order: { category: 'ASC' }
      });

      // 만약 예산 데이터가 없으면 기본 예산 생성
      if (budgets.length === 0) {
        await this.createDefaultBudgets(month, companyId);
        return this.getBudgetsByMonth(month, companyId);
      }

      // 실제 지출 데이터 조회 및 예산 업데이트
      await this.updateBudgetUsage(month, companyId);

      // 업데이트된 예산 데이터 다시 조회
      const updatedBudgets = await this.budgetRepository.find({
        where: { 
          month, 
          companyId,
          isActive: true 
        },
        order: { category: 'ASC' }
      });

      const totalBudget = updatedBudgets.reduce((sum, budget) => sum + Number(budget.budgetAmount), 0);
      const totalUsed = updatedBudgets.reduce((sum, budget) => sum + Number(budget.usedAmount), 0);

      return {
        month,
        totalBudget,
        totalUsed,
        categories: updatedBudgets.map(budget => ({
          id: budget.id,
          name: budget.category,
          nameKo: budget.categoryNameKo,
          budgetAmount: Number(budget.budgetAmount),
          usedAmount: Number(budget.usedAmount),
          percentage: Number(budget.percentage),
          status: budget.status,
          description: budget.description || ''
        }))
      };
    } catch (error) {
      console.error('Error in getBudgetsByMonth:', error);
      // 기본 빈 데이터 반환
      return {
        month,
        totalBudget: 0,
        totalUsed: 0,
        categories: []
      };
    }
  }

  private async createDefaultBudgets(month: string, companyId: string): Promise<void> {
    try {
    const defaultBudgets = [
      {
        category: BudgetCategory.ENTERTAINMENT,
        categoryNameKo: '접대비',
        budgetAmount: 2000000,
        description: '클라이언트 미팅 및 회식비'
      },
      {
        category: BudgetCategory.OFFICE_SUPPLIES,
        categoryNameKo: '사무용품',
        budgetAmount: 1500000,
        description: '사무용품 및 장비 구매'
      },
      {
        category: BudgetCategory.TRAVEL,
        categoryNameKo: '출장비',
        budgetAmount: 3000000,
        description: '출장 관련 모든 비용'
      },
      {
        category: BudgetCategory.SOFTWARE,
        categoryNameKo: 'SW 라이선스',
        budgetAmount: 2500000,
        description: '소프트웨어 및 SaaS 구독료'
      },
      {
        category: BudgetCategory.OTHER,
        categoryNameKo: '기타',
        budgetAmount: 1000000,
        description: '기타 잡비'
      }
    ];

    for (const budgetData of defaultBudgets) {
      const budget = this.budgetRepository.create({
        month,
        companyId,
        ...budgetData,
        usedAmount: 0,
        percentage: 0,
        status: BudgetStatus.SAFE
      });
      await this.budgetRepository.save(budget);
    }
    } catch (error) {
      console.error('Error creating default budgets:', error);
    }
  }

  private async updateBudgetUsage(month: string, companyId: string): Promise<void> {
    try {
    // 해당 월의 지출 데이터 조회 (YYYY-MM 형식)
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.companyId = :companyId', { companyId })
      .andWhere('expense.transactionDate >= :startDate', { startDate })
      .andWhere('expense.transactionDate <= :endDate', { endDate })
      .andWhere('expense.status != :rejectedStatus', { rejectedStatus: 'REJECTED' })
      .getMany();

    // 카테고리별 지출 집계
    const expenseByCategory: Record<string, number> = {};
    
    for (const expense of expenses) {
      const category = this.mapExpenseCategoryToBudgetCategory(expense.category);
      if (category) {
        expenseByCategory[category] = (expenseByCategory[category] || 0) + expense.amount;
      }
    }

    // 예산 사용량 및 상태 업데이트
    const budgets = await this.budgetRepository.find({
      where: { month, companyId, isActive: true }
    });

    for (const budget of budgets) {
      const usedAmount = expenseByCategory[budget.category] || 0;
      const percentage = budget.budgetAmount > 0 ? (usedAmount / Number(budget.budgetAmount)) * 100 : 0;
      
      let status = BudgetStatus.SAFE;
      if (percentage >= 100) {
        status = BudgetStatus.EXCEEDED;
      } else if (percentage >= 80) {
        status = BudgetStatus.WARNING;
      }

      await this.budgetRepository.update(budget.id, {
        usedAmount,
        percentage: Math.round(percentage * 100) / 100, // 소수점 2자리
        status
      });
    }
    } catch (error) {
      console.error('Error updating budget usage:', error);
    }
  }

  private mapExpenseCategoryToBudgetCategory(expenseCategory: string): BudgetCategory | null {
    const categoryMap: Record<string, BudgetCategory> = {
      'ENTERTAINMENT': BudgetCategory.ENTERTAINMENT,
      'OFFICE_SUPPLIES': BudgetCategory.OFFICE_SUPPLIES,
      'TRAVEL': BudgetCategory.TRAVEL,
      'SOFTWARE': BudgetCategory.SOFTWARE,
      'OTHER': BudgetCategory.OTHER,
      // BusinessExpense의 실제 카테고리들과 매핑
      'entertainment': BudgetCategory.ENTERTAINMENT,
      'office_supplies': BudgetCategory.OFFICE_SUPPLIES,
      'travel': BudgetCategory.TRAVEL,
      'software': BudgetCategory.SOFTWARE,
      'other': BudgetCategory.OTHER,
    };

    return categoryMap[expenseCategory] || BudgetCategory.OTHER;
  }

  async createBudget(budgetData: Partial<Budget>): Promise<Budget> {
    const budget = this.budgetRepository.create(budgetData);
    return this.budgetRepository.save(budget);
  }

  async updateBudget(id: string, budgetData: Partial<Budget>): Promise<Budget> {
    await this.budgetRepository.update(id, budgetData);
    return this.budgetRepository.findOne({ where: { id } });
  }

  async deleteBudget(id: string): Promise<void> {
    await this.budgetRepository.update(id, { isActive: false });
  }
}