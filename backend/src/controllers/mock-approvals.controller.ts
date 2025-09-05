import { Controller, Get, Query } from '@nestjs/common';

@Controller('mock-approvals')
export class MockApprovalsController {
  @Get()
  async getMockApprovals(@Query('status') status: string = 'pending') {
    // Mock 승인 대기 데이터
    const mockExpenses = [
      {
        id: 'expense-1',
        amount: 85000,
        amountExcludingTax: 77273,
        taxAmount: 7727,
        merchantName: '스타벅스 신주쿠점',
        transactionDate: '2025-09-03T10:30:00Z',
        category: 'entertainment',
        status: 'pending',
        memo: '프로젝트 논의를 위한 커피 미팅',
        businessPurpose: '클라이언트 미팅',
        employee: {
          id: 'emp-1',
          name: '김대표',
          department: '경영진',
        },
        card: {
          id: 'card-1',
          cardholderName: '김대표',
          lastFour: '1234',
        },
        taxInfo: {
          taxType: 'taxable_10',
          qualifiedInvoice: true,
        },
        priority: 'medium',
        riskScore: 0.2,
        violations: [],
        receiptUrl: null,
        receiptVerified: true,
      },
      {
        id: 'expense-2',
        amount: 125000,
        amountExcludingTax: 113636,
        taxAmount: 11364,
        merchantName: '아마존 재팬',
        transactionDate: '2025-09-04T15:20:00Z',
        category: 'office_supplies',
        status: 'pending',
        memo: '개발팀용 노트북 스탠드 및 키보드',
        businessPurpose: '사무용품 구매',
        employee: {
          id: 'emp-2',
          name: '이직원',
          department: '개발팀',
        },
        card: {
          id: 'card-2',
          cardholderName: '이직원',
          lastFour: '5678',
        },
        taxInfo: {
          taxType: 'taxable_10',
          qualifiedInvoice: false,
        },
        priority: 'low',
        riskScore: 0.1,
        violations: [],
        receiptUrl: null,
        receiptVerified: false,
      },
      {
        id: 'expense-3',
        amount: 180000,
        amountExcludingTax: 163636,
        taxAmount: 16364,
        merchantName: '도큐 핸즈 시부야점',
        transactionDate: '2025-09-05T11:45:00Z',
        category: 'other',
        status: 'pending',
        memo: '회의실 화이트보드 및 의자',
        businessPurpose: '사무실 인테리어 용품',
        employee: {
          id: 'emp-2',
          name: '이직원',
          department: '개발팀',
        },
        card: {
          id: 'card-2',
          cardholderName: '이직원',
          lastFour: '5678',
        },
        taxInfo: {
          taxType: 'taxable_10',
          qualifiedInvoice: false,
        },
        priority: 'high',
        riskScore: 0.6,
        violations: ['EXCEEDS_SINGLE_TRANSACTION_LIMIT'],
        receiptUrl: null,
        receiptVerified: false,
      },
    ];

    const approvedExpenses = [
      {
        id: 'expense-4',
        amount: 45000,
        amountExcludingTax: 40909,
        taxAmount: 4091,
        merchantName: 'JR 동일본',
        transactionDate: '2025-09-02T08:15:00Z',
        category: 'travel',
        status: 'approved',
        memo: '신칸센 도쿄-오사카 왕복',
        businessPurpose: '고객사 방문',
        employee: {
          id: 'emp-1',
          name: '김대표',
          department: '경영진',
        },
        card: {
          id: 'card-1',
          cardholderName: '김대표',
          lastFour: '1234',
        },
        taxInfo: {
          taxType: 'taxable_10',
          qualifiedInvoice: true,
        },
        priority: 'low',
        riskScore: 0.1,
        violations: [],
        receiptUrl: null,
        receiptVerified: true,
        approvedAt: '2025-09-02T10:00:00Z',
        approvalComment: '정당한 출장비',
      },
    ];

    let filteredExpenses = [];
    if (status === 'pending') {
      filteredExpenses = mockExpenses;
    } else if (status === 'approved') {
      filteredExpenses = approvedExpenses;
    } else if (status === 'rejected') {
      filteredExpenses = []; // 거절된 항목은 없음
    }

    return {
      expenses: filteredExpenses,
      total: filteredExpenses.length,
      hasMore: false,
      statistics: {
        pending: mockExpenses.length,
        highRisk: mockExpenses.filter(e => e.riskScore > 0.7).length,
        overBudget: mockExpenses.filter(e => e.amount > 100000).length,
      },
    };
  }

  @Get('stats')
  async getMockStats() {
    return {
      total: {
        pending: 3,
        approved: 1,
        rejected: 0,
        highRisk: 1,
      },
      monthly: {
        pending: 3,
        approved: 1,
        rejected: 0,
      },
      performance: {
        averageApprovalTimeHours: 2,
        approvalRate: 100,
      },
    };
  }
}