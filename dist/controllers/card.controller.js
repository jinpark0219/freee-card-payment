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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const card_service_1 = require("../services/card.service");
const card_entity_1 = require("../entities/card.entity");
let CardController = class CardController {
    constructor(cardService) {
        this.cardService = cardService;
    }
    async listCards(userId) {
        return this.cardService.findByUserId(userId);
    }
    async getCard(cardId) {
        return this.cardService.findById(cardId);
    }
    async suspendCard(cardId) {
        return this.cardService.suspendCard(cardId);
    }
    async activateCard(cardId) {
        return this.cardService.activateCard(cardId);
    }
    async cancelCard(cardId) {
        return this.cardService.cancelCard(cardId);
    }
};
exports.CardController = CardController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all cards for a user' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', description: 'User ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of cards', type: [card_entity_1.Card] }),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CardController.prototype, "listCards", null);
__decorate([
    (0, common_1.Get)(':cardId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get card details' }),
    (0, swagger_1.ApiParam)({ name: 'cardId', description: 'Card ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Card details', type: card_entity_1.Card }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Card not found' }),
    __param(0, (0, common_1.Param)('cardId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CardController.prototype, "getCard", null);
__decorate([
    (0, common_1.Post)(':cardId/suspend'),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend a card' }),
    (0, swagger_1.ApiParam)({ name: 'cardId', description: 'Card ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Card suspended successfully', type: card_entity_1.Card }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Card not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Card cannot be suspended' }),
    __param(0, (0, common_1.Param)('cardId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CardController.prototype, "suspendCard", null);
__decorate([
    (0, common_1.Post)(':cardId/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate a suspended card' }),
    (0, swagger_1.ApiParam)({ name: 'cardId', description: 'Card ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Card activated successfully', type: card_entity_1.Card }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Card not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Card cannot be activated' }),
    __param(0, (0, common_1.Param)('cardId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CardController.prototype, "activateCard", null);
__decorate([
    (0, common_1.Post)(':cardId/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a card' }),
    (0, swagger_1.ApiParam)({ name: 'cardId', description: 'Card ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Card cancelled successfully', type: card_entity_1.Card }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Card not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Card cannot be cancelled' }),
    __param(0, (0, common_1.Param)('cardId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CardController.prototype, "cancelCard", null);
exports.CardController = CardController = __decorate([
    (0, swagger_1.ApiTags)('cards'),
    (0, common_1.Controller)('cards'),
    __metadata("design:paramtypes", [card_service_1.CardService])
], CardController);
//# sourceMappingURL=card.controller.js.map