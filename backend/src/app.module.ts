import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AboutMeModule } from './about-me/about-me.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { EducationsModule } from './educations/educations.module';
import { SkillsModule } from './skills/skills.module';
import { ArticlesModule } from './articles/articles.module';
import { MediaModule } from './media/media.module';
import { VideosModule } from './videos/videos.module';
import { ProjectsModule } from './projects/projects.module';
import { SitemapModule } from './sitemap/sitemap.module';
import { RssModule } from './rss/rss.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { RateLimitModule } from './common/rate-limit.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [PrismaModule, AboutMeModule, ExperiencesModule, EducationsModule, SkillsModule, ArticlesModule, MediaModule, VideosModule, ProjectsModule, SitemapModule, RssModule, AuthModule, AdminModule, ContactMessagesModule, AnalyticsModule, SiteSettingsModule, TestimonialsModule, RateLimitModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
