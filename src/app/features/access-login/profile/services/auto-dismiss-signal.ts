import { signal, Signal } from '@angular/core';
import { timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export function autoDismissSignal(
  destroyRef: { onDestroy: (fn: () => void) => void },
  ms: number = 4000
): { success: Signal<boolean>; trigger: () => void } {
  const success = signal(false);

  const trigger = () => {
    success.set(true);
    timer(ms).pipe(takeUntilDestroyed(destroyRef as any)).subscribe(() => success.set(false));
  };

  return { success, trigger };
}
