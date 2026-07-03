import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para formatear monedas de forma consistente.
 * Evita duplicación de lógica de formateo en componentes.
 * 
 * Uso: {{ amount | currencyFormat:currencySymbol:fractionDigits }}
 * Ej:  {{ 1250.5 | currencyFormat:'Q':2 }} → "Q 1,250.50"
 */
@Pipe({
    name: 'currencyFormat',
    standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
    transform(
        value: number | string | null | undefined,
        symbol: string = 'Q',
        fractionDigits: number = 2
    ): string {
        if (value === null || value === undefined || value === '') {
            return `${symbol} 0.00`;
        }

        const numValue = typeof value === 'string' ? parseFloat(value) : value;

        if (isNaN(numValue)) {
            return `${symbol} 0.00`;
        }

        const formatted = numValue.toLocaleString('es-GT', {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits
        });

        return `${symbol} ${formatted}`;
    }
}
