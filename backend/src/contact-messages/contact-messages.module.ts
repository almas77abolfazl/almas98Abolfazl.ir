import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ContactMessagesController } from './contact-messages.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ContactMessagesController],
})
export class ContactMessagesModule {}
