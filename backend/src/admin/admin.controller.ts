import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // AboutMe
  @Get('about-me')
  findAboutMe() {
    return this.adminService.findAboutMe();
  }

  @Post('about-me')
  upsertAboutMe(
    @Body()
    body: {
      fullName: string;
      fullNameFa?: string;
      title: string;
      titleFa?: string;
      bio?: string;
      bioFa?: string;
      avatarUrl?: string;
      resumeUrl?: string;
    },
  ) {
    return this.adminService.upsertAboutMe(body);
  }

  @Delete('about-me/:id')
  deleteAboutMe(@Param('id') id: string) {
    return this.adminService.deleteAboutMe(id);
  }

  // Experiences
  @Get('experiences')
  findAllExperiences() {
    return this.adminService.findAllExperiences();
  }

  @Post('experiences')
  createExperience(
    @Body()
    body: {
      role: string;
      roleFa?: string;
      company: string;
      companyFa?: string;
      startDate: string;
      endDate?: string;
      description?: string;
      descriptionFa?: string;
      technologies: string[];
    },
  ) {
    return this.adminService.createExperience({
      ...body,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });
  }

  @Put('experiences/:id')
  updateExperience(
    @Param('id') id: string,
    @Body()
    body: {
      role?: string;
      roleFa?: string;
      company?: string;
      companyFa?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
      descriptionFa?: string;
      technologies?: string[];
    },
  ) {
    const data: any = { ...body };
    if (body.startDate) data.startDate = new Date(body.startDate);
    if (body.endDate) data.endDate = new Date(body.endDate);
    return this.adminService.updateExperience(id, data);
  }

  @Delete('experiences/:id')
  deleteExperience(@Param('id') id: string) {
    return this.adminService.deleteExperience(id);
  }

  // Educations
  @Get('educations')
  findAllEducations() {
    return this.adminService.findAllEducations();
  }

  @Post('educations')
  createEducation(
    @Body()
    body: {
      degree: string;
      degreeFa?: string;
      institution: string;
      institutionFa?: string;
      field?: string;
      fieldFa?: string;
      startDate: string;
      endDate?: string;
      description?: string;
      descriptionFa?: string;
    },
  ) {
    return this.adminService.createEducation({
      ...body,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });
  }

  @Put('educations/:id')
  updateEducation(
    @Param('id') id: string,
    @Body()
    body: {
      degree?: string;
      degreeFa?: string;
      institution?: string;
      institutionFa?: string;
      field?: string;
      fieldFa?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
      descriptionFa?: string;
    },
  ) {
    const data: any = { ...body };
    if (body.startDate) data.startDate = new Date(body.startDate);
    if (body.endDate) data.endDate = new Date(body.endDate);
    return this.adminService.updateEducation(id, data);
  }

  @Delete('educations/:id')
  deleteEducation(@Param('id') id: string) {
    return this.adminService.deleteEducation(id);
  }

  // Skills
  @Get('skills')
  findAllSkills() {
    return this.adminService.findAllSkills();
  }

  @Post('skills')
  createSkill(
    @Body()
    body: {
      name: string;
      nameFa?: string;
      category: string;
      categoryFa?: string;
      proficiency?: number;
    },
  ) {
    return this.adminService.createSkill(body);
  }

  @Put('skills/:id')
  updateSkill(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      nameFa?: string;
      category?: string;
      categoryFa?: string;
      proficiency?: number;
    },
  ) {
    return this.adminService.updateSkill(id, body);
  }

  @Delete('skills/:id')
  deleteSkill(@Param('id') id: string) {
    return this.adminService.deleteSkill(id);
  }

  // Articles
  @Get('articles')
  findAllArticles() {
    return this.adminService.findAllArticles();
  }

  @Post('articles')
  createArticle(
    @Body()
    body: {
      title: string;
      slug: string;
      content: string;
      excerpt?: string;
      coverUrl?: string;
      language?: string;
      tags?: string[];
      published?: boolean;
      publishedAt?: string;
    },
  ) {
    return this.adminService.createArticle({
      ...body,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
    });
  }

  @Put('articles/:id')
  updateArticle(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      slug?: string;
      content?: string;
      excerpt?: string;
      coverUrl?: string;
      language?: string;
      tags?: string[];
      published?: boolean;
      publishedAt?: string;
    },
  ) {
    const data: any = { ...body };
    if (body.publishedAt) data.publishedAt = new Date(body.publishedAt);
    return this.adminService.updateArticle(id, data);
  }

  @Delete('articles/:id')
  deleteArticle(@Param('id') id: string) {
    return this.adminService.deleteArticle(id);
  }

  // Videos
  @Get('videos')
  findAllVideos() {
    return this.adminService.findAllVideos();
  }

  @Post('videos')
  createVideo(@Body() body: { title: string; titleFa?: string; description?: string; descriptionFa?: string; platform: string; videoId: string; thumbnailUrl?: string; order?: number }) {
    return this.adminService.createVideo(body);
  }

  @Put('videos/:id')
  updateVideo(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      titleFa?: string;
      description?: string;
      descriptionFa?: string;
      platform?: string;
      videoId?: string;
      thumbnailUrl?: string;
      order?: number;
    },
  ) {
    return this.adminService.updateVideo(id, body);
  }

  @Delete('videos/:id')
  deleteVideo(@Param('id') id: string) {
    return this.adminService.deleteVideo(id);
  }

  // Media
  @Post('media')
  createMedia(@Body() body: { filename: string; originalName: string; mimeType: string; sizeBytes: number; url: string; alt?: string }) {
    return this.adminService.createMedia(body);
  }

  @Put('media/:id')
  updateMedia(
    @Param('id') id: string,
    @Body()
    body: {
      filename?: string;
      originalName?: string;
      mimeType?: string;
      sizeBytes?: number;
      url?: string;
      alt?: string;
    },
  ) {
    return this.adminService.updateMedia(id, body);
  }

  @Delete('media/:id')
  deleteMedia(@Param('id') id: string) {
    return this.adminService.deleteMedia(id);
  }

  // ContactMessages
  @Get('contact-messages')
  findAllContactMessages() {
    return this.adminService.findAllContactMessages();
  }

  @Put('contact-messages/:id')
  updateContactMessage(@Param('id') id: string, @Body() body: { isRead?: boolean }) {
    return this.adminService.updateContactMessage(id, body);
  }

  @Delete('contact-messages/:id')
  deleteContactMessage(@Param('id') id: string) {
    return this.adminService.deleteContactMessage(id);
  }

  // Testimonials
  @Get('testimonials')
  findAllTestimonials() {
    return this.adminService.findAllTestimonials();
  }

  @Post('testimonials')
  createTestimonial(
    @Body()
    body: {
      authorName: string;
      authorNameFa?: string;
      companyRole?: string;
      companyRoleFa?: string;
      content: string;
      contentFa?: string;
      rating?: number;
      status?: string;
    },
  ) {
    return this.adminService.createTestimonial({
      ...body,
      status: body.status as any,
    });
  }

  @Put('testimonials/:id')
  updateTestimonial(
    @Param('id') id: string,
    @Body()
    body: {
      authorName?: string;
      authorNameFa?: string;
      companyRole?: string;
      companyRoleFa?: string;
      content?: string;
      contentFa?: string;
      rating?: number;
      status?: string;
    },
  ) {
    return this.adminService.updateTestimonial(id, {
      ...body,
      status: body.status as any,
    });
  }

  @Patch('testimonials/:id/status')
  updateTestimonialStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.adminService.updateTestimonialStatus(id, body.status as any);
  }

  @Delete('testimonials/:id')
  deleteTestimonial(@Param('id') id: string) {
    return this.adminService.deleteTestimonial(id);
  }
}
