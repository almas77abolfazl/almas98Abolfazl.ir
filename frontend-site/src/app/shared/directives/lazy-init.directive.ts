import { Directive, EventEmitter, ElementRef, OnInit, OnDestroy, Output, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appLazyInit]',
  standalone: true
})
export class LazyInitDirective implements OnInit, OnDestroy {
  @Output() appLazyInit = new EventEmitter<void>();
  private observer: IntersectionObserver | null = null;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private el: ElementRef) {}

  ngOnInit() {
    // The server has no IntersectionObserver. Emit once so prerendered Home HTML
    // includes content that is lazy-loaded while scrolling in the browser.
    if (!this.isBrowser) {
      this.appLazyInit.emit();
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.appLazyInit.emit();
          if (this.observer) {
            this.observer.disconnect();
          }
        }
      });
    }, { rootMargin: '200px' });
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
