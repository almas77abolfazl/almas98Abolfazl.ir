import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService, UploadedFile } from '../uploads/uploads.service';
import { SiteSettingsService } from '../site-settings/site-settings.service';
import { TestimonialStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploads: UploadsService,
    private readonly siteSettings: SiteSettingsService,
  ) {}

  // AboutMe (singleton)
  async upsertAboutMe(data: { fullName: string; fullNameFa?: string; title: string; titleFa?: string; bio?: string; bioFa?: string; avatarUrl?: string; resumeUrl?: string }) {
    const existing = await this.prisma.aboutMe.findFirst();
    if (existing) {
      return this.prisma.aboutMe.update({ where: { id: existing.id }, data });
    }
    return this.prisma.aboutMe.create({ data });
  }

  async findAboutMe() {
    return this.prisma.aboutMe.findFirst();
  }

  async deleteAboutMe(id: string) {
    return this.prisma.aboutMe.delete({ where: { id } });
  }

  // Experiences
  async createExperience(data: { role: string; roleFa?: string; company: string; companyFa?: string; startDate: Date; endDate?: Date; description?: string; descriptionFa?: string; technologies: string[] }) {
    return this.prisma.experiences.create({ data });
  }

  async findAllExperiences() {
    return this.prisma.experiences.findMany({ orderBy: { order: 'asc' } });
  }

  async updateExperience(
    id: string,
    data: {
      role?: string;
      roleFa?: string;
      company?: string;
      companyFa?: string;
      startDate?: Date;
      endDate?: Date;
      description?: string;
      descriptionFa?: string;
      technologies?: string[];
    },
  ) {
    return this.prisma.experiences.update({ where: { id }, data });
  }

  async deleteExperience(id: string) {
    return this.prisma.experiences.delete({ where: { id } });
  }

  // Educations
  async createEducation(data: { degree: string; degreeFa?: string; institution: string; institutionFa?: string; field?: string; fieldFa?: string; startDate: Date; endDate?: Date; description?: string; descriptionFa?: string }) {
    return this.prisma.educations.create({ data });
  }

  async findAllEducations() {
    return this.prisma.educations.findMany({ orderBy: { order: 'asc' } });
  }

  async updateEducation(
    id: string,
    data: {
      degree?: string;
      degreeFa?: string;
      institution?: string;
      institutionFa?: string;
      field?: string;
      fieldFa?: string;
      startDate?: Date;
      endDate?: Date;
      description?: string;
      descriptionFa?: string;
    },
  ) {
    return this.prisma.educations.update({ where: { id }, data });
  }

  async deleteEducation(id: string) {
    return this.prisma.educations.delete({ where: { id } });
  }

  // Skills
  async createSkill(data: { name: string; nameFa?: string; category: string; categoryFa?: string; proficiency?: number }) {
    return this.prisma.skills.create({ data });
  }

  async findAllSkills() {
    return this.prisma.skills.findMany({ orderBy: { order: 'asc' } });
  }

  async updateSkill(
    id: string,
    data: {
      name?: string;
      nameFa?: string;
      category?: string;
      categoryFa?: string;
      proficiency?: number;
    },
  ) {
    return this.prisma.skills.update({ where: { id }, data });
  }

  async deleteSkill(id: string) {
    return this.prisma.skills.delete({ where: { id } });
  }

  // Articles
  private calcReadingTime(content: string): number {
    const words = content?.trim() ? content.trim().split(/\s+/).length : 0;
    return words > 0 ? Math.ceil(words / 200) : 0;
  }

  async createArticle(data: { title: string; slug: string; content: string; excerpt?: string; coverUrl?: string; language?: string; tags?: string[]; published?: boolean; publishedAt?: Date }) {
    return this.prisma.articles.create({
      data: { ...data, readingTime: this.calcReadingTime(data.content) },
    });
  }

  async findAllArticles() {
    return this.prisma.articles.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async updateArticle(
    id: string,
    data: {
      title?: string;
      slug?: string;
      content?: string;
      excerpt?: string;
      coverUrl?: string;
      language?: string;
      tags?: string[];
      published?: boolean;
      publishedAt?: Date;
    },
  ) {
    const patch: typeof data & { readingTime?: number } = { ...data };
    if (data.content !== undefined) {
      patch.readingTime = this.calcReadingTime(data.content);
    }
    return this.prisma.articles.update({ where: { id }, data: patch });
  }

  async deleteArticle(id: string) {
    return this.prisma.articles.delete({ where: { id } });
  }

  // Videos
  async findAllVideos() {
    return this.prisma.videos.findMany({ orderBy: { order: 'asc' } });
  }

  async createVideo(data: { title: string; titleFa?: string; description?: string; descriptionFa?: string; platform: string; videoId: string; thumbnailUrl?: string; order?: number }) {
    return this.prisma.videos.create({ data });
  }

  async updateVideo(
    id: string,
    data: {
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
    return this.prisma.videos.update({ where: { id }, data });
  }

  async deleteVideo(id: string) {
    return this.prisma.videos.delete({ where: { id } });
  }

  // Media
  async createMedia(data: { filename: string; originalName: string; mimeType: string; sizeBytes: number; url: string; alt?: string }) {
    return this.prisma.media.create({ data });
  }

  async uploadMedia(file: UploadedFile) {
    const saved = this.uploads.save(file);
    return this.prisma.media.create({ data: saved });
  }

  async updateMedia(
    id: string,
    data: {
      filename?: string;
      originalName?: string;
      mimeType?: string;
      sizeBytes?: number;
      url?: string;
      alt?: string;
    },
  ) {
    return this.prisma.media.update({ where: { id }, data });
  }

  async deleteMedia(id: string) {
    return this.prisma.media.delete({ where: { id } });
  }

  // ContactMessages
  async findAllContactMessages() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateContactMessage(id: string, data: { isRead?: boolean }) {
    return this.prisma.contactMessage.update({ where: { id }, data });
  }

  async deleteContactMessage(id: string) {
    return this.prisma.contactMessage.delete({ where: { id } });
  }

  // Testimonials
  async findAllTestimonials() {
    return this.prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createTestimonial(data: { authorName: string; authorNameFa?: string; companyRole?: string; companyRoleFa?: string; email?: string; content: string; contentFa?: string; authorImageUrl?: string; status?: TestimonialStatus }) {
    return this.prisma.testimonial.create({ data });
  }

  async updateTestimonial(
    id: string,
    data: {
      authorName?: string;
      authorNameFa?: string;
      companyRole?: string;
      companyRoleFa?: string;
      email?: string;
      content?: string;
      contentFa?: string;
      authorImageUrl?: string;
      status?: TestimonialStatus;
    },
  ) {
    return this.prisma.testimonial.update({ where: { id }, data });
  }

  async updateTestimonialStatus(id: string, status: TestimonialStatus) {
    return this.prisma.testimonial.update({ where: { id }, data: { status } });
  }

  async deleteTestimonial(id: string) {
    return this.prisma.testimonial.delete({ where: { id } });
  }

  // Site settings
  async getSettings() {
    return this.siteSettings.getSettings();
  }

  async updateSettings(data: { skillsCardView?: boolean }) {
    return this.siteSettings.updateSettings(data);
  }

  // Drag-and-drop reordering
  async reorderExperiences(items: { id: string; order: number }[]) {
    return this.bulkReorder('experiences', items);
  }

  async reorderEducations(items: { id: string; order: number }[]) {
    return this.bulkReorder('educations', items);
  }

  async reorderSkills(items: { id: string; order: number }[]) {
    return this.bulkReorder('skills', items);
  }

  private async bulkReorder(
    model: 'experiences' | 'educations' | 'skills',
    items: { id: string; order: number }[],
  ) {
    await this.prisma.$transaction(
      items.map((item) =>
        (this.prisma[model] as any).update({ where: { id: item.id }, data: { order: item.order } }),
      ),
    );
    return { updated: items.length };
  }
}
