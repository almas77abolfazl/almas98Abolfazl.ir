import { Controller, Post, Body, HttpCode, Req } from '@nestjs/common';
import { Request, BadRequestException, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RateLimitService } from '../common/rate-limit.service';
import { isValidEmail } from '../common/validation.util';

@Controller('contact-messages')
export class ContactMessagesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLimit: RateLimitService,
  ) {}

  @Post()
  @HttpCode(201)
  async create(
    @Req() req: Request,
    @Body()
    body: {
      name: string;
      email: string;
      subject?: string;
      message: string;
    },
  ) {
    const name = body.name?.trim();
    const email = body.email?.trim();
    const message = body.message?.trim();
    if (!name || !message) {
      throw new BadRequestException('Name and message are required.');
    }
    if (!email || !isValidEmail(email)) {
      throw new BadRequestException('A valid email is required.');
    }
    // Rate-limit only valid submissions so honest users who mistype don't get locked out.
    const ip = (req as any).ip ?? (req as any).socket?.remoteAddress ?? 'unknown';
    if (!this.rateLimit.isAllowed(`contact:${ip}`)) {
      throw new HttpException('Too many requests, please try again later.', 429);
    }
    return this.prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: body.subject?.trim() || undefined,
        message,
      },
    });
  }
}
