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
  category: string; categoryFa?: string;
  proficiency?: number;
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
}
