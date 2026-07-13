import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';

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
}
