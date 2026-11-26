import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Patch, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { AdminService } from './admin.service';
import type { UploadedFile as UploadedFileType } from '../uploads/uploads.service';
import {
  UpsertAboutMeDto,
  CreateExperienceDto,
  UpdateExperienceDto,
  CreateEducationDto,
  UpdateEducationDto,
  CreateSkillDto,
  UpdateSkillDto,
  CreateArticleDto,
  UpdateArticleDto,
  CreateVideoDto,
  UpdateVideoDto,
  CreateProjectDto,
  UpdateProjectDto,
  CreateMediaDto,
  UpdateMediaDto,
  UpdateContactMessageDto,
  AdminCreateTestimonialDto,
  AdminUpdateTestimonialDto,
  UpdateTestimonialStatusDto,
  UpdateSettingsDto,
  ReorderDto,
  CreateSkillCategoryDto,
  UpdateSkillCategoryDto,
} from './dto/admin.dto';

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
  upsertAboutMe(@Body() body: UpsertAboutMeDto) {
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
  createExperience(@Body() body: CreateExperienceDto) {
    return this.adminService.createExperience({
      ...body,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });
  }

  @Put('experiences/:id')
  updateExperience(@Param('id') id: string, @Body() body: UpdateExperienceDto) {
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
  createEducation(@Body() body: CreateEducationDto) {
    return this.adminService.createEducation({
      ...body,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });
  }

  @Put('educations/:id')
  updateEducation(@Param('id') id: string, @Body() body: UpdateEducationDto) {
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
  createSkill(@Body() body: CreateSkillDto) {
    return this.adminService.createSkill(body);
  }

  @Put('skills/:id')
  updateSkill(@Param('id') id: string, @Body() body: UpdateSkillDto) {
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
  createArticle(@Body() body: CreateArticleDto) {
    return this.adminService.createArticle({
      ...body,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
    });
  }

  @Put('articles/:id')
  updateArticle(@Param('id') id: string, @Body() body: UpdateArticleDto) {
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
  createVideo(@Body() body: CreateVideoDto) {
    return this.adminService.createVideo(body);
  }

  @Put('videos/:id')
  updateVideo(@Param('id') id: string, @Body() body: UpdateVideoDto) {
    return this.adminService.updateVideo(id, body);
  }

  @Delete('videos/:id')
  deleteVideo(@Param('id') id: string) {
    return this.adminService.deleteVideo(id);
  }

  // Projects
  @Get('projects')
  findAllProjects() {
    return this.adminService.findAllProjects();
  }

  @Post('projects')
  createProject(@Body() body: CreateProjectDto) {
    return this.adminService.createProject(body);
  }

  @Put('projects/:id')
  updateProject(@Param('id') id: string, @Body() body: UpdateProjectDto) {
    return this.adminService.updateProject(id, body);
  }

  @Delete('projects/:id')
  deleteProject(@Param('id') id: string) {
    return this.adminService.deleteProject(id);
  }

  // Media
  @Post('media')
  createMedia(@Body() body: CreateMediaDto) {
    return this.adminService.createMedia(body);
  }

  // Media upload (multipart, images or PDF/doc resume files)
  @Post('media/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowed = /\.(pdf|doc|docx)$/i;
        if (file.mimetype.startsWith('image/') || allowed.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image or PDF/DOC resume files are allowed'), false);
        }
      },
    }),
  )
  uploadMedia(@UploadedFile() file: UploadedFileType) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.adminService.uploadMedia(file).then((m) => ({ url: m.url, originalName: m.originalName }));
  }

  @Put('media/:id')
  updateMedia(@Param('id') id: string, @Body() body: UpdateMediaDto) {
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
  updateContactMessage(@Param('id') id: string, @Body() body: UpdateContactMessageDto) {
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
  createTestimonial(@Body() body: AdminCreateTestimonialDto) {
    return this.adminService.createTestimonial({
      ...body,
      status: body.status as any,
    });
  }

  @Put('testimonials/:id')
  updateTestimonial(@Param('id') id: string, @Body() body: AdminUpdateTestimonialDto) {
    return this.adminService.updateTestimonial(id, {
      ...body,
      status: body.status as any,
    });
  }

  @Patch('testimonials/:id/status')
  updateTestimonialStatus(@Param('id') id: string, @Body() body: UpdateTestimonialStatusDto) {
    return this.adminService.updateTestimonialStatus(id, body.status as any);
  }

  @Delete('testimonials/:id')
  deleteTestimonial(@Param('id') id: string) {
    return this.adminService.deleteTestimonial(id);
  }

  // Site settings
  @Get('settings')
  getSettings() {
    return this.adminService.getSettings();
  }

  @Put('settings')
  updateSettings(@Body() body: UpdateSettingsDto) {
    return this.adminService.updateSettings(body);
  }

  // Drag-and-drop reordering
  @Patch('experiences/reorder')
  reorderExperiences(@Body() body: ReorderDto) {
    return this.adminService.reorderExperiences(body.items);
  }

  @Patch('educations/reorder')
  reorderEducations(@Body() body: ReorderDto) {
    return this.adminService.reorderEducations(body.items);
  }

  @Patch('skills/reorder')
  reorderSkills(@Body() body: ReorderDto) {
    return this.adminService.reorderSkills(body.items);
  }

  @Patch('projects/reorder')
  reorderProjects(@Body() body: ReorderDto) {
    return this.adminService.reorderProjects(body.items);
  }

  // Skill categories
  @Get('skill-categories')
  findAllSkillCategories() {
    return this.adminService.findAllSkillCategories();
  }

  @Post('skill-categories')
  createSkillCategory(@Body() body: CreateSkillCategoryDto) {
    return this.adminService.createSkillCategory(body);
  }

  @Put('skill-categories/:id')
  updateSkillCategory(@Param('id') id: string, @Body() body: UpdateSkillCategoryDto) {
    return this.adminService.updateSkillCategory(id, body);
  }

  @Delete('skill-categories/:id')
  deleteSkillCategory(@Param('id') id: string) {
    return this.adminService.deleteSkillCategory(id);
  }

  @Patch('skill-categories/reorder')
  reorderSkillCategories(@Body() body: ReorderDto) {
    return this.adminService.reorderSkillCategories(body.items);
  }
}
