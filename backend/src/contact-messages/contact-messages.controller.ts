import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('contact-messages')
export class ContactMessagesController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body()
    body: {
      name: string;
      email: string;
      subject?: string;
      message: string;
    },
  ) {
    return this.prisma.contactMessage.create({
      data: {
        name: body.name,
        email: body.email,
        subject: body.subject,
        message: body.message,
      },
    });
  }
}
