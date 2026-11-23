import { Injectable } from '@angular/core';
import { marked } from 'marked';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-json';

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {
  constructor() {
    marked.use({
      renderer: {
        code({ text, lang }: { text: string; lang?: string }) {
          const validLang = lang && (Prism.languages[lang] || lang === 'ts' || lang === 'typescript' || lang === 'js' || lang === 'html' || lang === 'json');
          const language = validLang ? (lang === 'ts' ? 'typescript' : lang === 'js' ? 'javascript' : lang) : 'typescript';
          const grammar = Prism.languages[language] || Prism.languages['javascript'];
          const highlighted = Prism.highlight(text, grammar, language);
          return `<pre><code class="language-${language}">${highlighted}</code></pre>`;
        }
      }
    });
  }

  /**
   * Renders Markdown to HTML.
   * Replaces custom :::ltr and :::rtl fences with directional divs.
   * Preserves intentional extra blank lines.
   */
  renderMarkdown(md: string): string {
    if (!md) return '';

    // Replace :::ltr \n ... \n ::: with <div class="dir-ltr">\n\n...</div>
    let processedMd = md.replace(/^:::ltr\s*\n([\s\S]*?)\n:::/gm, '<div class="dir-ltr">\n\n$1\n\n</div>');

    // Replace :::rtl \n ... \n ::: with <div class="dir-rtl">\n\n...</div>
    processedMd = processedMd.replace(/^:::rtl\s*\n([\s\S]*?)\n:::/gm, '<div class="dir-rtl">\n\n$1\n\n</div>');

    // Preserve intentional extra blank lines
    processedMd = this.preserveExtraSpacing(processedMd);

    const html = marked.parse(processedMd, { async: false }) as string;
    return this.wrapTables(html);
  }

  /** Keeps intentional extra blank lines from the Markdown editor visible in the rendered article. */
  private preserveExtraSpacing(markdown: string): string {
    return markdown.replace(/(?:\r?\n){3,}/g, (lineBreaks) => {
      const extraBlankLines = lineBreaks.split(/\r?\n/).length - 3;
      const spacers = '<div class="article-spacer" aria-hidden="true"></div>'.repeat(extraBlankLines);
      return `\n\n${spacers}\n\n`;
    });
  }

  /** Gives wide tables a scroll/clipping boundary without changing table semantics. */
  private wrapTables(html: string): string {
    return html.replace(/<table>([\s\S]*?)<\/table>/g, '<div class="article-table-wrap"><table>$1</table></div>');
  }
}
