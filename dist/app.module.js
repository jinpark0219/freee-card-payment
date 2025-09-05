"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const card_entity_1 = require("./entities/card.entity");
const card_transaction_entity_1 = require("./entities/card-transaction.entity");
const card_service_1 = require("./services/card.service");
const transaction_service_1 = require("./services/transaction.service");
const card_controller_1 = require("./controllers/card.controller");
const transaction_controller_1 = require("./controllers/transaction.controller");
const seed_service_1 = require("./seeds/seed.service");
const seed_controller_1 = require("./seeds/seed.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5432),
                    username: configService.get('DB_USER', 'pinplay'),
                    password: configService.get('DB_PASSWORD', ''),
                    database: configService.get('DB_NAME', 'freee_card'),
                    entities: [card_entity_1.Card, card_transaction_entity_1.CardTransaction],
                    synchronize: configService.get('NODE_ENV') !== 'production',
                    logging: configService.get('NODE_ENV') === 'development',
                }),
                inject: [config_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forFeature([card_entity_1.Card, card_transaction_entity_1.CardTransaction]),
        ],
        controllers: [card_controller_1.CardController, transaction_controller_1.TransactionController, seed_controller_1.SeedController],
        providers: [card_service_1.CardService, transaction_service_1.TransactionService, seed_service_1.SeedService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map