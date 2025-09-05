'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  ChartBarIcon,
  CurrencyYenIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface BudgetCategory {
  id: string
  name: string
  nameKo: string
  budgetAmount: number
  usedAmount: number
  percentage: number
  status: 'safe' | 'warning' | 'exceeded'
  description?: string
}

interface MonthlyBudget {
  month: string
  totalBudget: number
  totalUsed: number
  categories: BudgetCategory[]
}

// API에서 가져올 데이터 타입과 매칭

const statusColors = {
  safe: 'bg-green-100 border-green-500',
  warning: 'bg-yellow-100 border-yellow-500',
  exceeded: 'bg-red-100 border-red-500'
}

const statusIcons = {
  safe: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  exceeded: ExclamationTriangleIcon
}

const statusLabels = {
  safe: '안전',
  warning: '주의',
  exceeded: '초과'
}

export default function BudgetsPage() {
  const [selectedMonth, setSelectedMonth] = useState('2025-09')
  const [showAddModal, setShowAddModal] = useState(false)

  const { data: budgetData, isLoading } = useQuery({
    queryKey: ['budget', selectedMonth],
    queryFn: async () => {
      const response = await fetch(`/api/budgets/${selectedMonth}`)
      if (!response.ok) throw new Error('예산 데이터를 불러올 수 없습니다')
      const result = await response.json()
      return result.data
    },
  })

  const overallPercentage = budgetData ? (budgetData.totalUsed / budgetData.totalBudget) * 100 : 0

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                예산 관리
              </h1>
              <p className="text-gray-600">
                월별 예산을 설정하고 지출 현황을 모니터링하세요
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              예산 추가
            </button>
          </div>
        </div>

        {/* 월 선택 */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="2025-09">2025년 9월</option>
              <option value="2025-08">2025년 8월</option>
              <option value="2025-07">2025년 7월</option>
            </select>
          </div>
        </div>

        {/* 전체 예산 개요 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">월 예산 현황</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                ¥{budgetData?.totalBudget?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-500">총 예산</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                ¥{budgetData?.totalUsed?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-500">사용 금액</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                ¥{((budgetData?.totalBudget || 0) - (budgetData?.totalUsed || 0)).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">잔여 예산</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${
                overallPercentage > 90 ? 'text-red-600' : 
                overallPercentage > 70 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {overallPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">사용률</div>
            </div>
          </div>

          {/* 전체 진행률 바 */}
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-300 ${
                overallPercentage > 100 ? 'bg-red-500' :
                overallPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* 카테고리별 예산 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">카테고리별 예산</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {(budgetData?.categories || []).map((category: BudgetCategory) => {
              const StatusIcon = statusIcons[category.status]
              
              return (
                <div key={category.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border-l-4 ${statusColors[category.status]}`}></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{category.nameKo}</h3>
                        <p className="text-sm text-gray-500">{category.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          ¥{category.usedAmount.toLocaleString()} / ¥{category.budgetAmount.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <StatusIcon className={`w-4 h-4 ${
                            category.status === 'safe' ? 'text-green-500' :
                            category.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                          }`} />
                          <span className={
                            category.status === 'safe' ? 'text-green-600' :
                            category.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                          }>
                            {statusLabels[category.status]} ({category.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* 진행률 바 */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        category.status === 'exceeded' ? 'bg-red-500' :
                        category.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(category.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>¥0</span>
                    <span>¥{(category.budgetAmount / 2).toLocaleString()}</span>
                    <span>¥{category.budgetAmount.toLocaleString()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 예산 알림 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="font-medium">안전</span>
            </div>
            <p className="text-sm text-green-600">
              {(budgetData?.categories || []).filter((c: BudgetCategory) => c.status === 'safe').length}개 카테고리가 안전 범위 내에 있습니다
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-700 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="font-medium">주의</span>
            </div>
            <p className="text-sm text-yellow-600">
              {(budgetData?.categories || []).filter((c: BudgetCategory) => c.status === 'warning').length}개 카테고리가 80% 이상 사용되었습니다
            </p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="font-medium">초과</span>
            </div>
            <p className="text-sm text-red-600">
              {(budgetData?.categories || []).filter((c: BudgetCategory) => c.status === 'exceeded').length}개 카테고리가 예산을 초과했습니다
            </p>
          </div>
        </div>

        {/* 예산 추가 모달 (임시) */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">새 예산 카테고리 추가</h3>
              <p className="text-gray-600 mb-4">이 기능은 곧 구현될 예정입니다.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}