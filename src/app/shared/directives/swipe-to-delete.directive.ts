/**
 * Directiva `appSwipeToDelete` — Gestión de gestos táctiles para borrado mediante deslizamiento horizontal (swipe-to-dismiss).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * RESPONSABILIDAD ÚNICA:
 *   - Escucha los eventos táctiles nativos (touchstart, touchmove, touchend) sobre el
 *     elemento host.
 *   - Calcula la distancia horizontal recorrida (delta) y la aplica como transformación
 *     CSS `translateX()` sobre el host, generando el efecto visual de arrastre.
 *   - Proporciona retroalimentación háptica (vibración) cuando el usuario supera el
 *     umbral de borrado, mejorando la percepción de la acción destructiva.
 *   - Emite un evento `appSwipeToDelete` cuando el deslizamiento supera el umbral
 *     configurado, indicando al componente contenedor que debe eliminar el elemento.
 *   - Emite eventos `appSwipeProgress` con el delta actual, permitiendo que elementos
 *     circundantes (como el fondo rojo de eliminación) reaccionen visualmente.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * MODO DE USO:
 *   ```html
 *   <div [appSwipeToDelete]
 *        [appSwipeToDeleteThreshold]="150"
 *        (appSwipeToDelete)="onItemSwiped(item.id)"
 *        (appSwipeProgress)="onSwipeProgress($event)">
 *     Contenido del elemento
 *   </div>
 *   ```
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * NOTAS TÉCNICAS:
 *   - Utiliza `Renderer2` para manipular estilos inline del host, garantizando que las
 *     mutaciones del DOM sean compatibles con Angular Universal (SSR) y entornos
 *     de renderizado fuera del navegador.
 *   - Verifica `isPlatformBrowser` antes de acceder a la API `navigator.vibrate()` para
 *     evitar errores durante la renderización en el servidor (SSR).
 *   - No depende de ningún estado compartido del componente padre; cada instancia de la
 *     directiva maneja su propio estado de deslizamiento de forma aislada.
 *
 * @example
 *   <!-- En una lista de notificaciones móviles: -->
 *   @for (item of items(); track item.id) {
 *     <div [appSwipeToDelete]
 *          (appSwipeToDelete)="deleteItem(item.id)">
 *       {{ item.title }}
 *     </div>
 *   }
 */
import { Directive, EventEmitter, Output, Input, HostListener, ElementRef, Renderer2, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
    selector: '[appSwipeToDelete]',
    standalone: true
})
export class SwipeToDeleteDirective {

    // ==========================================
    // CONFIGURACIÓN DE UMBRAL DE DESLIZAMIENTO
    // ==========================================

    /**
     * Distancia mínima en píxeles que el usuario debe deslizar horizontalmente para
     * que se considere un gesto de borrado completo.
     * - Valor por defecto: 120px (suficiente para evitar falsos positivos táctiles).
     * - Se puede sobrescribir por instancia según la sensibilidad deseada.
     *
     * @default 120
     * @example
     *   <div [appSwipeToDelete] [appSwipeToDeleteThreshold]="200">...</div>
     */
    @Input() appSwipeToDeleteThreshold = 120;

    // ==========================================
    // EVENTOS DE SALIDA (Outputs)
    // ==========================================

    /**
     * Evento emitido cuando el usuario completa un gesto de deslizamiento que supera
     * el umbral configurado (`appSwipeToDeleteThreshold`).
     * El componente padre debe suscribirse a este evento para ejecutar la lógica de
     * eliminación del elemento correspondiente.
     *
     * @example
     *   <div (appSwipeToDelete)="deleteNotification(notif.id)">...</div>
     */
    @Output() appSwipeToDelete = new EventEmitter<void>();

    /**
     * Evento emitido continuamente durante el movimiento táctil, proporcionando el
     * valor actual del desplazamiento horizontal (delta) en píxeles.
     * - Útil para que elementos circundantes (ej: fondo de eliminación) reaccionen
     *   visualmente al progreso del deslizamiento.
     * - El valor será 0 cuando el gesto finalice o se resetee.
     *
     * @example
     *   <!-- En el template del componente padre: -->
     *   <div [class.bg-red-700]="swipeProgress > 120">...</div>
     */
    @Output() appSwipeProgress = new EventEmitter<number>();

    // ==========================================
    // INYECCIÓN DE DEPENDENCIAS
    // ==========================================

    /** Referencia al elemento DOM nativo sobre el cual está aplicada la directiva. */
    private elementRef = inject(ElementRef<HTMLElement>);

    /** Renderizador seguro de Angular para mutaciones de estilos inline del DOM. */
    private renderer = inject(Renderer2);

    /** Token que identifica si la plataforma de ejecución actual es un navegador. */
    private platformId = inject(PLATFORM_ID);

    // ==========================================
    // ESTADO PRIVADO DEL GESTO TÁCTIL
    // ==========================================

    /** Coordenada X del primer dedo en el momento del touchstart. */
    private touchStartX = 0;

    /** Distancia horizontal acumulada desde el inicio del gesto hasta el último touchmove. */
    private currentDeltaX = 0;

