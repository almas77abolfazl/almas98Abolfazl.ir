import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.projects.findMany({ orderBy: { order: 'asc' } });
  }

  async findById(id: string) {
    const project = await this.prisma.projects.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }
}
