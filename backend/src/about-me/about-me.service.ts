import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AboutMeService {
  constructor(private readonly prisma: PrismaService) {}

  async find() {
    return this.prisma.aboutMe.findFirst();
  }
}
