import { Controller, Get, Ip, Param, Post, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll(@Query('lang') lang?: string) {
    return this.articlesService.findPublished(lang);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Post(':slug/like')
  like(@Param('slug') slug: string, @Ip() ip: string) {
    return this.articlesService.likeArticle(slug, ip);
  }
}
