'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Expense {
  id: string
  amount: number
  amountExcludingTax: number
  taxAmount: number
  merchantName: string
  transactionDate: string
  category: string
  status: string
  memo?: string
  businessPurpose?: string
  employee?: {
    id: string
    name: string
    department: string
  }
  card?: {
    id: string
    cardholderName: string
    lastFour: string
  }
  taxInfo?: {
    taxType: string
    qualifiedInvoice: boolean
  }
  priority: 'low' | 'medium' | 'high' | 'urgent'
  riskScore: number
  violations: string[]
  receiptUrl?: string
  receiptVerified: boolean
}

interface ApprovalStats {
  total: {
    pending: number
    approved: number
    rejected: number
    highRisk: number
  }
  monthly: {
    pending: number
    approved: number
    rejected: number
  }
  performance: {
    averageApprovalTimeHours: number
    approvalRate: number
  }
}

// 우선순위 표시
const getPriorityBadge = (priority: string) => {
  const baseClass = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
  switch (priority) {
    case 'urgent':
      return `${baseClass} bg-red-100 text-red-800`
    case 'high':
      return `${baseClass} bg-orange-100 text-orange-800`
    case 'medium':
      return `${baseClass} bg-yellow-100 text-yellow-800`
    default:
      return `${baseClass} bg-gray-100 text-gray-800`
  }
}

// 카테고리 한국어 표시
const getCategoryText = (category: string) => {
  const categoryMap: Record<string, string> = {
    'office_supplies': '사무용품',
    'travel': '여비교통비',
    'entertainment': '접대비',
    'advertising': '광고선전비',
    'education': '교육연수비',
    'communication': '통신비',
    'utilities': '수도광열비',
    'rent': '임차료',
    'software': '소프트웨어',
    'other': '기타'
  }
  return categoryMap[category] || category
}

