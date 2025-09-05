"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseManagementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_expense_entity_1 = require("../domains/business-expense/business-expense.entity");
const business_card_entity_1 = require("../domains/business-card/business-card.entity");
const card_gateway_factory_service_1 = require("../integrations/card-gateway/card-gateway-factory.service");
let ExpenseManagementService = class ExpenseManagementService {
    constructor(expenseRepository, cardRepository, gatewayFactory, aiClassificationService, budgetService, approvalService, freeeAccountingApi, notificationService) {
        this.expenseRepository = expenseRepository;
        this.cardRepository = cardRepository;
        this.gatewayFactory = gatewayFactory;
        this.aiClassificationService = aiClassificationService;
        this.budgetService = budgetService;
        this.approvalService = approvalService;
        this.freeeAccountingApi = freeeAccountingApi;
        this.notificationService = notificationService;
    }
    async processNewExpense(request) {
        const card = await this.cardRepository.findOne({
            where: { id: request.cardId },
            relations: ['provider', 'company', 'employee']
        });
        if (!card || !card.canTransact(request.amount)) {
            throw new Error('Card is not available for transaction');
        }
        let category = business_expense_entity_1.ExpenseCategory.OTHER;
        let accountCode;
        if (request.autoClassify !== false) {
            const classification = await this.aiClassificationService.classifyExpense({
                merchantName: request.merchantName,
                merchantCategoryCode: request.merchantCategoryCode,
                amount: request.amount,
                companyId: card.companyId
            });
            category = classification.category;
            accountCode = classification.accountCode;
        }
        const taxCalculation = this.calculateJapanConsumptionTax(request.amount, category);
        const expense = this.expenseRepository.create({
            amount: request.amount,
            amountExcludingTax: taxCalculation.amountExcludingTax,
            taxAmount: taxCalculation.taxAmount,
            merchantName: request.merchantName,
            merchantCategoryCode: request.merchantCategoryCode,
            transactionDate: request.transactionDate,
            cardId: request.cardId,
            companyId: card.companyId,
            employeeId: card.employeeId,
            category,
            accountCode,
            taxType: taxCalculation.taxType,
            status: card.needsApproval(request.amount) ? business_expense_entity_1.ExpenseStatus.PENDING : business_expense_entity_1.ExpenseStatus.APPROVED
        });
        const policyViolations = await this.checkExpensePolicy(expense, card);
        expense.policyViolations = policyViolations;
        expense.riskScore = await this.calculateRiskScore(expense, card);
        const savedExpense = await this.expenseRepository.save(expense);
        card.updateMonthlyUsage(request.amount);
        await this.cardRepository.save(card);
        this.processExpenseAsync(savedExpense, card);
        return savedExpense;
    }
    async approveExpense(request) {
        const expense = await this.expenseRepository.findOne({
            where: { id: request.expenseId },
            relations: ['card', 'company']
        });
        if (!expense) {
            throw new Error('Expense not found');
        }
        if (expense.status !== business_expense_entity_1.ExpenseStatus.PENDING) {
            throw new Error('Expense is not pending approval');
        }
        if (request.approved) {
            expense.approve(request.approverId, request.comment);
            await this.syncToFreeeAccounting(expense);
        }
        else {
            expense.reject(request.approverId, request.comment || 'Rejected');
        }
        const savedExpense = await this.expenseRepository.save(expense);
        await this.notificationService.sendApprovalNotification(savedExpense);
        return savedExpense;
    }
    async monitorBudgets(companyId) {
        const alerts = [];
        const companyAlert = await this.checkCompanyBudget(companyId);
        if (companyAlert)
            alerts.push(companyAlert);
        const cardAlerts = await this.checkCardBudgets(companyId);
        alerts.push(...cardAlerts);
        const departmentAlerts = await this.checkDepartmentBudgets(companyId);
        alerts.push(...departmentAlerts);
        const urgentAlerts = alerts.filter(alert => alert.severity === 'danger');
        if (urgentAlerts.length > 0) {
            await this.notificationService.sendUrgentBudgetAlerts(urgentAlerts);
        }
        return alerts;
    }
    async synchronizeAllTransactions(companyId) {
        const company = await this.getCompanyWithCards(companyId);
        const syncResults = [];
        for (const card of company.cards) {
            try {
                const gateway = this.gatewayFactory.createGateway(card.provider.type, { providerId: card.providerId });
                const endDate = new Date();
                const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                const transactions = await gateway.getTransactions(card.externalCardId, startDate, endDate);
                const processedCount = await this.processTransactionBatch(card, transactions);
                syncResults.push({
                    cardId: card.id,
                    providerType: card.provider.type,
                    transactionCount: processedCount,
                    success: true
                });
            }
            catch (error) {
                syncResults.push({
                    cardId: card.id,
                    providerType: card.provider.type,
                    error: error.message,
                    success: false
                });
            }
        }
        console.log('Synchronization completed:', syncResults);
    }
    calculateJapanConsumptionTax(amount, category) {
        let taxRate = 0.10;
        if (category === business_expense_entity_1.ExpenseCategory.OTHER) {
            taxRate = 0.08;
        }
        const amountExcludingTax = Math.round(amount / (1 + taxRate));
        const taxAmount = amount - amountExcludingTax;
        return {
            amountExcludingTax,
            taxAmount,
            taxType: taxRate === 0.10 ? 'taxable_10' : 'taxable_8'
        };
    }
    async checkExpensePolicy(expense, card) {
        const violations = [];
        if (card.singleTransactionLimit && expense.amount > card.singleTransactionLimit) {
            violations.push('EXCEEDS_SINGLE_TRANSACTION_LIMIT');
        }
        if (card.allowedCategories?.length && !card.allowedCategories.includes(expense.category)) {
            violations.push('RESTRICTED_CATEGORY');
        }
        if (card.blockedMerchants?.some(blocked => expense.merchantName.toLowerCase().includes(blocked.toLowerCase()))) {
            violations.push('BLOCKED_MERCHANT');
        }
        return violations;
    }
    async calculateRiskScore(expense, card) {
        let riskScore = 0;
        const avgAmount = await this.getCardAverageTransactionAmount(card.id);
        if (expense.amount > avgAmount * 3) {
            riskScore += 0.3;
        }
        if (expense.policyViolations && expense.policyViolations.length > 0) {
            riskScore += 0.4;
        }
        if (expense.merchantName.match(/[^\u0000-\u007F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) {
            riskScore += 0.2;
        }
        return Math.min(1.0, riskScore);
    }
    async processExpenseAsync(expense, card) {
        try {
            await this.budgetService.checkAndAlert(card.companyId, expense.amount);
            if (expense.riskScore > 0.7) {
                await this.approvalService.requestManualReview(expense);
            }
            if (expense.status === business_expense_entity_1.ExpenseStatus.APPROVED) {
                await this.syncToFreeeAccounting(expense);
            }
            await this.notificationService.sendTransactionNotification(expense);
        }
        catch (error) {
            console.error('Failed to process expense async:', error);
        }
    }
    async syncToFreeeAccounting(expense) {
        try {
            const journalEntry = {
                company_id: expense.companyId,
                issue_date: expense.transactionDate,
                details: [
                    {
                        account_item_id: expense.accountCode,
                        tax_code: expense.taxType,
                        amount: expense.amountExcludingTax,
                        description: `${expense.merchantName} - ${expense.memo || ''}`,
                        tag_ids: expense.projectId ? [expense.projectId] : []
                    }
                ]
            };
            const response = await this.freeeAccountingApi.post('/deals', journalEntry);
            expense.freeeAccountingId = response.data.id;
            expense.syncStatus = 'synced';
            await this.expenseRepository.save(expense);
        }
        catch (error) {
            expense.syncStatus = 'failed';
            await this.expenseRepository.save(expense);
            throw error;
        }
    }
    async getCardAverageTransactionAmount(cardId) {
        const result = await this.expenseRepository
            .createQueryBuilder('expense')
            .select('AVG(expense.amount)', 'avgAmount')
            .where('expense.cardId = :cardId', { cardId })
            .andWhere('expense.transactionDate > :thirtyDaysAgo', {
            thirtyDaysAgo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        })
            .getRawOne();
        return result.avgAmount || 0;
    }
    async checkCompanyBudget(companyId) {
        return null;
    }
    async checkCardBudgets(companyId) {
        return [];
    }
    async checkDepartmentBudgets(companyId) {
        return [];
    }
    async getCompanyWithCards(companyId) {
        return {};
    }
    async processTransactionBatch(card, transactions) {
        let processedCount = 0;
        for (const transaction of transactions) {
            try {
                const existingExpense = await this.expenseRepository.findOne({
                    where: { externalTransactionId: transaction.externalTransactionId }
                });
                if (!existingExpense) {
                    await this.processNewExpense({
                        cardId: card.id,
                        amount: transaction.amount,
                        merchantName: transaction.merchantName,
                        merchantCategoryCode: transaction.merchantCategoryCode,
                        transactionDate: transaction.transactionDate,
                        autoClassify: true
                    });
                    processedCount++;
                }
            }
            catch (error) {
                console.error(`Failed to process transaction ${transaction.externalTransactionId}:`, error);
            }
        }
        return processedCount;
    }
};
exports.ExpenseManagementService = ExpenseManagementService;
exports.ExpenseManagementService = ExpenseManagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_expense_entity_1.BusinessExpense)),
    __param(1, (0, typeorm_1.InjectRepository)(business_card_entity_1.BusinessCard)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof card_gateway_factory_service_1.CardGatewayFactory !== "undefined" && card_gateway_factory_service_1.CardGatewayFactory) === "function" ? _a : Object, Object, Object, Object, Object, Object])
], ExpenseManagementService);
//# sourceMappingURL=expense-management.service.js.map