import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  danger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  state = signal<ConfirmOptions | null>(null);
  private resolver?: (result: boolean) => void;

  confirm(options: ConfirmOptions): Promise<boolean> {
    this.state.set(options);
    return new Promise<boolean>((resolve) => (this.resolver = resolve));
  }

  accept(): void {
    this.state.set(null);
    this.resolver?.(true);
    this.resolver = undefined;
  }

  decline(): void {
    this.state.set(null);
    this.resolver?.(false);
    this.resolver = undefined;
  }
}
