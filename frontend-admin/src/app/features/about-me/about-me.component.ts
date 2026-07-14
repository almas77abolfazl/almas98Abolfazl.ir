import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';
import { ToastService } from '../../core/services/toast.service';
import { ImageUploadComponent } from '../../core/components/image-upload.component';
import { FileUploadComponent } from '../../core/components/file-upload.component';

interface AboutMe {
  id?: string;
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
}

@Component({
  selector: 'app-about-me',
  imports: [CommonModule, FormsModule, ImageUploadComponent, FileUploadComponent],
  templateUrl: './about-me.component.html',
  styles: [`
    .font-fa { font-family: 'Vazirmatn', system-ui, sans-serif; }
  `],
})
export class AboutMeComponent implements OnInit {
  model: AboutMe = { fullName: '', title: '' };

  dirty = signal(false);

  markDirty(): void {
    this.dirty.set(true);
  }

  canDeactivate(): boolean {
    return !this.dirty();
  }

  constructor(private http: HttpClient, public i18n: AdminI18nService, private toast: ToastService) {}

  ngOnInit(): void {
    this.http.get<AboutMe>('/api/admin/about-me').subscribe({
      next: (data) => { if (data) this.model = data; },
    });
  }

  onSubmit(): void {
    this.http.post('/api/admin/about-me', this.model).subscribe({
      next: () => {
        this.toast.success(this.i18n.t('toast_saved'));
        this.dirty.set(false);
      },
    });
  }
}
