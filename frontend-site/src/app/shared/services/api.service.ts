import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AboutMe {
  id: string;
  fullName: string; fullNameFa?: string;
  title: string; titleFa?: string;
  bio?: string; bioFa?: string;
  avatarUrl?: string;
  resumeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  role: string; roleFa?: string;
  company: string; companyFa?: string;
  startDate: string;
  endDate?: string;
  description?: string; descriptionFa?: string;
  technologies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  degree: string; degreeFa?: string;
  institution: string; institutionFa?: string;
  field?: string; fieldFa?: string;
  startDate: string;
  endDate?: string;
  description?: string; descriptionFa?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string; nameFa?: string;
  category: string;
  categoryFa?: string;
  categoryId?: string;
  categoryTitle?: string;
  categoryTitleFa?: string;
  proficiency: number;
  createdAt: string;
  updatedAt: string;
}

export interface SkillCategory {
  id: string;
  title: string; titleFa?: string;
  order: number;
  skills: Skill[];
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverUrl?: string;
  language: string;
  tags: string[];
  readingTime: number;
  likeCount: number;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleLikeResult {
  likeCount: number;
  alreadyLiked: boolean;
}

export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  alt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string; titleFa?: string;
  description?: string; descriptionFa?: string;
  platform: string;
  videoId: string;
  thumbnailUrl?: string;
  embedUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string; titleFa?: string;
  description?: string; descriptionFa?: string;
  techStack: string[] | null;
  liveUrl?: string;
  repoUrl?: string;
  coverUrl?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  id: string;
  skillsCardView: boolean;
  themeMode?: string;
  themePrimary?: string | null;
  themeSecondary?: string | null;
  showAbout?: boolean;
  showExperiences?: boolean;
  showEducations?: boolean;
  showSkills?: boolean;
  showProjects?: boolean;
  showArticles?: boolean;
  showVideos?: boolean;
  showTestimonials?: boolean;
  showContact?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorNameFa?: string;
  companyRole?: string;
  companyRoleFa?: string;
  email?: string;
  content: string;
  contentFa?: string;
  authorImageUrl?: string;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  getAboutMe(): Observable<AboutMe> {
    return this.http.get<AboutMe>(`${this.baseUrl}/about-me`);
  }

  getExperiences(): Observable<Experience[]> {
    return this.http.get<Experience[]>(`${this.baseUrl}/experiences`);
  }

  getEducations(): Observable<Education[]> {
    return this.http.get<Education[]>(`${this.baseUrl}/educations`);
  }

  getSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.baseUrl}/skills`);
  }

  getSkillCategories(): Observable<SkillCategory[]> {
    return this.http.get<SkillCategory[]>(`${this.baseUrl}/skill-categories`);
  }

  getArticles(lang?: string): Observable<Article[]> {
    const url = lang ? `${this.baseUrl}/articles?lang=${lang}` : `${this.baseUrl}/articles`;
    return this.http.get<Article[]>(url);
  }

  getArticleBySlug(slug: string): Observable<Article> {
    return this.http.get<Article>(`${this.baseUrl}/articles/${slug}`);
  }

  likeArticle(slug: string): Observable<ArticleLikeResult> {
    return this.http.post<ArticleLikeResult>(`${this.baseUrl}/articles/${slug}/like`, {});
  }

  postContactMessage(body: { name: string; email: string; subject?: string; message: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/contact-messages`, body);
  }

  getMedia(): Observable<Media[]> {
    return this.http.get<Media[]>(`${this.baseUrl}/media`);
  }

  getVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.baseUrl}/videos`);
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects`);
  }

  getSettings(): Observable<SiteSettings> {
    return this.http.get<SiteSettings>(`${this.baseUrl}/settings`);
  }

  getTestimonials(): Observable<Testimonial[]> {
    return this.http.get<Testimonial[]>(`${this.baseUrl}/testimonials`);
  }

  postTestimonial(body: {
    authorName: string;
    authorNameFa?: string;
    companyRole?: string;
    companyRoleFa?: string;
    content: string;
    contentFa?: string;
    authorImageUrl?: string;
    rating?: number;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/testimonials`, body);
  }

  uploadTestimonialImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.baseUrl}/testimonials/upload`, formData);
  }
}
