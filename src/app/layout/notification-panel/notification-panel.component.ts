import {
  Component,
  Input,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationPanelService } from '@shared/services/notification-panel.service';
import { AppNotification } from '@core/services/notification.service';
import { TimeAgoPipe } from '@shared/pipes/time-ago.pipe';
import { SwipeToDeleteDirective } from '@shared/directives/swipe-to-delete.directive';
import { ClickOutsideDirective } from '@shared/directives/click-outside.directive';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe, SwipeToDeleteDirective, ClickOutsideDirective],
  templateUrl: './notification-panel.component.html',
  styleUrl: './notification-panel.component.css',
  // ViewEncapsulation.None hace que los estilos sean globales.
  // Úsalo con precaución para no afectar otros componentes.
  encapsulation: ViewEncapsulation.None,
  // Excelente elección: OnPush mejora el rendimiento limitando las detecciones de cambios.
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationPanelComponent {
  // Input requerido para definir la vista. Angular 16+
  @Input({ required: true }) mode: 'desktop' | 'mobile' = 'desktop';

  // Inyección de dependencias moderna y limpia
  private notifPanel = inject(NotificationPanelService);

  // Asignación de estado desde el servicio.
  // Estas propiedades del servicio son Signals reactivas que el template observa directamente.
  notifications = this.notifPanel.notifications;
  notificationsLoading = this.notifPanel.notificationsLoading;
  notificationsError = this.notifPanel.notificationsError;
  showPanel = this.notifPanel.showPanel;
  unreadCount = this.notifPanel.unreadCount;

  /**
   * Signal computado que agrupa las notificaciones por franjas de fecha:
   * - "Hoy": notificaciones del día actual
   * - "Ayer": notificaciones del día anterior
   * - "Esta semana": notificaciones de los últimos 7 días (excluyendo hoy y ayer)
   * - "Anterior": notificaciones más antiguas
   * La agrupación facilita la lectura y escaneo visual del listado,
   * permitiendo al usuario contextualizar temporalmente cada alerta.
   */
  notificationsByDate = computed<{ label: string; items: AppNotification[] }[]>(() => {
    const groups: { label: string; items: AppNotification[] }[] = [];
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const isSameDay = (d1: Date, d2: Date): boolean =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const hoy: AppNotification[] = [];
    const ayer: AppNotification[] = [];
    const estaSemana: AppNotification[] = [];
    const anterior: AppNotification[] = [];

    for (const notif of this.notifications()) {
      const date = new Date(notif.created_at);
      if (isSameDay(date, today)) {
        hoy.push(notif);
      } else if (isSameDay(date, yesterday)) {
        ayer.push(notif);
      } else if (date >= weekAgo) {
        estaSemana.push(notif);
      } else {
        anterior.push(notif);
      }
    }

    if (hoy.length) groups.push({ label: 'Hoy', items: hoy });
    if (ayer.length) groups.push({ label: 'Ayer', items: ayer });
    if (estaSemana.length) groups.push({ label: 'Esta semana', items: estaSemana });
    if (anterior.length) groups.push({ label: 'Anterior', items: anterior });

    return groups;
  });

  /**
   * Signals reactivas para rastrear el estado del deslizamiento (swipe-to-delete)
   * a nivel de componente. La directiva SwipeToDeleteDirective emite el progreso
   * del delta mediante el evento appSwipeProgress, y el componente actualiza estas
   * señales para que el template pueda reaccionar visualmente (ej: cambiar el color
   * del fondo de eliminación cuando se supera el umbral).
   */
  private swipingItemId = signal<number | null>(null);
  private swipeDelta = signal<number>(0);

  /**
   * Marca una notificación específica como leída.
   * Delega la operación al servicio NotificationPanelService, que maneja
   * la mutación de estado local (optimistic update) y la sincronización con el backend.
   *
   * @param id - Identificador único de la notificación a marcar como leída.
   */
  markAsRead(id: number): void {
    this.notifPanel.markAsRead(id);
  }

  /**
   * Elimina una notificación. Recibe un evento opcional para evitar la propagación
   * en caso de que el botón esté dentro de otro elemento clickeable.
   *
   * @param id - Identificador único de la notificación a eliminar.
   * @param event - Evento de mouse opcional para detener la propagación del clic.
   */
  deleteNotification(id: number, event?: MouseEvent): void {
    if (event) event.stopPropagation(); // Evita que el clic se propague a elementos padre
    this.notifPanel.deleteNotification(id);
  }

  /**
   * Marca todas las notificaciones como leídas en lote.
   * Recorre la lista completa y envía peticiones individuales al backend,
   * actualizando el estado local de forma optimista para una respuesta visual inmediata.
   */
  markAllAsRead(): void {
    this.notifPanel.markAllAsRead();
  }

  /**
   * Cierra el panel de notificaciones.
   * Oculta el overlay o dropdown de notificaciones que esté actualmente visible
   * en la interfaz, tanto en modo desktop como mobile.
   */
  closePanel(): void {
    this.notifPanel.closePanel();
  }

  /**
   * Reintenta la carga de notificaciones después de un error.
   * Limpia el estado de error y dispara una nueva petición al backend,
   * útil cuando la red se restablece o el servidor responde nuevamente.
   */
  retry(): void {
    this.notifPanel.loadNotifications();
  }

  /**
   * Actualiza el estado de progreso del deslizamiento táctil.
   * La directiva SwipeToDeleteDirective emite este evento continuamente durante
   * el movimiento táctil (touchmove) para que el componente pueda sincronizar
   * elementos visuales circundantes, como el fondo rojo de eliminación.
   *
   * @param id - Identificador único del elemento que se está deslizando.
   * @param delta - Distancia horizontal actual del deslizamiento en píxeles.
   *                Cuando el gesto termina, el valor emitido es 0.
   */
  onSwipeProgress(id: number, delta: number): void {
    if (delta > 0) {
      this.swipingItemId.set(id);
    } else {
      this.swipingItemId.set(null);
    }
    this.swipeDelta.set(delta);
  }

  /**
   * Retorna true si el elemento con el id dado está actualmente siendo deslizado
   * y ha superado el umbral de borrado (120px). Utilizado en el template para
   * aplicar la clase CSS que oscurece el fondo de eliminación.
   *
   * @param id - Identificador único del elemento a verificar.
   * @returns true si el elemento está en estado de eliminación inminente.
   */
  isSwipingReady(id: number): boolean {
    return this.swipingItemId() === id && this.swipeDelta() > 120;
  }
}