import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

export interface AboutMe {
  id: string;
  fullName: string; fullNameFa?: string;
  title: string; titleFa?: string;
  bio?: string; bioFa?: string;
  avatarUrl?: string;
  resumeUrl?: string;
  resumeName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
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
  siteName?: string | null;
  siteUrl?: string | null;
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
  private aboutMe$?: Observable<AboutMe>;
  private settings$?: Observable<SiteSettings>;
  private experiences$?: Observable<Experience[]>;
  private skills$?: Observable<Skill[]>;
  private testimonials$?: Observable<Testimonial[]>;

  constructor(private http: HttpClient) {}

  getAboutMe(): Observable<AboutMe> {
    if (!this.aboutMe$) {
      this.aboutMe$ = this.http.get<AboutMe>(`${this.baseUrl}/about-me`).pipe(shareReplay(1));
    }
    return this.aboutMe$;
  }

  getExperiences(): Observable<Experience[]> {
    if (!this.experiences$) {
      this.experiences$ = this.http.get<Experience[]>(`${this.baseUrl}/experiences`).pipe(shareReplay(1));
    }
    return this.experiences$;
  }

  getEducations(): Observable<Education[]> {
    return this.http.get<Education[]>(`${this.baseUrl}/educations`);
  }

  getSkills(): Observable<Skill[]> {
    if (!this.skills$) {
      this.skills$ = this.http.get<Skill[]>(`${this.baseUrl}/skills`).pipe(shareReplay(1));
    }
    return this.skills$;
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

  unlikeArticle(slug: string): Observable<{ likeCount: number }> {
    return this.http.delete<{ likeCount: number }>(`${this.baseUrl}/articles/${slug}/like`);
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

  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/projects/${id}`);
  }

  getSettings(): Observable<SiteSettings> {
    if (!this.settings$) {
      this.settings$ = this.http.get<SiteSettings>(`${this.baseUrl}/settings`).pipe(shareReplay(1));
    }
    return this.settings$;
  }

  getTestimonials(): Observable<Testimonial[]> {
    if (!this.testimonials$) {
      this.testimonials$ = this.http.get<Testimonial[]>(`${this.baseUrl}/testimonials`).pipe(shareReplay(1));
    }
    return this.testimonials$;
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
