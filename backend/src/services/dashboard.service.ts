import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Card, CardStatus } from '../entities/card.entity';
import { CardTransaction, TransactionStatus } from '../entities/card-transaction.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(CardTransaction)
    private transactionRepository: Repository<CardTransaction>,
  ) {}

  async getStats() {
    try {
      // 현재 월의 시작일과 종료일 계산
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // 이번 달 총 지출 계산
      const monthlyTransactions = await this.transactionRepository.find({
        where: {
          transactionDate: Between(startOfMonth, endOfMonth),
          status: TransactionStatus.COMPLETED,
        },
      });

      const totalSpending = monthlyTransactions.reduce((sum, tx) => sum + tx.amount, 0);

      // 지난달 대비 증감률 계산
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const lastMonthTransactions = await this.transactionRepository.find({
        where: {
          transactionDate: Between(lastMonthStart, lastMonthEnd),
          status: TransactionStatus.COMPLETED,
        },
      });

      const lastMonthSpending = lastMonthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const changeRate = lastMonthSpending > 0 
        ? ((totalSpending - lastMonthSpending) / lastMonthSpending * 100).toFixed(1)
        : '0';

      // 활성 카드 수
      const activeCards = await this.cardRepository.count({
        where: { status: CardStatus.ACTIVE },
      });

      // 승인 대기 거래 수
      const pendingTransactions = await this.transactionRepository.count({
        where: { status: TransactionStatus.PENDING },
      });

      // 이번 달 완료된 거래 수
      const completedTransactions = await this.transactionRepository.count({
        where: {
          transactionDate: Between(startOfMonth, endOfMonth),
          status: TransactionStatus.COMPLETED,
        },
      });

      return {
        totalSpending: {
          value: totalSpending,
          formatted: `¥${totalSpending.toLocaleString('ja-JP')}`,
          change: `${parseFloat(changeRate) > 0 ? '+' : ''}${changeRate}%`,
          changeType: parseFloat(changeRate) >= 0 ? 'increase' : 'decrease',
        },
        activeCards: {
          value: activeCards,
          change: '+2', // 임시 데이터
          changeType: 'increase',
        },
        pendingTransactions: {
          value: pendingTransactions,
          change: '-3', // 임시 데이터
          changeType: 'decrease',
        },
        completedTransactions: {
          value: completedTransactions,
          change: `+${completedTransactions - lastMonthTransactions.length}`,
          changeType: completedTransactions >= lastMonthTransactions.length ? 'increase' : 'decrease',
        },
      };
    } catch (error) {
      console.error('대시보드 통계 조회 실패:', error);
      throw new Error('대시보드 통계를 불러올 수 없습니다');
    }
  }

  async getBudgetOverview() {
    try {
      // 카테고리별 지출 집계
      const categoryBreakdown = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('transaction.category', 'category')
        .addSelect('SUM(transaction.amount)', 'total')
        .where('transaction.status = :status', { status: TransactionStatus.COMPLETED })
        .andWhere('transaction.transactionDate >= :startDate', { 
          startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
        })
        .groupBy('transaction.category')
        .getRawMany();

      // 색상 매핑
      const colorMap: Record<string, string> = {
        '식비': '#3B82F6',
        '생활용품': '#10B981',
        '도서': '#F59E0B',
        '의류': '#8B5CF6',
        '차량정비': '#EF4444',
        '전자제품': '#6366F1',
        '기타': '#6B7280',
      };

      const formattedBreakdown = categoryBreakdown.map(item => ({
        name: item.category || '기타',
        value: parseFloat(item.total),
        color: colorMap[item.category] || '#6B7280',
      }));

      // 총 예산과 사용액 계산 (임시 데이터)
      const totalBudget = 10000000; // 1000만엔
      const usedBudget = formattedBreakdown.reduce((sum, item) => sum + item.value, 0);

      return {
        totalBudget,
        usedBudget,
        categoryBreakdown: formattedBreakdown,
      };
    } catch (error) {
      console.error('예산 현황 조회 실패:', error);
      throw new Error('예산 현황을 불러올 수 없습니다');
    }
  }
}