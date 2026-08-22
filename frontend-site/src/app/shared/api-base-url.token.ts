import { InjectionToken } from '@angular/core';

/** The browser uses the same-origin API proxy; prerender supplies an absolute API URL. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
