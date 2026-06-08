import { Pipe, PipeTransform } from '@angular/core';

const BOOL_MAP: Record<string, [string, string]> = {
  active:     ['Activo', 'Inactivo'],
  activo:     ['Activo', 'Inactivo'],
  yesno:      ['Sí', 'No'],
  read:       ['Leída', 'Pendiente'],
  revoked:    ['Inactivo', 'Activo'],
  admin:      ['Admin', 'User'],
};

@Pipe({ name: 'booleanText', standalone: true })
export class BooleanTextPipe implements PipeTransform {
  transform(
    value: any,
    trueLabel?: string,
    falseLabel?: string,
    preset?: string
  ): string {
    const bool = !!value;

    if (trueLabel !== undefined && falseLabel !== undefined) {
      return bool ? trueLabel : falseLabel;
    }

    if (preset && BOOL_MAP[preset]) {
      const [t, f] = BOOL_MAP[preset];
      return bool ? t : f;
    }

    return bool ? 'Sí' : 'No';
  }
}
