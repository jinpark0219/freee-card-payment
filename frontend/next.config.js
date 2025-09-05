/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Docker 빌드용
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/:path*`
          : 'http://localhost:3000/:path*' // 로컬 개발용
      }
    ]
  }
}

module.exports = nextConfig