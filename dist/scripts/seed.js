"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const seed_service_1 = require("../seeds/seed.service");
async function runSeed() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { logger: false });
    const seedService = app.get(seed_service_1.SeedService);
    try {
        await seedService.seed();
        console.log('🎯 Seed completed successfully!');
    }
    catch (error) {
        console.error('❌ Seed failed:', error);
    }
    finally {
        await app.close();
    }
}
runSeed();
//# sourceMappingURL=seed.js.map