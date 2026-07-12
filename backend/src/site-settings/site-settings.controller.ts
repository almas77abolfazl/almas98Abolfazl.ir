import { Controller, Get } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';

@Controller('settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  getSettings() {
    return this.siteSettingsService.getSettings();
  }
}
