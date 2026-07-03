import { Injectable, isDevMode } from '@angular/core';

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: string;
  data?: unknown;
  stack?: string;
}

/**
 * Servicio centralizado de logging
 * Proporciona logging estructurado con contexto
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 500;

  /**
   * Log informativo
   */
  log(message: string, data?: unknown, context?: string): void {
    this.write('info', message, data, context);
  }

  /**
   * Log de advertencia
   */
  warn(message: string, data?: unknown, context?: string): void {
    this.write('warn', message, data, context);
  }

  /**
   * Log de error
   */
  error(message: string, error?: unknown, context?: string): void {
    const stack = error instanceof Error ? error.stack : undefined;
    this.write('error', message, error, context, stack);
  }

  /**
   * Log de debug (solo en desarrollo)
   */
  debug(message: string, data?: unknown, context?: string): void {
    if (!this.isDevelopment()) return;
    this.write('debug', message, data, context);
  }

  /**
   * Registra entrada de log
   */
  private write(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    data?: unknown,
    context?: string,
    stack?: string
  ): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: context || 'App',
      data,
      stack
    };

    this.logs.push(entry);

    // Mantener tamaño máximo
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    this.printToConsole(entry);
  }

  /**
   * Imprime en consola con estilos
   */
  private printToConsole(entry: LogEntry): void {
    const prefix = `[${entry.level.toUpperCase()}] ${entry.context}:`;
    const style = this.getConsoleStyle(entry.level);

    switch (entry.level) {
      case 'error':
        console.error(`%c${prefix} ${entry.message}`, style, entry.data);
        break;
      case 'warn':
        console.warn(`%c${prefix} ${entry.message}`, style, entry.data);
        break;
      case 'debug':
        console.debug(`%c${prefix} ${entry.message}`, style, entry.data);
        break;
      default:
        console.log(`%c${prefix} ${entry.message}`, style, entry.data);
    }
  }

  /**
   * Estilos para consola
   */
  private getConsoleStyle(level: string): string {
    const styles: { [key: string]: string } = {
      info: 'color: #0066cc; font-weight: bold;',
      warn: 'color: #ff9900; font-weight: bold;',
      error: 'color: #cc0000; font-weight: bold;',
      debug: 'color: #666666; font-weight: bold;'
    };
    return styles[level] || '';
  }

  /**
   * Obtiene logs filtrados
   */
  getLogs(level?: string): LogEntry[] {
    if (!level) return [...this.logs];
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Limpia logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Exporta logs como JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Descarga logs como archivo
   */
  downloadLogs(): void {
    const json = this.exportLogs();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Verifica si está en desarrollo
   */
  private isDevelopment(): boolean {
    return isDevMode();
  }

  /**
   * Verifica si está en producción
   */
  private isProduction(): boolean {
    return !isDevMode();
  }
}
