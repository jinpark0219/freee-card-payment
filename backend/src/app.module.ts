import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Card } from './entities/card.entity';
import { CardTransaction } from './entities/card-transaction.entity';
import { CardService } from './services/card.service';
import { TransactionService } from './services/transaction.service';
import { CardController } from './controllers/card.controller';
import { TransactionController } from './controllers/transaction.controller';
import { SeedService } from './seeds/seed.service';
import { SeedController } from './seeds/seed.controller';
import { DashboardService } from './services/dashboard.service';
import { DashboardController } from './controllers/dashboard.controller';
import { ApprovalService } from './services/approval.service';
import { ApprovalController } from './controllers/approval.controller';
import { TestDataController } from './controllers/test-data.controller';
import { BusinessExpense } from './domains/business-expense/business-expense.entity';
import { BusinessCard } from './domains/business-card/business-card.entity';
import { Employee } from './entities/employee.entity';
import { Company } from './entities/company.entity';
import { CardProvider } from './domains/card-provider/card-provider.entity';
import { Budget } from './entities/budget.entity';
import { BudgetService } from './services/budget.service';
import { BudgetController } from './controllers/budget.controller';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USER', 'pinplay'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_NAME', 'freee_card'),
        entities: [Card, CardTransaction, BusinessExpense, BusinessCard, Employee, Company, CardProvider, Budget],
        synchronize: false,
        logging: false,
        cache: false, // 메모리 절약을 위해 캐시 비활성화
        maxQueryExecutionTime: 1000, // 느린 쿼리 방지
        extra: {
          max: 5, // 최대 연결 수 제한 (기본값: 10)
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        }
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Card, CardTransaction, BusinessExpense, BusinessCard, Employee, Company, CardProvider, Budget]),
  ],
  controllers: [CardController, TransactionController, SeedController, DashboardController, ApprovalController, TestDataController, BudgetController, HealthController],
  providers: [CardService, TransactionService, SeedService, DashboardService, ApprovalService, BudgetService],
})
export class AppModule {}