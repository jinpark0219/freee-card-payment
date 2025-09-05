import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import clsx from 'clsx'

interface BudgetData {
  totalBudget: number
  usedBudget: number
  categoryBreakdown: {
    name: string
    value: number
    color: string
  }[]
}

interface BudgetOverviewProps {
  data?: BudgetData
}

export function BudgetOverview({ data }: BudgetOverviewProps) {
  if (!data) {
    return (
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">예산 현황</h3>
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  const utilizationRate = (data.usedBudget / data.totalBudget) * 100
  const remainingBudget = data.totalBudget - data.usedBudget

  // 예산 사용률에 따른 상태 색상
  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600'
    if (rate >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUtilizationBgColor = (rate: number) => {
    if (rate >= 90) return 'bg-red-100'
    if (rate >= 70) return 'bg-yellow-100'
    return 'bg-green-100'
  }

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return `¥${amount.toLocaleString('ja-JP')}`
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">예산 현황</h3>
        <span className={clsx(
          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
          getUtilizationBgColor(utilizationRate),
          getUtilizationColor(utilizationRate)
        )}>
          {utilizationRate.toFixed(1)}% 사용
        </span>
      </div>

      {/* 전체 예산 정보 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">사용한 금액</span>
          <span className="text-sm font-semibold text-gray-900">
            {formatAmount(data.usedBudget)}
          </span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">남은 예산</span>
          <span className="text-sm font-semibold text-gray-900">
            {formatAmount(remainingBudget)}
          </span>
        </div>
        
        {/* 진행률 바 */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={clsx(
              'h-2 rounded-full transition-all duration-300',
              {
                'bg-green-500': utilizationRate < 70,
                'bg-yellow-500': utilizationRate >= 70 && utilizationRate < 90,
                'bg-red-500': utilizationRate >= 90,
              }
            )}
            style={{ width: `${Math.min(utilizationRate, 100)}%` }}
          />
        </div>
      </div>

      {/* 카테고리별 분석 */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">카테고리별 지출</h4>
        
        {/* 차트 */}
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.categoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 범례 */}
        <div className="space-y-2">
          {data.categoryBreakdown.map((category, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-gray-600">{category.name}</span>
              </div>
              <span className="font-medium text-gray-900">
                {formatAmount(category.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}