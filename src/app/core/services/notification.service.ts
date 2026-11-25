import { Injectable, signal } from '@angular/core';

export type NotificationKind = 'success' | 'warning' | 'danger' | 'info';

export interface ToastMessage {
  id: number;
  kind: NotificationKind;
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly currentSignal = signal<ToastMessage | null>(null);
  readonly current = this.currentSignal.asReadonly();
  private nextId = 0;

  show(kind: NotificationKind, title: string, message: string): void {
    const toast: ToastMessage = { id: ++this.nextId, kind, title, message };
    this.currentSignal.set(toast);

    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        if (this.currentSignal()?.id === toast.id) {
          this.currentSignal.set(null);
        }
      }, 3_500);
    }
  }

  dismiss(): void {
    this.currentSignal.set(null);
  }
}
