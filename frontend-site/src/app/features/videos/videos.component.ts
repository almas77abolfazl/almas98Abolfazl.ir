import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService, Video } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';

interface VideoView extends Video {
  thumb: string;
  safeUrl: SafeResourceUrl;
}

@Component({
  selector: 'app-videos',
  imports: [CommonModule],
  template: `
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

      <div class="mb-12">
        <p class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">
          {{ i18n.t('videosSubtitle') }}
        </p>
        <h1 class="text-4xl font-bold text-slate-900 dark:text-white">{{ i18n.t('videosTitle') }}</h1>
        <div class="mt-4 w-16 h-1 rounded-full bg-linear-to-r from-indigo-500 to-emerald-500"></div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (videos().length === 0) {
        <div class="text-center py-20 text-slate-400 dark:text-slate-500">
          {{ i18n.t('noVideos') }}
        </div>
      } @else {
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (video of videos(); track video.id) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 card-hover">
              <div class="relative w-full aspect-video bg-slate-100 dark:bg-slate-900">
                @if (isPlaying(video.id)) {
                  <iframe class="absolute inset-0 w-full h-full" [src]="video.safeUrl"
                    [title]="i18n.isFa ? (video.titleFa || video.title) : video.title"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen></iframe>
                } @else {
                  <button type="button" (click)="play(video.id)"
                    class="group absolute inset-0 w-full h-full flex items-center justify-center"
                    [attr.aria-label]="i18n.t('playVideo')">
                    <img [src]="video.thumb" [alt]="i18n.isFa ? (video.titleFa || video.title) : video.title"
                      class="absolute inset-0 w-full h-full object-cover" />
                    <span class="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors"></span>
                    <span class="relative w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <svg class="w-6 h-6 text-indigo-600 ltr:ml-1 rtl:mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </button>
                }
              </div>
              <div class="p-5">
                <h2 class="text-base font-bold text-slate-900 dark:text-white mb-1">
                  {{ i18n.isFa ? (video.titleFa || video.title) : video.title }}
                </h2>
                @if (video.description || video.descriptionFa) {
                  <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {{ i18n.isFa ? (video.descriptionFa || video.description) : video.description }}
                  </p>
                }
              </div>
            </div>
          }
        </div>
      }

    </section>
  `,
})
export class VideosComponent implements OnInit {
  videos = signal<VideoView[]>([]);
  loading = signal(true);
  private playingIds = signal<Set<string>>(new Set());

  constructor(
    public i18n: I18nService,
    private api: ApiService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.api.getVideos().subscribe({
      next: (data) => {
        this.videos.set(data.map((video) => this.toView(video)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  isPlaying(id: string): boolean {
    return this.playingIds().has(id);
  }

  play(id: string): void {
    const next = new Set(this.playingIds());
    next.add(id);
    this.playingIds.set(next);
  }

  private toView(video: Video): VideoView {
    // Only YouTube supports the autoplay query param reliably.
    const url = video.platform === 'youtube' ? `${video.embedUrl}?autoplay=1` : video.embedUrl;
    return {
      ...video,
      thumb: this.thumb(video),
      safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url),
    };
  }

  private thumb(video: Video): string {
    if (video.thumbnailUrl) {
      return video.thumbnailUrl;
    }
    if (video.platform === 'youtube' && video.videoId) {
      return `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
    }
    // Neutral placeholder for platforms without a derivable thumbnail (e.g. Aparat).
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="100%" height="100%" fill="#1e293b"/></svg>'
    );
  }
}
