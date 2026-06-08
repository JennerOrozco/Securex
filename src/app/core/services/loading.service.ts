import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private requestCount = signal(0);
  readonly isLoading = signal(false);

  private debounceTimer: any;

  start() {
    this.requestCount.update(c => c + 1);
    this.flush();
  }

  stop() {
    this.requestCount.update(c => Math.max(0, c - 1));
    this.flush();
  }

  private flush() {
    clearTimeout(this.debounceTimer);
    if (this.requestCount() > 0) {
      this.isLoading.set(true);
    } else {
      this.debounceTimer = setTimeout(() => this.isLoading.set(false), 200);
    }
  }
}
