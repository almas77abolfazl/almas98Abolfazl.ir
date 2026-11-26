import { Injectable } from '@nestjs/common';

@Injectable()
export class RateLimitService {
  // In-memory sliding-window limiter (single NestJS instance).
  // Prevents a single client from flooding public submission endpoints.
  private readonly hits = new Map<string, number[]>();
  private readonly windowMs = 10 * 60 * 1000; // 10 minutes
  private readonly max = 5; // max submissions per key per window

  isAllowed(key: string, max = this.max, windowMs = this.windowMs): boolean {
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }

  /** Returns true when the key has already reached `max` hits within `windowMs` without recording a new hit. */
  isBlocked(key: string, max = this.max, windowMs = this.windowMs): boolean {
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < windowMs);
    this.hits.set(key, recent);
    return recent.length >= max;
  }

  /** Records a hit for `key` within `windowMs`. */
  recordHit(key: string, windowMs = this.windowMs): void {
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    this.hits.set(key, recent);
  }

  /** Clears recorded hits for `key` (e.g. after a successful login). */
  reset(key: string): void {
    this.hits.delete(key);
  }
}
