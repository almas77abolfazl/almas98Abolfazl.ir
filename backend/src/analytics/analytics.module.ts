import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
