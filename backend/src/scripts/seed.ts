import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from '../seeds/seed.service';

async function runSeed() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const seedService = app.get(SeedService);
  
  try {
    await seedService.seed();
    console.log('🎯 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await app.close();
  }
}

runSeed();