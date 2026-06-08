import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, maxLen = 80, ellipsis = '...'): string {
    if (!value) return '';
    if (value.length <= maxLen) return value;
    return value.slice(0, maxLen).trimEnd() + ellipsis;
  }
}
