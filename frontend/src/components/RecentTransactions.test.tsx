import { render, screen } from '@testing-library/react'
import { RecentTransactions } from './RecentTransactions'

const mockTransactions = [
  {
    id: '1',
    amount: 50000,
    merchantName: '스타벅스 강남점',
    transactionDate: '2025-09-05T09:30:00Z',
    status: 'completed',
    cardLastFour: '1234',
    category: '식비',
  },
  {
    id: '2',
    amount: 120000,
    merchantName: '롯데마트',
    transactionDate: '2025-09-04T14:20:00Z',
    status: 'pending',
    cardLastFour: '5678',
    category: '생활용품',
  }
]

describe('RecentTransactions', () => {
  test('거래 목록을 올바르게 표시한다', () => {
    render(<RecentTransactions transactions={mockTransactions} />)
    
    expect(screen.getByText('최근 거래 내역')).toBeInTheDocument()
    expect(screen.getByText('스타벅스 강남점')).toBeInTheDocument()
    expect(screen.getByText('롯데마트')).toBeInTheDocument()
  })

  test('거래 금액을 통화 형식으로 표시한다', () => {
    render(<RecentTransactions transactions={mockTransactions} />)
    
    expect(screen.getByText('¥50,000')).toBeInTheDocument()
    expect(screen.getByText('¥120,000')).toBeInTheDocument()
  })

  test('거래 상태를 올바르게 표시한다', () => {
    render(<RecentTransactions transactions={mockTransactions} />)
    
    expect(screen.getByText('완료')).toBeInTheDocument()
    expect(screen.getByText('대기중')).toBeInTheDocument()
  })

  test('빈 목록일 때 적절한 메시지를 표시한다', () => {
    render(<RecentTransactions transactions={[]} />)
    
    expect(screen.getByText('거래 내역이 없습니다')).toBeInTheDocument()
  })

  test('카드 번호 마지막 4자리를 표시한다', () => {
    render(<RecentTransactions transactions={mockTransactions} />)
    
    expect(screen.getByText('****1234')).toBeInTheDocument()
    expect(screen.getByText('****5678')).toBeInTheDocument()
  })
})