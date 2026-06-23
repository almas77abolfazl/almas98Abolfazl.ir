import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExperiencesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.experiences.findMany({
      orderBy: { startDate: 'desc' },
    });
  }
}
