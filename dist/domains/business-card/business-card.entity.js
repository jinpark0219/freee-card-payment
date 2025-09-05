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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessCard = exports.BusinessCardType = exports.BusinessCardStatus = void 0;
const typeorm_1 = require("typeorm");
const card_provider_entity_1 = require("../card-provider/card-provider.entity");
const business_expense_entity_1 = require("../business-expense/business-expense.entity");
const company_entity_1 = require("../company/company.entity");
const employee_entity_1 = require("../employee/employee.entity");
var BusinessCardStatus;
(function (BusinessCardStatus) {
    BusinessCardStatus["ACTIVE"] = "active";
    BusinessCardStatus["SUSPENDED"] = "suspended";
    BusinessCardStatus["EXPIRED"] = "expired";
    BusinessCardStatus["CANCELLED"] = "cancelled";
})(BusinessCardStatus || (exports.BusinessCardStatus = BusinessCardStatus = {}));
var BusinessCardType;
(function (BusinessCardType) {
    BusinessCardType["CORPORATE"] = "corporate";
    BusinessCardType["EMPLOYEE"] = "employee";
    BusinessCardType["PREPAID"] = "prepaid";
})(BusinessCardType || (exports.BusinessCardType = BusinessCardType = {}));
let BusinessCard = class BusinessCard {
    canTransact(amount) {
        if (this.status !== BusinessCardStatus.ACTIVE)
            return false;
        if (this.availableBalance < amount)
            return false;
        if (this.singleTransactionLimit && amount > this.singleTransactionLimit)
            return false;
        return true;
    }
    needsApproval(amount) {
        if (this.requiresApproval)
            return true;
        if (this.approvalThreshold && amount >= this.approvalThreshold)
            return true;
        return false;
    }
    updateMonthlyUsage(amount) {
        this.currentMonthUsage += amount;
        this.availableBalance = Math.max(0, this.availableBalance - amount);
        this.lastTransactionDate = new Date();
    }
    isOverBudget() {
        if (!this.monthlyBudget)
            return false;
        return this.currentMonthUsage > this.monthlyBudget;
    }
    getBudgetUtilization() {
        if (!this.monthlyBudget)
            return 0;
        return Math.min(100, (this.currentMonthUsage / this.monthlyBudget) * 100);
    }
    isHighRiskCard() {
        return (this.isOverBudget() ||
            this.syncStatus === 'failed' ||
            this.getBudgetUtilization() > 90);
    }
};
exports.BusinessCard = BusinessCard;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusinessCard.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'card_number_masked' }),
    __metadata("design:type", String)
], BusinessCard.prototype, "cardNumberMasked", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'card_holder_name' }),
    __metadata("design:type", String)
], BusinessCard.prototype, "cardHolderName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'card_holder_name_en', nullable: true }),
    __metadata("design:type", String)
], BusinessCard.prototype, "cardHolderNameEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expiry_date', length: 5 }),
    __metadata("design:type", String)
], BusinessCard.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BusinessCardStatus,
        default: BusinessCardStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], BusinessCard.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BusinessCardType,
    }),
    __metadata("design:type", String)
], BusinessCard.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'provider_id' }),
    __metadata("design:type", String)
], BusinessCard.prototype, "providerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => card_provider_entity_1.CardProvider, provider => provider.cards),
    (0, typeorm_1.JoinColumn)({ name: 'provider_id' }),
    __metadata("design:type", card_provider_entity_1.CardProvider)
], BusinessCard.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id' }),
    __metadata("design:type", String)
], BusinessCard.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, company => company.cards),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", typeof (_a = typeof company_entity_1.Company !== "undefined" && company_entity_1.Company) === "function" ? _a : Object)
], BusinessCard.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id', nullable: true }),
    __metadata("design:type", String)
], BusinessCard.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, employee => employee.cards),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", typeof (_b = typeof employee_entity_1.Employee !== "undefined" && employee_entity_1.Employee) === "function" ? _b : Object)
], BusinessCard.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_limit', type: 'bigint' }),
    __metadata("design:type", Number)
], BusinessCard.prototype, "creditLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monthly_budget', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], BusinessCard.prototype, "monthlyBudget", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'daily_limit', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BusinessCard.prototype, "dailyLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'single_transaction_limit', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BusinessCard.prototype, "singleTransactionLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_month_usage', type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], BusinessCard.prototype, "currentMonthUsage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'available_balance', type: 'bigint' }),
    __metadata("design:type", Number)
], BusinessCard.prototype, "availableBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_transaction_date', nullable: true }),
    __metadata("design:type", Date)
], BusinessCard.prototype, "lastTransactionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requires_approval', default: false }),
    __metadata("design:type", Boolean)
], BusinessCard.prototype, "requiresApproval", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_threshold', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BusinessCard.prototype, "approvalThreshold", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'allowed_categories', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], BusinessCard.prototype, "allowedCategories", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'blocked_merchants', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], BusinessCard.prototype, "blockedMerchants", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_card_id', nullable: true }),
    __metadata("design:type", String)
], BusinessCard.prototype, "externalCardId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_sync_at', nullable: true }),
    __metadata("design:type", Date)
], BusinessCard.prototype, "lastSyncAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sync_status', default: 'synced' }),
    __metadata("design:type", String)
], BusinessCard.prototype, "syncStatus", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_expense_entity_1.BusinessExpense, expense => expense.card),
    __metadata("design:type", Array)
], BusinessCard.prototype, "expenses", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BusinessCard.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BusinessCard.prototype, "updatedAt", void 0);
exports.BusinessCard = BusinessCard = __decorate([
    (0, typeorm_1.Entity)('business_cards')
], BusinessCard);
//# sourceMappingURL=business-card.entity.js.map