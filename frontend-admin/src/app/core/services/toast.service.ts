import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private seq = 0;

  success(message: string, ttl = 3500): void {
    this.push('success', message, ttl);
  }

  error(message: string, ttl = 4500): void {
    this.push('error', message, ttl);
  }

  info(message: string, ttl = 3500): void {
    this.push('info', message, ttl);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(type: ToastType, message: string, ttl: number): void {
    const id = ++this.seq;
    this.toasts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), ttl);
  }
}
