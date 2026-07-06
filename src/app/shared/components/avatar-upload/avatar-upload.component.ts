import { Component, Input, Output, EventEmitter, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperComponent } from '../image-cropper/image-cropper.component';

/**
 * @description
 * Componente compartido para la carga, previsualización y recorte de imágenes de perfil o avatares.
 * Implementa la interfaz visual de arrastrar y soltar (Drag & Drop), maneja la apertura del modal
 * de recorte (\`<app-image-cropper>\`) y abstrae la lógica del DOM para mantener limpios los
 * componentes que lo consumen.
 */
@Component({
  selector: 'app-avatar-upload',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent],
  templateUrl: './avatar-upload.component.html',
  styleUrls: ['./avatar-upload.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarUploadComponent {
  /** URL de la imagen actual (si existe). Prioritaria sobre las iniciales. */
  @Input() imageUrl: string | null | undefined = null;
  /** Iniciales de respaldo a renderizar cuando no hay imagen disponible. */
  @Input() initials: string = 'U';
  /** Estado de carga asíncrona; deshabilita la interacción mientras está en verdadero. */
  @Input() loading: boolean = false;
  /** Controla si el botón flotante de eliminación debe renderizarse. */
  @Input() showDelete: boolean = true;
  /** Texto nativo de ayuda (tooltip) al posicionar el cursor sobre el componente. */
  @Input() title: string = 'Cambiar foto';

  /** Evento emitido con el objeto `File` final resultante tras el recorte y validación. */
  @Output() onImageCropped = new EventEmitter<File>();
  /** Evento emitido al hacer clic en el botón de eliminar. */
  @Output() onDelete = new EventEmitter<Event>();

  /** Señal de control para la visibilidad del modal interno de recorte (`<app-image-cropper>`). */
  cropVisible = signal<boolean>(false);
  /** Señal activa cuando un archivo es arrastrado sobre la zona de caída. */
  avatarDragOver = signal<boolean>(false);
  /** Señal que almacena temporalmente el archivo soltado antes del recorte. */
  droppedFile = signal<File | null>(null);

  /** 
   * Abre explícitamente el modal de recorte. Útil cuando el usuario prefiere hacer clic
   * en lugar de arrastrar un archivo.
   */
  openCropModal() {
    this.cropVisible.set(true);
  }

  /**
   * Intercepta el evento de arrastre sobre el contenedor para activar estilos visuales de foco.
   * @param {DragEvent} event - Evento nativo del DOM.
   */
  onAvatarDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.avatarDragOver.set(true);
  }

  /**
   * Restaura los estilos visuales cuando el puntero del arrastre abandona el contenedor.
   */
  onAvatarDragLeave() {
    this.avatarDragOver.set(false);
  }

  /**
   * Procesa la caída del archivo sobre el componente, validando su tipología MIME (image/*).
   * Si es válido, lo almacena en estado y despliega el modal de edición de imagen.
   * @param {DragEvent} event - Evento nativo del DOM portando la carga útil (DataTransfer).
   */
  onAvatarDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.avatarDragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.droppedFile.set(file);
      this.openCropModal();
    }
  }

  /**
   * Recepciona el archivo final emitido por el `<app-image-cropper>` y lo delega al padre.
   * @param {File} croppedFile - Archivo procesado (recortado, escalado y comprimido).
   */
  handleCrop(croppedFile: File) {
    this.onImageCropped.emit(croppedFile);
    this.handleCropClose();
  }

  /**
   * Restaura el estado interno del componente cerrando el modal y purgando el archivo temporal.
   */
  handleCropClose() {
    this.cropVisible.set(false);
    this.droppedFile.set(null);
  }

  /**
   * Intercepta el clic en el botón de eliminar avatar y lo propaga hacia el padre,
   * deteniendo la propagación en el DOM para evitar la apertura accidental del modal de subida.
   * @param {Event} event - Evento nativo del DOM.
   */
  deleteProfilePicture(event: Event) {
    event.stopPropagation();
    this.onDelete.emit(event);
  }
}
