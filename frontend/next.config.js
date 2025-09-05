/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // S3 정적 배포용
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig