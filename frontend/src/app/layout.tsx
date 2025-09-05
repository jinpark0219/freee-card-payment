import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'freee Card Management',
  description: 'freee 통합 카드 지출 관리 시스템',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}