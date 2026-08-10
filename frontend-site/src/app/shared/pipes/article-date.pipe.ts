import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats an article date respecting the article's *content* language
 * (not the UI toggle): Persian articles use `fa-IR`, others use `en-US`.
 */
@Pipe({ name: 'articleDate', standalone: true })
export class ArticleDatePipe implements PipeTransform {
  transform(value: string | Date | undefined | null, lang?: string, options?: Intl.DateTimeFormatOptions): string {
    if (value === undefined || value === null || value === '') return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const locale = lang === 'fa' ? 'fa-IR' : 'en-US';
    return d.toLocaleDateString(locale, options ?? { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
