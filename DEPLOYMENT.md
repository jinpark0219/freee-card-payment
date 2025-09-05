# Freee Card Payment System - Deployment Status

## 배포 환경
- **AWS 리전**: ap-northeast-1 (도쿄)
- **배포 방식**: GitHub Actions CI/CD

## AWS 리소스
### RDS PostgreSQL
- **엔드포인트**: freee-card-db.c1ica22wkwn9.ap-northeast-1.rds.amazonaws.com
- **포트**: 5432
- **인스턴스**: db.t3.micro (프리 티어)

### ECS 클러스터
- **클러스터명**: freee-card-cluster
- **서비스명**: freee-card-service  
- **인스턴스**: t3.micro (프리 티어)
- **공개 IP**: 57.181.39.39

### ECR 리포지토리
- **백엔드**: 886284876191.dkr.ecr.ap-northeast-1.amazonaws.com/freee-card-backend
- **프론트엔드**: 886284876191.dkr.ecr.ap-northeast-1.amazonaws.com/freee-card-frontend

### S3 버킷
- **프론트엔드**: freee-card-payment-frontend

## 배포 상태
- **인프라 설정**: ✅ 완료
- **GitHub Actions**: ✅ 설정 완료
- **자동 배포**: 🚀 준비 완료

배포 일시: 2025-09-06 02:06 KST