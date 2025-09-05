'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  CalendarIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface Transaction {
  id: string
  amount: number
  merchantName: string
  transactionDate: string
  cardLastFour: string
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED'
  category: string
  memo?: string
}

const statusColors = {
  COMPLETED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800'
}

const statusLabels = {
  COMPLETED: '완료',
  PENDING: '대기중',
  FAILED: '실패',
  CANCELLED: '취소'
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions')
      if (!response.ok) throw new Error('거래 내역을 불러올 수 없습니다')
      const result = await response.json()
      return result.transactions || []
    },
  })

  const filteredTransactions = transactions
    .filter((tx: Transaction) => {
      const matchesSearch = tx.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tx.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a: Transaction, b: Transaction) => {
      let aValue, bValue
      if (sortBy === 'date') {
        aValue = new Date(a.transactionDate).getTime()
        bValue = new Date(b.transactionDate).getTime()
      } else {
        aValue = a.amount
        bValue = b.amount
      }
      
      if (sortOrder === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

  const handleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            거래 내역
          </h1>
          <p className="text-gray-600">
            모든 카드 거래 내역을 조회하고 관리하세요
          </p>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 검색 */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="가맹점명, 카테고리 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 상태 필터 */}
            <div className="relative">
              <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">모든 상태</option>
                <option value="COMPLETED">완료</option>
                <option value="PENDING">대기중</option>
                <option value="FAILED">실패</option>
                <option value="CANCELLED">취소</option>
              </select>
            </div>

            {/* 날짜 필터 (향후 구현) */}
            <div className="relative">
              <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="날짜 범위 (준비중)"
                disabled
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              총 {filteredTransactions.length}개의 거래
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleSort('date')}
                className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                  sortBy === 'date' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                날짜순
                {sortBy === 'date' && (
                  sortOrder === 'desc' ? 
                  <ArrowDownIcon className="w-3 h-3 ml-1" /> : 
                  <ArrowUpIcon className="w-3 h-3 ml-1" />
                )}
              </button>
              <button
                onClick={() => handleSort('amount')}
                className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                  sortBy === 'amount' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                금액순
                {sortBy === 'amount' && (
                  sortOrder === 'desc' ? 
                  <ArrowDownIcon className="w-3 h-3 ml-1" /> : 
                  <ArrowUpIcon className="w-3 h-3 ml-1" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 거래 목록 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    거래일시
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가맹점
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction: Transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.transactionDate).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {transaction.merchantName}
                      </div>
                      {transaction.memo && (
                        <div className="text-sm text-gray-500">
                          {transaction.memo}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      **** {transaction.cardLastFour}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ¥{transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[transaction.status]}`}>
                        {statusLabels[transaction.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        상세
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <CalendarIcon className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">거래 내역이 없습니다</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? '검색 조건에 맞는 거래를 찾을 수 없습니다' 
                  : '아직 거래 내역이 없습니다'}
              </p>
            </div>
          )}
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">총 거래 수</h3>
            <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">완료된 거래</h3>
            <p className="text-2xl font-bold text-green-600">
              {transactions.filter((tx: Transaction) => tx.status === 'COMPLETED').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">대기중인 거래</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {transactions.filter((tx: Transaction) => tx.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">총 거래 금액</h3>
            <p className="text-2xl font-bold text-blue-600">
              ¥{transactions.reduce((sum: number, tx: Transaction) => sum + tx.amount, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}