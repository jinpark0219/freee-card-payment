import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Sentry 초기화 함수
export function initSentry() {
  Sentry.init({
    // 실제 프로젝트에서는 환경변수로 관리
    dsn: process.env.SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/project-id',
    
    // 성능 모니터링 샘플링 (10%)
    tracesSampleRate: 0.1,
    
    // 프로파일링 샘플링 (10%)
    profilesSampleRate: 0.1,
    
    // 환경 설정
    environment: process.env.NODE_ENV || 'development',
    
    // 통합 설정
    integrations: [
      nodeProfilingIntegration(),
      // HTTP 요청 추적
      Sentry.httpIntegration(),
      // Express 통합
      Sentry.expressIntegration(),
    ],
    
    // 에러 필터링 (개발 환경에서는 모든 에러, 운영에서는 5xx만)
    beforeSend(event, hint) {
      // 개발 환경에서는 콘솔에도 출력
      if (process.env.NODE_ENV === 'development') {
        console.error('Sentry Error:', hint.originalException || hint.syntheticException);
      }
      
      return event;
    },
  });
}

// Express 에러 핸들러
export const sentryErrorHandler = Sentry.expressErrorHandler({
  shouldHandleError(error) {
    // 500번대 에러만 Sentry로 전송
    return error.status >= 500;
  },
});

// 수동 에러 리포팅
export function reportError(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional_info', context);
    }
    Sentry.captureException(error);
  });
}

// 성능 추적
export function trackPerformance(name: string, operation: () => Promise<any>) {
  return Sentry.startSpan({ name, op: 'function' }, operation);
}