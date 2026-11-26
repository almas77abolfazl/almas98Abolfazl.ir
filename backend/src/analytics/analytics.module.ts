import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RateLimitModule } from '../common/rate-limit.module';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [PrismaModule, AuthModule, RateLimitModule],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
