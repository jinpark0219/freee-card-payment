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
        synchronize: configService.get('NODE_ENV') !== 'production', // Don't use in production
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Card, CardTransaction, BusinessExpense, BusinessCard, Employee, Company, CardProvider, Budget]),
  ],
  controllers: [CardController, TransactionController, SeedController, DashboardController, ApprovalController, TestDataController, BudgetController],
  providers: [CardService, TransactionService, SeedService, DashboardService, ApprovalService, BudgetService],
})
export class AppModule {}