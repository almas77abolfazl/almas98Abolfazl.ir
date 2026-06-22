import { Controller, Get } from '@nestjs/common';
import { AboutMeService } from './about-me.service';

@Controller('about-me')
export class AboutMeController {
  constructor(private readonly aboutMeService: AboutMeService) {}

  @Get()
  find() {
    return this.aboutMeService.find();
  }
}