export default function ApprovalsPage() {
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([])
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null)

  const queryClient = useQueryClient()

  // 승인 대기 목록 조회
  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['approvals', selectedStatus],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/approvals?status=${selectedStatus}&limit=50`)
      if (!response.ok) throw new Error('Failed to fetch approvals')
      return response.json()
    },
  })

  // 승인 통계 조회
  const { data: stats } = useQuery<ApprovalStats>({
    queryKey: ['approval-stats'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/approvals/stats`)
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    },
  })

  // 개별 승인/거절 처리
  const approvalMutation = useMutation({
    mutationFn: async ({ expenseId, approved, comment }: {
      expenseId: string
      approved: boolean
      comment?: string
    }) => {
      const endpoint = approved ? 'approve' : 'reject'
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/approvals/${expenseId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approverId: 'current-user-id', // 실제로는 로그인한 사용자 ID
          comment,
        }),
      })
      if (!response.ok) throw new Error('Approval failed')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
      queryClient.invalidateQueries({ queryKey: ['approval-stats'] })
    },
  })

  // 일괄 승인 처리
  const bulkApprovalMutation = useMutation({
    mutationFn: async ({ approved, comment }: {
      approved: boolean
      comment?: string
    }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/approvals/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenseIds: selectedExpenses,
          approverId: 'current-user-id',
          approved,
          comment,
        }),
      })
      if (!response.ok) throw new Error('Bulk approval failed')
      return response.json()
    },
    onSuccess: () => {
      setSelectedExpenses([])
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
      queryClient.invalidateQueries({ queryKey: ['approval-stats'] })
    },
  })

  const handleApproval = (expenseId: string, approved: boolean, comment?: string) => {
    approvalMutation.mutate({ expenseId, approved, comment })
  }

  const handleBulkApproval = (approved: boolean, comment?: string) => {
    bulkApprovalMutation.mutate({ approved, comment })
  }

  const toggleExpenseSelection = (expenseId: string) => {
    setSelectedExpenses(prev => 
      prev.includes(expenseId) 
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    )
  }

  const expenses = expensesData?.expenses || []

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">지출 승인</h1>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">승인 대기 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">지출 승인</h1>
          {selectedExpenses.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkApproval(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                disabled={bulkApprovalMutation.isPending}
              >
                선택 항목 일괄 승인 ({selectedExpenses.length})
              </button>
              <button
                onClick={() => handleBulkApproval(false)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                disabled={bulkApprovalMutation.isPending}
              >
                선택 항목 일괄 거절 ({selectedExpenses.length})
              </button>
            </div>
          )}
        </div>

        {/* 통계 요약 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">승인 대기</h3>
              <p className="text-2xl font-bold text-orange-600">{stats.total.pending}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">고위험</h3>
              <p className="text-2xl font-bold text-red-600">{stats.total.highRisk}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">평균 승인시간</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.performance.averageApprovalTimeHours}시간</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">승인률</h3>
              <p className="text-2xl font-bold text-green-600">{stats.performance.approvalRate}%</p>
            </div>
          </div>
        )}

        {/* 상태 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex space-x-1">
            {([
              { key: 'pending', label: '승인 대기', count: stats?.total.pending || 0 },
              { key: 'approved', label: '승인됨', count: stats?.total.approved || 0 },
              { key: 'rejected', label: '거절됨', count: stats?.total.rejected || 0 },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${ 
                  selectedStatus === tab.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* 지출 목록 */}
        <div className="space-y-4">
          {expenses.length > 0 ? (
            expenses.map((expense: Expense) => (
              <div key={expense.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {selectedStatus === 'pending' && (
                      <input
                        type="checkbox"
                        checked={selectedExpenses.includes(expense.id)}
                        onChange={() => toggleExpenseSelection(expense.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {expense.merchantName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {expense.employee?.name} ({expense.employee?.department}) • 
                        {expense.card?.cardholderName} ••••{expense.card?.lastFour}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(expense.transactionDate).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      ¥{expense.amount.toLocaleString('ja-JP')}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={getPriorityBadge(expense.priority)}>
                        {expense.priority === 'urgent' ? '긴급' : 
                         expense.priority === 'high' ? '높음' :
                         expense.priority === 'medium' ? '보통' : '낮음'}
                      </span>
                      {expense.riskScore > 0.7 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          고위험
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">카테고리</p>
                    <p className="font-medium">{getCategoryText(expense.category)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">세금 정보</p>
                    <p className="font-medium">
                      세액: ¥{expense.taxAmount?.toLocaleString('ja-JP')} 
                      {expense.taxInfo?.qualifiedInvoice && ' (적격청구서)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">영수증</p>
                    <p className="font-medium">
                      {expense.receiptVerified ? (
                        <span className="text-green-600">✓ 확인됨</span>
                      ) : (
                        <span className="text-yellow-600">⚠ 미확인</span>
                      )}
                    </p>
                  </div>
                </div>

                {expense.violations.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-1">정책 위반</p>
                    <ul className="text-sm text-red-700">
                      {expense.violations.map((violation, index) => (
                        <li key={index}>• {violation}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {expense.memo && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{expense.memo}</p>
                  </div>
                )}

                {/* 승인/거절 버튼 */}
                {selectedStatus === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproval(expense.id, true)}
                      className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                      disabled={approvalMutation.isPending}
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleApproval(expense.id, false, '추가 검토 필요')}
                      className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                      disabled={approvalMutation.isPending}
                    >
                      거절
                    </button>
                    <button
                      onClick={() => setExpandedExpense(expandedExpense === expense.id ? null : expense.id)}
                      className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      상세보기
                    </button>
                  </div>
                )}

                {/* 상세 정보 (펼침) */}
                {expandedExpense === expense.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">사업 목적</p>
                        <p className="text-gray-700">{expense.businessPurpose || '미입력'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">위험도 점수</p>
                        <p className="text-gray-700">{Math.round(expense.riskScore * 100)}점 / 100점</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">세금 유형</p>
                        <p className="text-gray-700">{expense.taxInfo?.taxType}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">영수증 URL</p>
                        {expense.receiptUrl ? (
                          <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:text-blue-800">
                            영수증 보기
                          </a>
                        ) : (
                          <p className="text-gray-700">없음</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedStatus === 'pending' ? '승인 대기 항목이 없습니다' :
                 selectedStatus === 'approved' ? '승인된 항목이 없습니다' :
                 '거절된 항목이 없습니다'}
              </h3>
              <p className="text-gray-600">
                {selectedStatus === 'pending' ? '새로운 지출 승인 요청을 기다리고 있습니다.' :
                 '해당 상태의 지출 항목이 없습니다.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}