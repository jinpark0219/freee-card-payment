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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardProvider = exports.CardProviderStatus = exports.CardProviderType = void 0;
const typeorm_1 = require("typeorm");
const business_card_entity_1 = require("../business-card/business-card.entity");
var CardProviderType;
(function (CardProviderType) {
    CardProviderType["FREEE_NATIVE"] = "freee-native";
    CardProviderType["PARTNER"] = "partner";
    CardProviderType["EXTERNAL"] = "external";
})(CardProviderType || (exports.CardProviderType = CardProviderType = {}));
var CardProviderStatus;
(function (CardProviderStatus) {
    CardProviderStatus["ACTIVE"] = "active";
    CardProviderStatus["SUSPENDED"] = "suspended";
    CardProviderStatus["DEPRECATED"] = "deprecated";
})(CardProviderStatus || (exports.CardProviderStatus = CardProviderStatus = {}));
let CardProvider = class CardProvider {
    isRealTime() {
        return this.realTimeSync && this.type === CardProviderType.FREEE_NATIVE;
    }
    getExpectedSyncDelay() {
        if (this.realTimeSync)
            return 0;
        return this.syncIntervalMinutes || 1440;
    }
    calculateRevenue(transactionAmount) {
        return Math.round(transactionAmount * this.revenueShareRate);
    }
    isHighPriority() {
        return this.type === CardProviderType.FREEE_NATIVE || this.dataAccuracy >= 0.9;
    }
};
exports.CardProvider = CardProvider;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CardProvider.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CardProvider.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CardProvider.prototype, "displayName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CardProviderType,
    }),
    __metadata("design:type", String)
], CardProvider.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CardProviderStatus,
        default: CardProviderStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], CardProvider.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'real_time_sync', default: false }),
    __metadata("design:type", Boolean)
], CardProvider.prototype, "realTimeSync", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'data_accuracy', type: 'decimal', precision: 3, scale: 2 }),
    __metadata("design:type", Number)
], CardProvider.prototype, "dataAccuracy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sync_interval_minutes', nullable: true }),
    __metadata("design:type", Number)
], CardProvider.prototype, "syncIntervalMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'api_endpoint', nullable: true }),
    __metadata("design:type", String)
], CardProvider.prototype, "apiEndpoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'webhook_url', nullable: true }),
    __metadata("design:type", String)
], CardProvider.prototype, "webhookUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requires_manual_sync', default: false }),
    __metadata("design:type", Boolean)
], CardProvider.prototype, "requiresManualSync", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revenue_share_rate', type: 'decimal', precision: 5, scale: 4 }),
    __metadata("design:type", Number)
], CardProvider.prototype, "revenueShareRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_acquisition_cost', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CardProvider.prototype, "customerAcquisitionCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_fee', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CardProvider.prototype, "processingFee", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_card_entity_1.BusinessCard, card => card.provider),
    __metadata("design:type", Array)
], CardProvider.prototype, "cards", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CardProvider.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CardProvider.prototype, "updatedAt", void 0);
exports.CardProvider = CardProvider = __decorate([
    (0, typeorm_1.Entity)('card_providers')
], CardProvider);
//# sourceMappingURL=card-provider.entity.js.map