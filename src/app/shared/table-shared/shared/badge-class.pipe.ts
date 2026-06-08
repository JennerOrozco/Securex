import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'badgeClass', standalone: true })
export class BadgeClassPipe implements PipeTransform {
  transform(value: any, prefix: string = 'type-'): string {
    if (value == null) return prefix + 'default';
    return prefix + value.toString().toLowerCase();
  }
}
