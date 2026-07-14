import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AnalyticsService } from './shared/services/analytics.service';
import { ThemeColorService } from './shared/services/theme-color.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = 'frontend-site';

  constructor(
    private router: Router,
    private analytics: AnalyticsService,
    private themeColor: ThemeColorService,
  ) {
    this.themeColor.loadAndApply();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      this.analytics.track(e.urlAfterRedirects || e.url);
    });
  }
}
