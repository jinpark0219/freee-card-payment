import { CardProvider } from '../card-provider/card-provider.entity';
import { BusinessExpense } from '../business-expense/business-expense.entity';
import { Company } from '../company/company.entity';
import { Employee } from '../employee/employee.entity';
export declare enum BusinessCardStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    EXPIRED = "expired",
    CANCELLED = "cancelled"
}
export declare enum BusinessCardType {
    CORPORATE = "corporate",
    EMPLOYEE = "employee",
    PREPAID = "prepaid"
}
export declare class BusinessCard {
    id: string;
    cardNumberMasked: string;
    cardHolderName: string;
    cardHolderNameEn?: string;
    expiryDate: string;
    status: BusinessCardStatus;
    type: BusinessCardType;
    providerId: string;
    provider: CardProvider;
    companyId: string;
    company: Company;
    employeeId?: string;
    employee?: Employee;
    creditLimit: number;
    monthlyBudget?: number;
    dailyLimit?: number;
    singleTransactionLimit?: number;
    currentMonthUsage: number;
    availableBalance: number;
    lastTransactionDate?: Date;
    requiresApproval: boolean;
    approvalThreshold?: number;
    allowedCategories?: string[];
    blockedMerchants?: string[];
    externalCardId?: string;
    lastSyncAt?: Date;
    syncStatus: string;
    expenses: BusinessExpense[];
    createdAt: Date;
    updatedAt: Date;
    canTransact(amount: number): boolean;
    needsApproval(amount: number): boolean;
    updateMonthlyUsage(amount: number): void;
    isOverBudget(): boolean;
    getBudgetUtilization(): number;
    isHighRiskCard(): boolean;
}
