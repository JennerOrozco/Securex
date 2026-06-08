import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusClass', standalone: true })
export class StatusClassPipe implements PipeTransform {
  transform(value: any): string {
    return value?.toString()?.toLowerCase() ?? '';
  }
}
