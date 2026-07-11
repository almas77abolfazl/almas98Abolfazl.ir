import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService, Video } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { SeoService } from '../../shared/services/seo.service';

interface VideoView extends Video {
  thumb: string;
  safeUrl: SafeResourceUrl;
}

@Component({
  selector: 'app-videos',
  imports: [CommonModule],
  templateUrl: './videos.component.html',
})
export class VideosComponent implements OnInit {
  videos = signal<VideoView[]>([]);
  loading = signal(true);
  private playingIds = signal<Set<string>>(new Set());

  constructor(
    public i18n: I18nService,
    private api: ApiService,
    private sanitizer: DomSanitizer,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.update({
      title: this.i18n.t('videosTitle'),
      description: this.i18n.t('seoVideosDesc'),
      path: '/videos',
    });

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
      '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="100%" height="100%" fill="#1a1a26"/></svg>'
    );
  }
}
