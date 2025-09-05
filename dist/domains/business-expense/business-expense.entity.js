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
exports.BusinessExpense = exports.JapanTaxType = exports.ExpenseCategory = exports.ExpenseStatus = void 0;
const typeorm_1 = require("typeorm");
const business_card_entity_1 = require("../business-card/business-card.entity");
const company_entity_1 = require("../company/company.entity");
const employee_entity_1 = require("../employee/employee.entity");
var ExpenseStatus;
(function (ExpenseStatus) {
    ExpenseStatus["PENDING"] = "pending";
    ExpenseStatus["APPROVED"] = "approved";
    ExpenseStatus["REJECTED"] = "rejected";
    ExpenseStatus["COMPLETED"] = "completed";
    ExpenseStatus["CANCELLED"] = "cancelled";
})(ExpenseStatus || (exports.ExpenseStatus = ExpenseStatus = {}));
var ExpenseCategory;
(function (ExpenseCategory) {
    ExpenseCategory["OFFICE_SUPPLIES"] = "office_supplies";
    ExpenseCategory["TRAVEL"] = "travel";
    ExpenseCategory["ENTERTAINMENT"] = "entertainment";
    ExpenseCategory["ADVERTISING"] = "advertising";
    ExpenseCategory["EDUCATION"] = "education";
    ExpenseCategory["COMMUNICATION"] = "communication";
    ExpenseCategory["UTILITIES"] = "utilities";
    ExpenseCategory["RENT"] = "rent";
    ExpenseCategory["MAINTENANCE"] = "maintenance";
    ExpenseCategory["INSURANCE"] = "insurance";
    ExpenseCategory["SOFTWARE"] = "software";
    ExpenseCategory["CLOUD_SERVICE"] = "cloud_service";
    ExpenseCategory["DOMAIN"] = "domain";
    ExpenseCategory["OTHER"] = "other";
})(ExpenseCategory || (exports.ExpenseCategory = ExpenseCategory = {}));
var JapanTaxType;
(function (JapanTaxType) {
    JapanTaxType["TAXABLE_10"] = "taxable_10";
    JapanTaxType["TAXABLE_8"] = "taxable_8";
    JapanTaxType["TAX_FREE"] = "tax_free";
    JapanTaxType["TAX_EXEMPT"] = "tax_exempt";
})(JapanTaxType || (exports.JapanTaxType = JapanTaxType = {}));
let BusinessExpense = class BusinessExpense {
    approve(approverId, comment) {
        this.status = ExpenseStatus.APPROVED;
        this.approverId = approverId;
        this.approvedAt = new Date();
        this.approvalComment = comment;
    }
    reject(approverId, reason) {
        this.status = ExpenseStatus.REJECTED;
        this.approverId = approverId;
        this.approvalComment = reason;
    }
    calculateTax() {
        switch (this.taxType) {
            case JapanTaxType.TAXABLE_10:
                this.taxAmount = Math.round(this.amountExcludingTax * 0.1);
                break;
            case JapanTaxType.TAXABLE_8:
                this.taxAmount = Math.round(this.amountExcludingTax * 0.08);
                break;
            default:
                this.taxAmount = 0;
        }
        this.amount = this.amountExcludingTax + this.taxAmount;
    }
    isHighRisk() {
        return this.riskScore > 0.7 || (this.policyViolations?.length || 0) > 0;
    }
    needsReceiptVerification() {
        return this.amount >= 30000 && !this.receiptVerified;
    }
    isEntertainmentExpense() {
        return this.category === ExpenseCategory.ENTERTAINMENT;
    }
    getAccountingPeriod() {
        const year = this.transactionDate.getMonth() >= 3 ?
            this.transactionDate.getFullYear() :
            this.transactionDate.getFullYear() - 1;
        return `${year}`;
    }
};
exports.BusinessExpense = BusinessExpense;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusinessExpense.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], BusinessExpense.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'amount_excluding_tax', type: 'bigint' }),
    __metadata("design:type", Number)
], BusinessExpense.prototype, "amountExcludingTax", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_amount', type: 'int' }),
    __metadata("design:type", Number)
], BusinessExpense.prototype, "taxAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'merchant_name' }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "merchantName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'merchant_category_code', nullable: true }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "merchantCategoryCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_date' }),
    __metadata("design:type", Date)
], BusinessExpense.prototype, "transactionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'posted_date', nullable: true }),
    __metadata("design:type", Date)
], BusinessExpense.prototype, "postedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'card_id' }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "cardId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_card_entity_1.BusinessCard, card => card.expenses),
    (0, typeorm_1.JoinColumn)({ name: 'card_id' }),
    __metadata("design:type", business_card_entity_1.BusinessCard)
], BusinessExpense.prototype, "card", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id' }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", typeof (_a = typeof company_entity_1.Company !== "undefined" && company_entity_1.Company) === "function" ? _a : Object)
], BusinessExpense.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id', nullable: true }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", typeof (_b = typeof employee_entity_1.Employee !== "undefined" && employee_entity_1.Employee) === "function" ? _b : Object)
], BusinessExpense.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ExpenseStatus,
        default: ExpenseStatus.PENDING,
    }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approver_id', nullable: true }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "approverId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_at', nullable: true }),
    __metadata("design:type", Date)
], BusinessExpense.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_comment', nullable: true }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "approvalComment", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ExpenseCategory,
    }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_code', nullable: true }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "accountCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', nullable: true }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_center', nullable: true }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "costCenter", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: JapanTaxType,
        default: JapanTaxType.TAXABLE_10,
    }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "taxType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_number', nullable: true }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qualified_invoice', default: false }),
    __metadata("design:type", Boolean)
], BusinessExpense.prototype, "qualifiedInvoice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receipt_url', nullable: true }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "receiptUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receipt_ocr_data', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], BusinessExpense.prototype, "receiptOcrData", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receipt_verified', default: false }),
    __metadata("design:type", Boolean)
], BusinessExpense.prototype, "receiptVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "memo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_purpose', nullable: true }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "businessPurpose", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attendees', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], BusinessExpense.prototype, "attendees", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_transaction_id', nullable: true }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "externalTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'freee_accounting_id', nullable: true }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "freeeAccountingId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sync_status', default: 'pending' }),
    __metadata("design:type", String)
], BusinessExpense.prototype, "syncStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'policy_violations', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], BusinessExpense.prototype, "policyViolations", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_score', type: 'decimal', precision: 3, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BusinessExpense.prototype, "riskScore", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BusinessExpense.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BusinessExpense.prototype, "updatedAt", void 0);
exports.BusinessExpense = BusinessExpense = __decorate([
    (0, typeorm_1.Entity)('business_expenses')
], BusinessExpense);
//# sourceMappingURL=business-expense.entity.js.map