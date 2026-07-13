import { Controller, Get, Header, Query } from '@nestjs/common';
import { RssService } from './rss.service';

// With the global 'api' prefix this resolves to GET /api/feed.xml.
// Nginx maps the public /feed.xml to this endpoint.
@Controller('feed.xml')
export class RssController {
  constructor(private readonly rssService: RssService) {}

  @Get()
  @Header('Content-Type', 'application/rss+xml; charset=utf-8')
  generate(@Query('lang') lang?: string) {
    const language = lang === 'fa' || lang === 'en' ? lang : undefined;
    return this.rssService.generate(language);
  }
}
