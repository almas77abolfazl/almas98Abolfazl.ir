import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-image-upload',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './image-upload.component.html',
})
export class ImageUploadComponent {
  @Input() url: string | undefined = '';
  @Input() label = '';
  @Input() dir: 'ltr' | 'rtl' = 'ltr';
  @Input() accept = 'image/*';
  @Input() shape: 'rect' | 'avatar' = 'rect';
  @Output() urlChange = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  dragging = signal(false);
  uploading = signal(false);

  private http = inject(HttpClient);
  i18n = inject(AdminI18nService);
  private toast = inject(ToastService);

  openPicker(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.upload(file);
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.upload(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
  }

  remove(): void {
    this.urlChange.emit('');
  }

  private upload(file: File): void {
    const formData = new FormData();
    formData.append('file', file);
    this.uploading.set(true);
    this.http.post<{ url: string }>('/api/admin/media/upload', formData).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.urlChange.emit(res.url);
        this.toast.success(this.i18n.t('toast_uploaded'));
      },
      error: () => {
        this.uploading.set(false);
        this.toast.error(this.i18n.t('upload_failed'));
      },
    });
  }
}
