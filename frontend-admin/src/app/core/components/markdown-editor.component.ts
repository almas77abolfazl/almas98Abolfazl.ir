import { Component, ViewChild, ElementRef, computed, signal, inject, Input, ChangeDetectionStrategy, forwardRef } from '@angular/core';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

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
  @Input() dir: 'ltr' | 'rtl' = 'ltr';
  @Input() isFa = false;

  private sanitizer = inject(DomSanitizer);

  value = signal('');
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
}
