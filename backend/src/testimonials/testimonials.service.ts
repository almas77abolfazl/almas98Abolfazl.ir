import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestimonialsService {
  constructor(private readonly prisma: PrismaService) {}

  getApproved() {
    return this.prisma.testimonial.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: {
    authorName: string;
    authorNameFa?: string;
    companyRole?: string;
    companyRoleFa?: string;
    content: string;
    contentFa?: string;
    authorImageUrl?: string;
    rating?: number;
  }) {
    return this.prisma.testimonial.create({
      data: { ...data, status: 'PENDING' },
    });
  }
}
