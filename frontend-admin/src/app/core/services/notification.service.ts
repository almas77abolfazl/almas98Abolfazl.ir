import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  showError(message: string): void {
    this.errorSubject.next(message);
  }

  clear(): void {
    this.errorSubject.next(null);
  }
}
