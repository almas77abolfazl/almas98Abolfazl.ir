import { Component, ViewChild, ElementRef, computed, signal, inject, Input, ChangeDetectionStrategy, forwardRef } from '@angular/core';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { AdminI18nService } from '../../core/services/admin-i18n.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-markdown-editor',
  imports: [FormsModule],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MarkdownEditorComponent), multi: true },
  ],
  templateUrl: './markdown-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownEditorComponent implements ControlValueAccessor {
  @ViewChild('ta') taRef?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @Input() dir: 'ltr' | 'rtl' = 'ltr';
  @Input() isFa = false;

  private sanitizer = inject(DomSanitizer);
  private http = inject(HttpClient);
  private i18n = inject(AdminI18nService);
  private toast = inject(ToastService);

  value = signal('');
  uploading = signal(false);
  disabled = false;

  preview = computed<SafeHtml>(() => {
    const html = marked.parse(this.value() || '', { async: false }) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string): void {
    this.value.set(val ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(val: string): void {
    this.value.set(val);
    this.onChange(val);
    this.onTouched();
  }

  private surround(before: string, after = before, placeholder = ''): void {
    const ta = this.taRef?.nativeElement;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = this.value().slice(start, end) || placeholder;
    const next = this.value().slice(0, start) + before + selected + after + this.value().slice(end);
    this.apply(next, start + before.length, start + before.length + selected.length);
  }

  private prefixLines(prefix: string): void {
    const ta = this.taRef?.nativeElement;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const val = this.value();
    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    const before = val.slice(0, lineStart);
    const block = val.slice(lineStart, end);
    const after = val.slice(end);
    const prefixed = block.split('\n').map((l) => prefix + l).join('\n');
    const next = before + prefixed + after;
    this.apply(next, start, end);
  }

  private apply(next: string, selStart: number, selEnd: number): void {
    this.value.set(next);
    this.onChange(next);
    const ta = this.taRef?.nativeElement;
    if (ta) {
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(selStart, selEnd);
      });
    }
  }

  bold(): void { this.surround('**', '**', 'متن پررنگ'); }
  italic(): void { this.surround('*', '*', 'متن کج'); }
  h2(): void { this.prefixLines('## '); }
  h3(): void { this.prefixLines('### '); }
  code(): void { this.surround('`', '`', 'code'); }
  codeblock(): void { this.surround('\n```\n', '\n```\n', 'code'); }
  link(): void { this.surround('[', '](https://)', 'متن لینک'); }
  ul(): void { this.prefixLines('- '); }
  ol(): void { this.prefixLines('1. '); }
  quote(): void { this.prefixLines('> '); }

  openImagePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  onImageFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    this.uploading.set(true);
    this.http.post<{ url: string }>('/api/admin/media/upload', form).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.insertImage(res.url, file.name.replace(/\.[^.]+$/, ''));
        this.toast.success(this.i18n.t('toast_uploaded'));
      },
      error: () => {
        this.uploading.set(false);
        this.toast.error(this.i18n.t('upload_failed'));
      },
    });
  }

  private insertImage(url: string, alt: string): void {
    const snippet = `![${alt || 'image'}](${url})`;
    const ta = this.taRef?.nativeElement;
    if (!ta) {
      const next = this.value() + ' ' + snippet + ' ';
      this.apply(next, next.length, next.length);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const val = this.value();
    const before = val.slice(0, start);
    const after = val.slice(end);
    const padBefore = start > 0 && !/\s/.test(val[start - 1]) ? ' ' : '';
    const padAfter = end < val.length && !/\s/.test(val[end]) ? ' ' : '';
    const text = `${padBefore}${snippet}${padAfter}`;
    const next = before + text + after;
    this.apply(next, before.length + text.length, before.length + text.length);
  }
}
