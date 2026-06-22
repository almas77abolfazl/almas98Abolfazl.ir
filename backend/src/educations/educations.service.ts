import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EducationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.educations.findMany({
      orderBy: { startDate: 'desc' },
    });
  }
}
