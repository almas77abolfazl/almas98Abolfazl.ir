import { Controller, Get, Header } from '@nestjs/common';
import { SitemapService } from './sitemap.service';

// With the global 'api' prefix this resolves to GET /api/sitemap.xml.
// Nginx maps the public /sitemap.xml to this endpoint.
@Controller('sitemap.xml')
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Get()
  @Header('Content-Type', 'application/xml; charset=utf-8')
  generate() {
    return this.sitemapService.generate();
  }
}
