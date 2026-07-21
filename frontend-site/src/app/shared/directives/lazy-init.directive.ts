import { Directive, EventEmitter, ElementRef, OnInit, OnDestroy, Output } from '@angular/core';

@Directive({
  selector: '[appLazyInit]',
  standalone: true
})
export class LazyInitDirective implements OnInit, OnDestroy {
  @Output() appLazyInit = new EventEmitter<void>();
  private observer: IntersectionObserver | null = null;

  constructor(private el: ElementRef) {}

  ngOnInit() {
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
