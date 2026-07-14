import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.skillCategory.findMany({ orderBy: { order: 'asc' } });
  }

  async findAllWithSkills() {
    return this.prisma.skillCategory.findMany({
      orderBy: { order: 'asc' },
      include: { skills: { orderBy: { order: 'asc' } } },
    });
  }

  async create(data: { title: string; titleFa?: string; order?: number }) {
    return this.prisma.skillCategory.create({ data });
  }

  async update(
    id: string,
    data: { title?: string; titleFa?: string; order?: number },
  ) {
    return this.prisma.skillCategory.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.skillCategory.delete({ where: { id } });
  }

  async reorder(items: { id: string; order: number }[]) {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.skillCategory.update({ where: { id: item.id }, data: { order: item.order } }),
      ),
    );
    return { updated: items.length };
  }
}
