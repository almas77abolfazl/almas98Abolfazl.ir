import { Controller, Get, Post, Body, HttpCode, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BadRequestException, HttpException, Request } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { RateLimitService } from '../common/rate-limit.service';
import { isValidEmail } from '../common/validation.util';
import type { UploadedFile as UploadedFileType } from '../uploads/uploads.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';

const ALLOWED_AVATAR_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const UPLOAD_MAX_BYTES = 2 * 1024 * 1024;
const UPLOAD_RATE_LIMIT_MAX = 5;
const UPLOAD_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

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
  create(@Req() req: Request, @Body() body: CreateTestimonialDto) {
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
      limits: { fileSize: UPLOAD_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_AVATAR_MIMES.has(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only JPEG, PNG, and WebP images are allowed.'), false);
        }
      },
    }),
  )
  upload(@Req() req: Request, @UploadedFile() file: UploadedFileType) {
    const ip = (req as any).ip ?? (req as any).socket?.remoteAddress ?? 'unknown';
    if (!this.rateLimit.isAllowed(`testimonial-upload:${ip}`, UPLOAD_RATE_LIMIT_MAX, UPLOAD_RATE_LIMIT_WINDOW_MS)) {
      throw new HttpException('Too many upload requests, please try again later.', 429);
    }
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.testimonialsService.uploadImage(file);
  }
}
