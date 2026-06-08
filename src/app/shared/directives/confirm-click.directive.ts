import { Directive, input, output, HostListener, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

@Directive({ selector: '[appConfirmClick]', standalone: true })
export class ConfirmClickDirective {
  readonly appConfirmClick = input<string>('¿Estás seguro?');
  readonly confirmHeader = input<string>('Confirmar acción');
  readonly appConfirm = output<void>();

  private confirmationService = inject(ConfirmationService);

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    event.preventDefault();

    this.confirmationService.confirm({
      message: this.appConfirmClick(),
      header: this.confirmHeader(),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.appConfirm.emit()
    });
  }
}
