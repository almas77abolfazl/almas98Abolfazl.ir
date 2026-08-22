import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { API_BASE_URL } from './shared/api-base-url.token';

function prerenderApiBaseUrl(): string {
  const value = process.env['PRERENDER_API_BASE_URL'];
  if (!value) {
    throw new Error(
      'PRERENDER_API_BASE_URL is required for prerendering. Set it to an absolute API root, for example http://localhost:3000/api.',
    );
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('PRERENDER_API_BASE_URL must be an absolute http(s) URL.');
  }

  if (!['http:', 'https:'].includes(url.protocol) || !url.pathname.replace(/\/+$/, '').endsWith('/api')) {
    throw new Error('PRERENDER_API_BASE_URL must be an absolute http(s) API root ending in /api.');
  }

  return url.toString().replace(/\/+$/, '');
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: API_BASE_URL, useFactory: prerenderApiBaseUrl }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
