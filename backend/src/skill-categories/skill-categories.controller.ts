import { Controller, Get } from '@nestjs/common';
import { SkillCategoriesService } from './skill-categories.service';

@Controller('skill-categories')
export class SkillCategoriesController {
  constructor(private readonly skillCategoriesService: SkillCategoriesService) {}

  @Get()
  findAllWithSkills() {
    return this.skillCategoriesService.findAllWithSkills();
  }
}
