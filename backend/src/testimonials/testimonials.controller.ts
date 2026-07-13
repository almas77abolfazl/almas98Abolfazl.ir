import { Controller, Get, Post, Body, HttpCode, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BadRequestException, HttpException, Request } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { RateLimitService } from '../common/rate-limit.service';
import { isValidEmail } from '../common/validation.util';
import type { UploadedFile as UploadedFileType } from '../uploads/uploads.service';

@Controller('testimonials')
export class TestimonialsController {
  constructor(
    private readonly testimonialsService: TestimonialsService,
    private readonly rateLimit: RateLimitService,
  ) {}

  @Get()
  findAll() {
    return this.testimonialsService.getApproved();
  }

  @Post()
  @HttpCode(201)
  create(
    @Req() req: Request,
    @Body()
    body: {
      authorName: string;
      authorNameFa?: string;
      companyRole?: string;
      companyRoleFa?: string;
      email?: string;
      content: string;
      contentFa?: string;
      authorImageUrl?: string;
    },
  ) {
    const authorName = body.authorName?.trim();
    const content = body.content?.trim();
    const email = body.email?.trim();
    if (!authorName || !content) {
      throw new BadRequestException('Name and message are required.');
    }
    if (!email || !isValidEmail(email)) {
      throw new BadRequestException('A valid email is required.');
    }
    // Rate-limit only valid submissions so honest users who mistype don't get locked out.
    const ip = (req as any).ip ?? (req as any).socket?.remoteAddress ?? 'unknown';
    if (!this.rateLimit.isAllowed(`testimonial:${ip}`)) {
      throw new HttpException('Too many requests, please try again later.', 429);
    }
    return this.testimonialsService.create({
      authorName,
      authorNameFa: body.authorNameFa?.trim() || undefined,
      companyRole: body.companyRole?.trim() || undefined,
      companyRoleFa: body.companyRoleFa?.trim() || undefined,
      email,
      content,
      contentFa: body.contentFa?.trim() || undefined,
      authorImageUrl: body.authorImageUrl?.trim() || undefined,
    });
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed'), false);
        }
      },
    }),
  )
  upload(@UploadedFile() file: UploadedFileType) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.testimonialsService.uploadImage(file);
  }
}
