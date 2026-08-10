import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShellComponent } from './features/layout/shell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ShellComponent],
  template: '<app-shell></app-shell>',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [],
})
export class App {}
