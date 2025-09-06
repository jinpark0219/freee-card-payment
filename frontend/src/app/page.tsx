'use client'

import { useQuery } from '@tanstack/react-query'
import { CreditCardIcon, ChartBarIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { apiClient } from '@/lib/api-client'
import { StatsCard } from '@/components/StatsCard'
import { RecentTransactions } from '@/components/RecentTransactions'
import { BudgetOverview } from '@/components/BudgetOverview'

export default function Dashboard() {
  // 대시보드 데이터 조회
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`)
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    },
  })

  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions?limit=5`)
      if (!response.ok) throw new Error('Failed to fetch transactions')
      return response.json()
    },
  })

  const { data: budgetData } = useQuery({
    queryKey: ['budget-overview'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/budget`)
      if (!response.ok) throw new Error('Failed to fetch budget')
      return response.json()
    },
  })

  const dashboardStats = [
    {
      title: '이번 달 총 지출',
      value: '¥2,845,720',
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: ChartBarIcon,
    },
    {
      title: '활성 카드',
      value: '24',
      change: '+2',
      changeType: 'increase' as const,
      icon: CreditCardIcon,
    },
    {
      title: '승인 대기',
      value: '8',
      change: '-3',
      changeType: 'decrease' as const,
      icon: ClockIcon,
    },
    {
      title: '완료된 거래',
      value: '156',
      change: '+24',
      changeType: 'increase' as const,
      icon: CheckCircleIcon,
    },
  ]

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            대시보드
          </h1>
          <p className="text-gray-600">
            법인카드 지출 관리 및 승인 현황
          </p>
        </div>
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* 메인 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 최근 거래 */}
          <div className="lg:col-span-2">
            <RecentTransactions transactions={recentTransactions?.data?.transactions || []} />
          </div>

          {/* 예산 개요 */}
          <div>
            <BudgetOverview data={budgetData?.data} />
          </div>
        </div>
      </div>
    </div>
  )
}