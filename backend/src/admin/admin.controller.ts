import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // AboutMe
  @Post('about-me')
  upsertAboutMe(@Body() body: { fullName: string; title: string; bio?: string; avatarUrl?: string; resumeUrl?: string }) {
    return this.adminService.upsertAboutMe(body);
  }

  @Delete('about-me/:id')
  deleteAboutMe(@Param('id') id: string) {
    return this.adminService.deleteAboutMe(id);
  }

  // Experiences
  @Post('experiences')
  createExperience(@Body() body: { role: string; company: string; startDate: string; endDate?: string; description?: string; technologies: string[] }) {
    return this.adminService.createExperience({ ...body, startDate: new Date(body.startDate), endDate: body.endDate ? new Date(body.endDate) : undefined });
  }

  @Put('experiences/:id')
  updateExperience(@Param('id') id: string, @Body() body: { role?: string; company?: string; startDate?: string; endDate?: string; description?: string; technologies?: string[] }) {
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
  @Post('educations')
  createEducation(@Body() body: { degree: string; institution: string; field?: string; startDate: string; endDate?: string; description?: string }) {
    return this.adminService.createEducation({ ...body, startDate: new Date(body.startDate), endDate: body.endDate ? new Date(body.endDate) : undefined });
  }

  @Put('educations/:id')
  updateEducation(@Param('id') id: string, @Body() body: { degree?: string; institution?: string; field?: string; startDate?: string; endDate?: string; description?: string }) {
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
  @Post('skills')
  createSkill(@Body() body: { name: string; category: string; proficiency?: number }) {
    return this.adminService.createSkill(body);
  }

  @Put('skills/:id')
  updateSkill(@Param('id') id: string, @Body() body: { name?: string; category?: string; proficiency?: number }) {
    return this.adminService.updateSkill(id, body);
  }

  @Delete('skills/:id')
  deleteSkill(@Param('id') id: string) {
    return this.adminService.deleteSkill(id);
  }

  // Articles
  @Post('articles')
  createArticle(@Body() body: { title: string; slug: string; content: string; excerpt?: string; coverUrl?: string; published?: boolean; publishedAt?: string }) {
    return this.adminService.createArticle({ ...body, publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined });
  }

  @Put('articles/:id')
  updateArticle(@Param('id') id: string, @Body() body: { title?: string; slug?: string; content?: string; excerpt?: string; coverUrl?: string; published?: boolean; publishedAt?: string }) {
    const data: any = { ...body };
    if (body.publishedAt) data.publishedAt = new Date(body.publishedAt);
    return this.adminService.updateArticle(id, data);
  }

  @Delete('articles/:id')
  deleteArticle(@Param('id') id: string) {
    return this.adminService.deleteArticle(id);
  }

  // Media
  @Post('media')
  createMedia(@Body() body: { filename: string; originalName: string; mimeType: string; sizeBytes: number; url: string; alt?: string }) {
    return this.adminService.createMedia(body);
  }

  @Put('media/:id')
  updateMedia(@Param('id') id: string, @Body() body: { filename?: string; originalName?: string; mimeType?: string; sizeBytes?: number; url?: string; alt?: string }) {
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
  createTestimonial(@Body() body: { authorName: string; companyRole?: string; content: string; rating?: number; status?: string }) {
    return this.adminService.createTestimonial({ ...body, status: body.status as any });
  }

  @Put('testimonials/:id')
  updateTestimonial(@Param('id') id: string, @Body() body: { authorName?: string; companyRole?: string; content?: string; rating?: number; status?: string }) {
    return this.adminService.updateTestimonial(id, { ...body, status: body.status as any });
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
