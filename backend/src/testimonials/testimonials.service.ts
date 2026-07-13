import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class TestimonialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploads: UploadsService,
  ) {}

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
    email?: string;
    content: string;
    contentFa?: string;
    authorImageUrl?: string;
  }) {
    return this.prisma.testimonial.create({
      data: { ...data, status: 'PENDING' },
    });
  }

  uploadImage(file: { originalname: string; mimetype: string; size: number; buffer: Buffer }) {
    return this.uploads.save(file);
  }
}