    /**
     * Flag que previene vibraciones repetitivas una vez que el usuario ya ha sido
     * notificado hápticamente del cruce del umbral.
     */
    private hasVibrated = false;

    // ==========================================
    // MANEJADORES DE EVENTOS TÁCTILES
    // ==========================================

    /**
     * Handler del evento `touchstart`.
     * - Almacena la posición inicial del dedo para calcular el desplazamiento.
     * - Inicializa las variables de estado del gesto (delta, vibración).
     * - Elimina la transición CSS para que el movimiento sea instantáneo y responda
     *   al dedo sin retardo, imitando el comportamiento nativo de listas táctiles.
     * - Activa `will-change: transform` para que el navegador optimice la capa de
     *   renderizado del elemento durante la animación, evitando reflows innecesarios.
     *
     * @param event - Evento táctil nativo del DOM.
     */
    @HostListener('touchstart', ['$event'])
    onTouchStart(event: TouchEvent): void {
        this.touchStartX = event.touches[0].clientX;
        this.currentDeltaX = 0;
        this.hasVibrated = false;

        // IMPORTANTE: Eliminar la transición para que el movimiento sea inmediato
        this.renderer.setStyle(this.elementRef.nativeElement, 'transition', 'none');
        this.renderer.setStyle(this.elementRef.nativeElement, 'will-change', 'transform');
    }

    /**
     * Handler del evento `touchmove`.
     * - Calcula la diferencia (delta) entre la posición actual del dedo y la posición
     *   inicial registrada en `touchstart`.
     * - Solo aplica el desplazamiento si el movimiento es hacia la derecha (delta > 0),
     *   ignorando deslizamientos hacia la izquierda o movimientos involuntarios.
     * - Aplica la transformación `translateX()` al elemento host en tiempo real.
     * - Cuando el delta supera el umbral configurado, activa la vibración háptica del
     *   dispositivo (si está disponible en el navegador) para confirmar la acción.
     * - La vibración ocurre una sola vez por gesto gracias al flag `hasVibrated`.
     *
     * @param event - Evento táctil nativo del DOM con la posición actualizada del dedo.
     */
    @HostListener('touchmove', ['$event'])
    onTouchMove(event: TouchEvent): void {
        const delta = event.touches[0].clientX - this.touchStartX;

        // Solo procesar deslizamiento hacia la derecha (valores positivos)
        if (delta > 0) {
            this.currentDeltaX = delta;

            // Aplicar la transformación directamente sobre el elemento host
            this.renderer.setStyle(
                this.elementRef.nativeElement,
                'transform',
                `translateX(${delta}px)`
            );

            // Emitir el progreso para que el componente padre reaccione visualmente
            this.appSwipeProgress.emit(delta);

            // Activación de retroalimentación háptica al superar el umbral
            if (delta > this.appSwipeToDeleteThreshold && !this.hasVibrated) {
                // Verificar que estamos en un navegador real antes de llamar a la API de vibración
                if (isPlatformBrowser(this.platformId) && 'vibrate' in navigator) {
                    navigator.vibrate(40); // Vibración de 40ms, sutil pero perceptible
                }
                this.hasVibrated = true;
            } else if (delta <= this.appSwipeToDeleteThreshold) {
                // Si el usuario retrocede por debajo del umbral, permitir que pueda
                // volver a vibrar si decide deslizar nuevamente más allá del límite
                this.hasVibrated = false;
            }
        }
    }

    /**
     * Handler del evento `touchend`.
     * - Restaura la transición CSS para que el elemento regrese a su posición original
     *   con una animación suave de 300ms (efecto de rebote elástico).
     * - Limpia la propiedad `will-change` para liberar la capa de renderizado.
     * - Si el delta acumulado superó el umbral de borrado, emite el evento
     *   `appSwipeToDelete` para que el componente padre procese la eliminación.
     * - Siempre resetea la transformación a `translateX(0)` independientemente de
     *   si se eliminó o no el elemento, garantizando que el estado visual sea limpio.
     * - Emite 0 en `appSwipeProgress` para notificar al padre que el gesto finalizó.
     */
    @HostListener('touchend')
    onTouchEnd(): void {
        // Restaurar la transición para la animación de retorno
        this.renderer.setStyle(this.elementRef.nativeElement, 'transition', 'transform 0.3s ease');
        // Liberar la optimización de renderizado
        this.renderer.setStyle(this.elementRef.nativeElement, 'will-change', 'auto');

        // Determinar si el deslizamiento fue suficiente para considerarse un borrado
        if (this.currentDeltaX > this.appSwipeToDeleteThreshold) {
            this.appSwipeToDelete.emit();
        }

        // Resetear la posición visual del elemento con animación suave
        this.renderer.setStyle(this.elementRef.nativeElement, 'transform', 'translateX(0)');

        // Notificar que el gesto finalizó (delta = 0)
        this.appSwipeProgress.emit(0);

        // Reiniciar el estado interno para el próximo gesto
        this.currentDeltaX = 0;
        this.hasVibrated = false;
    }

}
