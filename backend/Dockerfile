# Node.js 18 Alpine 기반 이미지 사용
FROM node:18-alpine

# curl 설치 (헬스체크용)
RUN apk add --no-cache curl

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사 및 의존성 설치 (개발 의존성 포함)
COPY package*.json ./
RUN npm ci && npm cache clean --force

# 소스 코드 복사
COPY . .

# TypeScript 컴파일
RUN npm run build

# 비프로덕션 의존성 제거
RUN npm prune --production

# 포트 노출
EXPOSE 3000

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# 애플리케이션 실행
CMD ["node", "dist/main.js"]