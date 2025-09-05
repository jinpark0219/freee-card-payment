'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 카드 상태 한국어 표시
const getCardStatusText = (status: string) => {
  switch (status) {
    case 'active': return '활성'
    case 'suspended': return '정지됨'
    case 'cancelled': return '취소됨'
    default: return status
  }
}

// 카드 브랜드 한국어 표시
const getCardBrandText = (brand: string) => {
  switch (brand) {
    case 'visa': return 'VISA'
    case 'mastercard': return 'Mastercard'
    case 'jcb': return 'JCB'
    case 'amex': return 'American Express'
    default: return brand
  }
}

interface Card {
  id: string
  cardholderName: string
  lastFour: string
  brand: string
  expiryDate: string
  status: string
  creditLimit: number
  availableBalance: number
}

export default function CardsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // 카드 목록 조회
  const { data: cards, isLoading } = useQuery<Card[]>({
    queryKey: ['cards'],
    queryFn: async () => {
      const response = await fetch('/api/cards')
      if (!response.ok) {
        throw new Error('카드 목록을 불러오는데 실패했습니다')
      }
      return response.json()
    },
  })

  // 상태별 필터링
  const filteredCards = cards?.filter(card => 
    filterStatus === 'all' || card.status === filterStatus
  ) || []

  const handleCardAction = async (cardId: string, action: string) => {
    try {
      const response = await fetch(`/api/cards/${cardId}/${action}`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('카드 상태 변경에 실패했습니다')
      }
      // TODO: 데이터 다시 불러오기 또는 캐시 무효화
    } catch (error) {
      console.error('카드 액션 실행 실패:', error)
      alert('카드 상태 변경에 실패했습니다')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">카드 관리</h1>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">카드 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">카드 관리</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            새 카드 발급
          </button>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태별 필터
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">전체</option>
                <option value="active">활성</option>
                <option value="suspended">정지됨</option>
                <option value="cancelled">취소됨</option>
              </select>
            </div>
          </div>
        </div>

        {/* 카드 목록 */}
        <div className="grid gap-6">
          {filteredCards.length > 0 ? (
            filteredCards.map((card) => (
              <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {card.cardholderName}
                    </h3>
                    <p className="text-gray-600">
                      {getCardBrandText(card.brand)} •••• •••• •••• {card.lastFour}
                    </p>
                    <p className="text-sm text-gray-500">
                      만료일: {card.expiryDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      card.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : card.status === 'suspended'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getCardStatusText(card.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">신용한도</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ¥{card.creditLimit.toLocaleString('ja-JP')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">사용 가능 잔액</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ¥{card.availableBalance.toLocaleString('ja-JP')}
                    </p>
                  </div>
                </div>

                {/* 카드 액션 버튼 */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => window.open(`/cards/${card.id}`, '_blank')}
                    className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    상세 보기
                  </button>
                  
                  {card.status === 'active' && (
                    <button
                      onClick={() => handleCardAction(card.id, 'suspend')}
                      className="bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors"
                    >
                      카드 정지
                    </button>
                  )}
                  
                  {card.status === 'suspended' && (
                    <button
                      onClick={() => handleCardAction(card.id, 'activate')}
                      className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                    >
                      카드 활성화
                    </button>
                  )}
                  
                  {(card.status === 'active' || card.status === 'suspended') && (
                    <button
                      onClick={() => {
                        if (confirm('정말로 이 카드를 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                          handleCardAction(card.id, 'cancel')
                        }
                      }}
                      className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      카드 취소
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">카드가 없습니다</h3>
              <p className="text-gray-600 mb-4">
                {filterStatus === 'all' 
                  ? '아직 발급된 카드가 없습니다. 새 카드를 발급해보세요.' 
                  : '해당 상태의 카드가 없습니다.'}
              </p>
              {filterStatus === 'all' && (
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  첫 번째 카드 발급하기
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}