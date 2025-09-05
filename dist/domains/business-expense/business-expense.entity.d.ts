import { BusinessCard } from '../business-card/business-card.entity';
import { Company } from '../company/company.entity';
import { Employee } from '../employee/employee.entity';
export declare enum ExpenseStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare enum ExpenseCategory {
    OFFICE_SUPPLIES = "office_supplies",
    TRAVEL = "travel",
    ENTERTAINMENT = "entertainment",
    ADVERTISING = "advertising",
    EDUCATION = "education",
    COMMUNICATION = "communication",
    UTILITIES = "utilities",
    RENT = "rent",
    MAINTENANCE = "maintenance",
    INSURANCE = "insurance",
    SOFTWARE = "software",
    CLOUD_SERVICE = "cloud_service",
    DOMAIN = "domain",
    OTHER = "other"
}
export declare enum JapanTaxType {
    TAXABLE_10 = "taxable_10",
    TAXABLE_8 = "taxable_8",
    TAX_FREE = "tax_free",
    TAX_EXEMPT = "tax_exempt"
}
export declare class BusinessExpense {
    id: string;
    amount: number;
    amountExcludingTax: number;
    taxAmount: number;
    merchantName: string;
    merchantCategoryCode?: string;
    transactionDate: Date;
    postedDate?: Date;
    cardId: string;
    card: BusinessCard;
    companyId: string;
    company: Company;
    employeeId?: string;
    employee?: Employee;
    status: ExpenseStatus;
    approverId?: string;
    approvedAt?: Date;
    approvalComment?: string;
    category: ExpenseCategory;
    accountCode?: string;
    projectId?: string;
    costCenter?: string;
    taxType: JapanTaxType;
    invoiceNumber?: string;
    qualifiedInvoice: boolean;
    receiptUrl?: string;
    receiptOcrData?: any;
    receiptVerified: boolean;
    memo?: string;
    businessPurpose?: string;
    attendees?: string[];
    externalTransactionId?: string;
    freeeAccountingId?: string;
    syncStatus: string;
    policyViolations?: string[];
    riskScore: number;
    createdAt: Date;
    updatedAt: Date;
    approve(approverId: string, comment?: string): void;
    reject(approverId: string, reason: string): void;
    calculateTax(): void;
    isHighRisk(): boolean;
    needsReceiptVerification(): boolean;
    isEntertainmentExpense(): boolean;
    getAccountingPeriod(): string;
}
