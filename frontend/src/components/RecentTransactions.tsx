import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import clsx from 'clsx'

interface Transaction {
  id: string
  amount: number
  merchantName: string
  transactionDate: string
  status: string
  cardLastFour: string
  category: string
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  // 거래 상태를 한국어로 변환
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: '완료',
      pending: '대기중',
      failed: '실패',
      cancelled: '취소',
    }
    return statusMap[status] || status
  }

  // 거래 상태별 스타일 클래스
  const getStatusClass = (status: string) => {
    const statusClasses: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }
    return statusClasses[status] || 'bg-gray-100 text-gray-800'
  }

  // 금액 포맷팅 (일본 엔화)
  const formatAmount = (amount: number) => {
    return `¥${amount.toLocaleString('ja-JP')}`
  }

  if (transactions.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">최근 거래 내역</h3>
        <div className="text-center py-12">
          <p className="text-gray-500">거래 내역이 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">최근 거래 내역</h3>
        <button className="text-freee-600 hover:text-freee-700 text-sm font-medium">
          전체 보기
        </button>
      </div>
      
      <div className="space-y-4">
        {transactions.map((transaction) => {
          try {
            const transactionDate = new Date(transaction.transactionDate)
            
            return (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {transaction.merchantName}
                    </h4>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatAmount(transaction.amount)}
                    </span>
                  </div>
                  
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>****{transaction.cardLastFour}</span>
                      <span>•</span>
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>
                        {format(transactionDate, 'M월 d일 HH:mm', { locale: ko })}
                      </span>
                    </div>
                    
                    <span className={clsx(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      getStatusClass(transaction.status)
                    )}>
                      {getStatusText(transaction.status)}
                    </span>
                  </div>
                </div>
              </div>
            )
          } catch (error) {
            // 날짜 파싱 오류 처리
            console.error('Date parsing error for transaction:', transaction.id, error)
            return (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-red-500">
                  거래 정보를 불러올 수 없습니다
                </div>
              </div>
            )
          }
        })}
      </div>
    </div>
  )
}