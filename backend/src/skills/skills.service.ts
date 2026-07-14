import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.skills.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
      include: { categoryRef: true },
    });
  }
}
