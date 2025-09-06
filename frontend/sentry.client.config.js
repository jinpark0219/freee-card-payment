import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // 실제 프로젝트에서는 환경변수로 관리
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/project-id',
  
  // 성능 모니터링 샘플링 (10%)
  tracesSampleRate: 0.1,
  
  // 세션 재생 샘플링 (1%)
  replaysSessionSampleRate: 0.01,
  
  // 에러 발생시 세션 재생 샘플링 (100%)
  replaysOnErrorSampleRate: 1.0,
  
  // 환경 설정
  environment: process.env.NODE_ENV || 'development',
  
  // 통합 설정
  integrations: [
    Sentry.replayIntegration({
      // 민감한 데이터 마스킹
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: false,
    }),
  ],
  
  // 에러 필터링
  beforeSend(event, hint) {
    // 개발 환경에서는 콘솔에도 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Frontend Error:', hint.originalException || hint.syntheticException);
    }
    
    return event;
  },
});