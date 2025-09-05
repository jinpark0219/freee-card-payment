import { Repository } from 'typeorm';
import { BusinessExpense } from '../domains/business-expense/business-expense.entity';
import { BusinessCard } from '../domains/business-card/business-card.entity';
import { CardGatewayFactory } from '../integrations/card-gateway/card-gateway-factory.service';
export interface ExpenseProcessingRequest {
    cardId: string;
    amount: number;
    merchantName: string;
    merchantCategoryCode?: string;
    transactionDate: Date;
    autoClassify?: boolean;
}
export interface ExpenseApprovalRequest {
    expenseId: string;
    approverId: string;
    approved: boolean;
    comment?: string;
}
export interface BudgetAlert {
    companyId: string;
    cardId?: string;
    department?: string;
    currentUsage: number;
    budgetLimit: number;
    utilizationRate: number;
    severity: 'warning' | 'danger';
}
export declare class ExpenseManagementService {
    private expenseRepository;
    private cardRepository;
    private readonly gatewayFactory;
    private readonly aiClassificationService;
    private readonly budgetService;
    private readonly approvalService;
    private readonly freeeAccountingApi;
    private readonly notificationService;
    constructor(expenseRepository: Repository<BusinessExpense>, cardRepository: Repository<BusinessCard>, gatewayFactory: CardGatewayFactory, aiClassificationService: any, budgetService: any, approvalService: any, freeeAccountingApi: any, notificationService: any);
    processNewExpense(request: ExpenseProcessingRequest): Promise<BusinessExpense>;
    approveExpense(request: ExpenseApprovalRequest): Promise<BusinessExpense>;
    monitorBudgets(companyId: string): Promise<BudgetAlert[]>;
    synchronizeAllTransactions(companyId: string): Promise<void>;
    private calculateJapanConsumptionTax;
    private checkExpensePolicy;
    private calculateRiskScore;
    private processExpenseAsync;
    private syncToFreeeAccounting;
    private getCardAverageTransactionAmount;
    private checkCompanyBudget;
    private checkCardBudgets;
    private checkDepartmentBudgets;
    private getCompanyWithCards;
    private processTransactionBatch;
}
