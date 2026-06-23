import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { AboutMe, Experience, Skill } from '../../shared/services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  aboutMe?: AboutMe;
  experiences: Experience[] = [];
  skills: Skill[] = [];
  isLoading = true;

  constructor(
    public i18n: I18nService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.api.getAboutMe().subscribe(data => this.aboutMe = data);
    this.api.getExperiences().subscribe(data => this.experiences = data);
    this.api.getSkills().subscribe(data => this.skills = data);
  }

  get latestExperience(): Experience | undefined {
    return this.experiences[0];
  }

  get topSkills(): Skill[] {
    return this.skills.slice(0, 6);
  }
}
