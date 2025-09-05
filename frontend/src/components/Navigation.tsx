'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigationItems = [
  { name: '대시보드', href: '/', icon: '📊' },
  { name: '카드 관리', href: '/cards', icon: '💳' },
  { name: '거래 내역', href: '/transactions', icon: '📋' },
  { name: '지출 승인', href: '/approvals', icon: '✅' },
  { name: '예산 관리', href: '/budgets', icon: '💰' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-freee-600">
              freee 카드
            </Link>
          </div>

          {/* 네비게이션 메뉴 */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  pathname === item.href
                    ? 'bg-freee-50 text-freee-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          {/* 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              🔔
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-freee-100 rounded-full flex items-center justify-center">
                <span className="text-freee-700 text-sm font-medium">김</span>
              </div>
              <span className="text-sm text-gray-700">김사장님</span>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 (간단화) */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 py-3 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                pathname === item.href
                  ? 'bg-freee-50 text-freee-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}