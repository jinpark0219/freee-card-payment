import { create } from 'zustand'

// 카드 인터페이스
export interface Card {
  id: string
  cardholderName: string
  lastFour: string
  brand: string
  expiryDate: string
  status: string
  creditLimit: number
  availableBalance: number
}

// 카드 스토어 상태 인터페이스
interface CardStore {
  // 상태
  cards: Card[]
  isLoading: boolean
  error: string | null
  filterStatus: string

  // 액션
  setCards: (cards: Card[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilterStatus: (status: string) => void
  
  // 비즈니스 로직
  getFilteredCards: () => Card[]
  updateCardStatus: (cardId: string, newStatus: string) => void
}

// Zustand 스토어 생성
export const useCardStore = create<CardStore>((set, get) => ({
  // 초기 상태
  cards: [],
  isLoading: false,
  error: null,
  filterStatus: 'all',

  // 기본 액션
  setCards: (cards) => set({ cards }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),

  // 필터링된 카드 목록 반환
  getFilteredCards: () => {
    const { cards, filterStatus } = get()
    if (filterStatus === 'all') {
      return cards
    }
    return cards.filter(card => card.status === filterStatus)
  },

  // 카드 상태 업데이트
  updateCardStatus: (cardId, newStatus) => set((state) => ({
    cards: state.cards.map(card => 
      card.id === cardId 
        ? { ...card, status: newStatus }
        : card
    )
  }))
}))