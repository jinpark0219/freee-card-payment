/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*' // NestJS 백엔드로 프록시
      }
    ]
  }
}

module.exports = nextConfig