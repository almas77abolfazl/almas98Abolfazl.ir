import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.sig`;
}

describe('AuthService (frontend-admin)', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.clear();
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        AuthService,
        { provide: Router, useValue: routerSpy },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns true for a valid non-expired token', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    service.setToken(makeJwt({ sub: 'admin', exp: futureExp }));
    expect(service.isLoggedIn()).toBe(true);
    expect(localStorage.getItem('isAdmin')).toBe('true');
  });

  it('returns false for an expired or malformed token', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 60;
    service.setToken(makeJwt({ sub: 'admin', exp: pastExp }));
    expect(service.isLoggedIn()).toBe(false);

    service.setToken('not.a.valid.jwt');
    expect(service.isLoggedIn()).toBe(false);
  });

  it('clears token and navigates to /login on logout', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    service.setToken(makeJwt({ sub: 'admin', exp: futureExp }));
    service.logout();

    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem('isAdmin')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
