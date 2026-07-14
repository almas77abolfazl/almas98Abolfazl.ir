import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // An invalid/expired token (or any auth failure) should sign the admin out.
        // The login request handles its own 401, so it is excluded here.
        if (error.status === 401 && !request.url.includes('/api/auth/login')) {
          this.authService.logout();
          return EMPTY;
        }
        const message = error.error?.message || error.message || `Request failed with status ${error.status}`;
        this.notificationService.showError(message);
        return EMPTY;
      }),
    );
  }
}
