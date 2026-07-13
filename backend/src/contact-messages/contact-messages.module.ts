import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RateLimitModule } from '../common/rate-limit.module';
import { ContactMessagesController } from './contact-messages.controller';

@Module({
  imports: [PrismaModule, RateLimitModule],
  controllers: [ContactMessagesController],
})
export class ContactMessagesModule {}
