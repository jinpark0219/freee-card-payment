import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/project-id',
  
  // 서버사이드 성능 모니터링 샘플링 (5%)
  tracesSampleRate: 0.05,
  
  environment: process.env.NODE_ENV || 'development',
  
  // 서버에서는 세션 재생 비활성화 (메모리 절약)
  integrations: [],
  
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Server Error:', hint.originalException || hint.syntheticException);
    }
    
    return event;
  },
});