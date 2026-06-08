import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'default', standalone: true })
export class DefaultPipe implements PipeTransform {
  transform<T>(value: T | null | undefined, fallback: T): T {
    return value ?? fallback;
  }
}
