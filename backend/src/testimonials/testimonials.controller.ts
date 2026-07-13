import { Controller, Get, Post, Body, HttpCode, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BadRequestException } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import type { UploadedFile as UploadedFileType } from '../uploads/uploads.service';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  findAll() {
    return this.testimonialsService.getApproved();
  }

  @Post()
  @HttpCode(201)
  create(
    @Body()
    body: {
      authorName: string;
      authorNameFa?: string;
      companyRole?: string;
      companyRoleFa?: string;
      content: string;
      contentFa?: string;
      authorImageUrl?: string;
      rating?: number;
    },
  ) {
    return this.testimonialsService.create(body);
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
