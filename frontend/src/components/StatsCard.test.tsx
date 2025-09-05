import { render, screen } from '@testing-library/react'
import { StatsCard } from './StatsCard'
import { ChartBarIcon } from '@heroicons/react/24/outline'

describe('StatsCard', () => {
  const mockProps = {
    title: '이번 달 총 지출',
    value: '¥2,845,720',
    change: '+12.5%',
    changeType: 'increase' as const,
    icon: ChartBarIcon,
  }

  test('통계 정보를 올바르게 표시한다', () => {
    render(<StatsCard {...mockProps} />)
    
    expect(screen.getByText('이번 달 총 지출')).toBeInTheDocument()
    expect(screen.getByText('¥2,845,720')).toBeInTheDocument()
    expect(screen.getByText('+12.5%')).toBeInTheDocument()
  })

  test('증가 상태일 때 녹색으로 표시한다', () => {
    render(<StatsCard {...mockProps} />)
    
    const changeElement = screen.getByText('+12.5%')
    expect(changeElement).toHaveClass('text-green-600')
  })

  test('감소 상태일 때 빨간색으로 표시한다', () => {
    const decreaseProps = {
      ...mockProps,
      change: '-5.2%',
      changeType: 'decrease' as const,
    }
    
    render(<StatsCard {...decreaseProps} />)
    
    const changeElement = screen.getByText('-5.2%')
    expect(changeElement).toHaveClass('text-red-600')
  })

  test('아이콘이 올바르게 렌더링된다', () => {
    render(<StatsCard {...mockProps} />)
    
    const iconElement = screen.getByTestId('stats-icon')
    expect(iconElement).toBeInTheDocument()
  })
})