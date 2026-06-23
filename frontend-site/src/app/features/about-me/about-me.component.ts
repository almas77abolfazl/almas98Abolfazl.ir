import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { AboutMe } from '../../shared/services/api.service';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.scss'
})
export class AboutMeComponent implements OnInit {
  aboutMe?: AboutMe;
  isLoading = true;

  constructor(
    public i18n: I18nService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.api.getAboutMe().subscribe({
      next: data => this.aboutMe = data,
      complete: () => this.isLoading = false
    });
  }
}
