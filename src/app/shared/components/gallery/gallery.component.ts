import { Component, input, output, signal, computed, effect, ElementRef, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-gallery',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './gallery.component.html',
    styleUrl: './gallery.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent {
    /** Lista de imágenes. Soporta un arreglo de strings (URLs) o de objetos con propiedad url/photo_url */
    items = input.required<any[]>();

    /** Determina si el usuario está en modo visualización o puede realizar acciones (ej: borrar) */
    mode = input<string>('edit');

    /** Evento que emite el elemento original a eliminar */
    deleteItem = output<any>();

    /** Referencia al contenedor del visor, usada para medir el ancho en el arrastre (swipe) */
    stageEl = viewChild<ElementRef<HTMLDivElement>>('stageEl');

    /** Índice de la foto seleccionada actualmente en el visor */
    selectedIndex = signal<number>(0);

    /** Estado de arrastre táctil/mouse para el efecto carrusel */
    isDragging = signal<boolean>(false);
    private dragStartX = signal<number>(0);
    private dragDeltaX = signal<number>(0);

    /** Mapea dinámicamente cualquier estructura de datos a un arreglo estandarizado de URLs junto con su metadata original */
    formattedImages = computed(() => {
        return this.items().map((item: any) => {
            let url = '';
            if (typeof item === 'string') {
                url = item;
            } else {
                url = item.photo_url || item.url || item.previewUrl || '';
            }
            return {
                url,
                originalItem: item,
                is_new: typeof item === 'object' && item.is_new === true
            };
        }).filter(item => !!item.url);
    });

    /** Obtiene la foto actual en base al índice seleccionado */
    currentImage = computed(() => {
        const images = this.formattedImages();
        if (images.length === 0) return '';
        const idx = this.selectedIndex();
        return images[idx]?.url || images[0]?.url || '';
    });

    /** Porcentaje de avance para la barra de progreso del visor */
    progressPercent = computed(() => {
        const total = this.formattedImages().length;
        if (total <= 1) return 100;
        return ((this.selectedIndex() + 1) / total) * 100;
    });

    /** Calcula el transform del track del carrusel, incluyendo el desplazamiento en vivo del arrastre */
    trackTransform = computed(() => {
        const idx = this.selectedIndex();
        const dragPx = this.dragDeltaX();
        return `translateX(calc(${-idx * 100}% + ${dragPx}px))`;
    });

    constructor() {
        // Protección: Si el arreglo de imágenes se reduce (ej: se borra una foto),
        // recalculamos de forma segura el índice activo para evitar desbordamientos.
        effect(() => {
            const total = this.formattedImages().length;
            if (this.selectedIndex() >= total && total > 0) {
                this.selectedIndex.set(total - 1);
            } else if (total === 0) {
                this.selectedIndex.set(0);
            }
        });
    }

    /** Navegar a la siguiente foto con bucle circular */
    next(): void {
        const total = this.formattedImages().length;
        if (total <= 1) return;
        this.selectedIndex.update((idx: number) => (idx + 1) % total);
    }

    /** Navegar a la foto anterior con bucle circular */
    prev(): void {
        const total = this.formattedImages().length;
        if (total <= 1) return;
        this.selectedIndex.update((idx: number) => (idx - 1 + total) % total);
    }

    /** Seleccionar directamente una miniatura */
    selectImage(index: number): void {
        this.selectedIndex.set(index);
    }

    /** Dispara la acción de borrado pasando el objeto original */
    onDelete(): void {
        const currentIndex = this.selectedIndex();
        const imgObj = this.formattedImages()[currentIndex];
        if (imgObj && imgObj.originalItem) {
            this.deleteItem.emit(imgObj.originalItem);
        }
    }

    // ===================== Gestos de arrastre (swipe) =====================

    private getClientX(event: MouseEvent | TouchEvent): number {
        if (event instanceof TouchEvent) {
            return event.touches[0]?.clientX ?? event.changedTouches[0]?.clientX ?? 0;
        }
        return event.clientX;
    }

    onDragStart(event: MouseEvent | TouchEvent): void {
        if (this.formattedImages().length <= 1) return;
        this.isDragging.set(true);
        this.dragStartX.set(this.getClientX(event));
        this.dragDeltaX.set(0);
    }

    onDragMove(event: MouseEvent | TouchEvent): void {
        if (!this.isDragging()) return;

        const currentX = this.getClientX(event);
        let delta = currentX - this.dragStartX();

        // Resistencia en los extremos cuando no hay bucle disponible visualmente
        const width = this.stageEl()?.nativeElement.offsetWidth || 1;
        const maxDrag = width * 0.9;
        if (Math.abs(delta) > maxDrag) {
            delta = maxDrag * Math.sign(delta);
        }

        this.dragDeltaX.set(delta);
    }

    onDragEnd(): void {
        if (!this.isDragging()) return;

        const width = this.stageEl()?.nativeElement.offsetWidth || 1;
        const delta = this.dragDeltaX();
        const threshold = width * 0.18;

        if (delta > threshold) {
            this.prev();
        } else if (delta < -threshold) {
            this.next();
        }

        this.isDragging.set(false);
        this.dragDeltaX.set(0);
    }
}