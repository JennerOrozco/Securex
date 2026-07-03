import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy, ViewEncapsulation, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalShellComponent } from '../../modals/modal-shell/modal-shell.component';
import { formatFileSize } from '@shared/utils/file-utils';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

type HandleId = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se';

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, ModalShellComponent, ButtonModule, RippleModule],
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.css']
})
export class ImageCropperComponent implements OnChanges, OnDestroy {
  private cdr = inject(ChangeDetectorRef);

  get aspectRatioLabel(): string {
    if (this.aspectRatio === 1) return '1:1';
    if (this.aspectRatio === 4/3) return '4:3';
    if (this.aspectRatio === 16/9) return '16:9';
    return 'Libre';
  }

  @Input() visible = false;
  @Input() aspectRatio: number | null = null;
  @Input() maxWidth = 800;
  @Input() maxHeight = 800;
  @Input() quality = 0.85;
  @Input() outputFormat: string = 'image/jpeg';
  @Input() existingImageUrl: string | null = null;
  @Input() set fileToCrop(file: File | null) {
    if (file) {
      this.internalFile = file;
      this.fileName = file.name;
      this.fileSize = formatFileSize(file.size);
      this.loadImage(file);
    }
  }

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onCrop = new EventEmitter<File>();
  @Output() onClose = new EventEmitter<void>();

  @ViewChild('imgCanvas', { static: false }) imgCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('imgContainer', { static: false }) imgContainerRef?: ElementRef<HTMLDivElement>;
  @ViewChild('previewCanvas', { static: false }) previewCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput', { static: false }) fileInputRef?: ElementRef<HTMLInputElement>;

  private internalFile: File | null = null;
  private imageObj: HTMLImageElement | null = null;
  private isDragging = false;
  private isPinching = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private cropStartX = 0;
  private cropStartY = 0;
  private cropStartW = 0;
  private cropStartH = 0;
  private dragHandle: HandleId | null = null;
  private pinchStartDist = 0;
  private pinchStartSize = 0;

  readonly HANDLE_HIT = 12;

  hasImage = false;
  cropperLoading = false;
  fileName: string | null = null;
  fileSize: string | null = null;

  cropX = 10;
  cropY = 10;
  cropW = 80;
  cropH = 80;
  currentAspectRatio: number | null = 1;

  handleCoords: { x: number; y: number }[] = [];

  readonly handles: HandleId[] = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['aspectRatio']) {
      this.currentAspectRatio = this.aspectRatio;
      this.renderImage();
    }
    if (changes['visible'] && !this.visible) {
      this.cleanup();
    }
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private cleanup() {
    this.internalFile = null;
    this.imageObj = null;
    this.hasImage = false;
    this.cropperLoading = false;
    this.fileName = null;
    this.fileSize = null;
    this.cropX = 10;
    this.cropY = 10;
    this.cropW = 80;
    this.cropH = 80;
  }

  onVisibleChange(vis: boolean) {
    this.visible = vis;
    this.visibleChange.emit(vis);
    if (!vis) this.cleanup();
  }

  openFilePicker() {
    this.fileInputRef?.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    this.internalFile = file;
    this.fileName = file.name;
    this.fileSize = formatFileSize(file.size);
    this.loadImage(file);
    input.value = '';
  }


  private loadImage(file: File) {
    this.cropperLoading = true;
    this.hasImage = false;
    this.cdr.detectChanges();

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        this.imageObj = img;
        this.hasImage = true;
        this.cropperLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.renderImage(), 50);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  private getBoxPx(cw: number, ch: number) {
    let bw = (this.cropW / 100) * cw;
    let bh = (this.cropH / 100) * ch;
    if (this.currentAspectRatio) {
      const ar = this.currentAspectRatio;
      if (bw / bh > ar) bh = bw / ar;
      else bw = bh * ar;
    }
    return { bx: (this.cropX / 100) * cw, by: (this.cropY / 100) * ch, bw, bh };
  }

  private renderImage() {
    const canvas = this.imgCanvasRef?.nativeElement;
    const img = this.imageObj;
    if (!canvas || !img) return;

    const container = this.imgContainerRef?.nativeElement;
    const cw = container?.clientWidth || 600;
    const ch = container?.clientHeight || 400;

    canvas.width = cw;
    canvas.height = ch;
    this.cropX = 10;
    this.cropY = 10;
    this.cropW = 80;
    this.cropH = 80;
    this.drawScene(canvas, cw, ch, img);
  }

  private drawScene(canvas: HTMLCanvasElement, cw: number, ch: number, img: HTMLImageElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const drawX = (cw - drawW) / 2;
    const drawY = (ch - drawH) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    const { bx, by, bw, bh } = this.getBoxPx(cw, ch);

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, cw, by);
    ctx.fillRect(0, by + bh, cw, ch - by - bh);
    ctx.fillRect(0, by, bx, bh);
    ctx.fillRect(bx + bw, by, cw - bx - bw, bh);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);

    const hs = 10;
    this.handleCoords = [];
    const handlePositions: { x: number; y: number }[] = [
      { x: bx, y: by },
      { x: bx + bw / 2, y: by },
      { x: bx + bw, y: by },
      { x: bx, y: by + bh / 2 },
      { x: bx + bw, y: by + bh / 2 },
      { x: bx, y: by + bh },
      { x: bx + bw / 2, y: by + bh },
      { x: bx + bw, y: by + bh },
    ];

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;

    handlePositions.forEach((p) => {
      ctx.beginPath();
      ctx.rect(p.x - hs / 2, p.y - hs / 2, hs, hs);
      ctx.fill();
      ctx.stroke();
      this.handleCoords.push(p);
    });

    this.updatePreview();
  }

  private updatePreview() {
    const canvas = this.imgCanvasRef?.nativeElement;
    const preview = this.previewCanvasRef?.nativeElement;
    if (!canvas || !preview || !preview.parentElement) return;

    const { bx, by, bw, bh } = this.getBoxPx(canvas.width, canvas.height);
    if (bw < 2 || bh < 2) return;

    const pp = preview.parentElement;
    const pSize = Math.min(pp.clientWidth, pp.clientHeight, 100);

    preview.width = pSize;
    preview.height = pSize;
    const pctx = preview.getContext('2d');
    if (!pctx) return;

    pctx.clearRect(0, 0, pSize, pSize);
    const s = Math.min(pSize / bw, pSize / bh);
    const ox = (pSize - bw * s) / 2;
    const oy = (pSize - bh * s) / 2;
    pctx.drawImage(canvas, bx, by, bw, bh, ox, oy, bw * s, bh * s);

    const border = Math.max(1, Math.floor(pSize * 0.04));
    pctx.strokeStyle = '#e2e8f0';
    pctx.lineWidth = border;
    pctx.strokeRect(0, 0, pSize, pSize);
  }

  private getHandleAt(mx: number, my: number): HandleId | null {
    for (let i = 0; i < this.handleCoords.length; i++) {
      const h = this.handleCoords[i];
      if (Math.abs(mx - h.x) < this.HANDLE_HIT && Math.abs(my - h.y) < this.HANDLE_HIT) {
        return this.handles[i];
      }
    }
    return null;
  }

  onMouseDown(event: MouseEvent) {
    if (!this.imgCanvasRef) return;
    const rect = this.imgCanvasRef.nativeElement.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    const canvas = this.imgCanvasRef.nativeElement;

    const handle = this.getHandleAt(mx, my);
    if (handle) {
      this.dragHandle = handle;
      this.isDragging = true;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
      const { bx, by, bw, bh } = this.getBoxPx(canvas.width, canvas.height);
      this.cropStartX = bx;
      this.cropStartY = by;
      this.cropStartW = bw;
      this.cropStartH = bh;
      return;
    }

    const { bx, by, bw, bh } = this.getBoxPx(canvas.width, canvas.height);

    if (mx >= bx && mx <= bx + bw && my >= by && my <= by + bh) {
      this.dragHandle = null;
      this.isDragging = true;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
      this.cropStartX = this.cropX;
      this.cropStartY = this.cropY;
      return;
    }

    const cw = canvas.width;
    const ch = canvas.height;
    this.cropX = Math.round(((mx - bw / 2) / cw) * 1000) / 10;
    this.cropY = Math.round(((my - bh / 2) / ch) * 1000) / 10;

    if (this.cropX + (bw / cw) * 100 > 100) this.cropX = 100 - (bw / cw) * 100;
    if (this.cropY + (bh / ch) * 100 > 100) this.cropY = 100 - (bh / ch) * 100;
    this.cropX = Math.max(0, this.cropX);
    this.cropY = Math.max(0, this.cropY);
    this.cropX = Math.round(this.cropX * 10) / 10;
    this.cropY = Math.round(this.cropY * 10) / 10;

    this.redraw();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.imgCanvasRef) return;
    const canvas = this.imgCanvasRef.nativeElement;
    const cw = canvas.width;
    const ch = canvas.height;
    const rect = canvas.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    if (!this.isDragging) {
      const handle = this.getHandleAt(mx, my);
      if (handle) {
        if (handle === 'nw' || handle === 'se') canvas.style.cursor = 'nwse-resize';
        else if (handle === 'ne' || handle === 'sw') canvas.style.cursor = 'nesw-resize';
        else if (handle === 'n' || handle === 's') canvas.style.cursor = 'ns-resize';
        else if (handle === 'e' || handle === 'w') canvas.style.cursor = 'ew-resize';
      } else {
        const { bx, by, bw, bh } = this.getBoxPx(cw, ch);
        if (mx >= bx && mx <= bx + bw && my >= by && my <= by + bh) {
          canvas.style.cursor = 'grab';
        } else {
          canvas.style.cursor = 'default';
        }
      }
      return;
    }

    if (this.dragHandle) {
      if (this.dragHandle === 'nw' || this.dragHandle === 'se') canvas.style.cursor = 'nwse-resize';
      else if (this.dragHandle === 'ne' || this.dragHandle === 'sw') canvas.style.cursor = 'nesw-resize';
      else if (this.dragHandle === 'n' || this.dragHandle === 's') canvas.style.cursor = 'ns-resize';
      else if (this.dragHandle === 'e' || this.dragHandle === 'w') canvas.style.cursor = 'ew-resize';
    } else {
      canvas.style.cursor = 'grabbing';
    }

    const dxpx = event.clientX - this.dragStartX;
    const dypx = event.clientY - this.dragStartY;

    if (this.dragHandle) {
      this.resizeFromHandle(dxpx, dypx, cw, ch);
    } else {
      const dx = (dxpx / rect.width) * 100;
      const dy = (dypx / rect.height) * 100;
      let newX = this.cropStartX + dx;
      let newY = this.cropStartY + dy;
      let bw = this.cropW;
      let bh = this.cropH;
      if (this.currentAspectRatio) {
        const ar = this.currentAspectRatio;
        if (bw / bh > ar) bh = bw / ar;
        else bw = bh * ar;
      }
      newX = Math.max(0, Math.min(100 - bw, newX));
      newY = Math.max(0, Math.min(100 - bh, newY));
      this.cropX = Math.round(newX * 10) / 10;
      this.cropY = Math.round(newY * 10) / 10;
    }

    this.redraw();
  }

  private resizeFromHandle(dxpx: number, dypx: number, cw: number, ch: number) {
    if (!this.dragHandle) return;
    const ar = this.currentAspectRatio;

    let left = this.cropStartX;
    let top = this.cropStartY;
    let right = this.cropStartX + this.cropStartW;
    let bottom = this.cropStartY + this.cropStartH;

    const h = this.dragHandle;

    if (h.includes('w')) left += dxpx;
    if (h.includes('e')) right += dxpx;
    if (h.includes('n')) top += dypx;
    if (h.includes('s')) bottom += dypx;

    if (right - left < 20) return;
    if (bottom - top < 20) return;

    if (ar) {
      const newW = right - left;
      const newH = bottom - top;
      let fixedW = newW;
      let fixedH = newH;
      if (fixedW / fixedH > ar) fixedH = fixedW / ar;
      else fixedW = fixedH * ar;

      if (h.includes('w')) left = right - fixedW;
      if (h.includes('e')) right = left + fixedW;
      if (h.includes('n')) top = bottom - fixedH;
      if (h.includes('s')) bottom = top + fixedH;
    }

    if (left < 0) { right -= left; left = 0; }
    if (top < 0) { bottom -= top; top = 0; }
    if (right > cw) { left -= right - cw; right = cw; }
    if (bottom > ch) { top -= bottom - ch; bottom = ch; }

    const finalW = right - left;
    const finalH = bottom - top;
    if (finalW < 20 || finalH < 20) return;

    this.cropX = Math.round((left / cw) * 1000) / 10;
    this.cropY = Math.round((top / ch) * 1000) / 10;
    this.cropW = Math.round(((finalW / cw) * 100) * 10) / 10;
    this.cropH = Math.round(((finalH / ch) * 100) * 10) / 10;
  }

  onMouseUp() {
    this.isDragging = false;
    this.dragHandle = null;
    if (this.imgCanvasRef) {
      this.imgCanvasRef.nativeElement.style.cursor = 'default';
    }
  }

  onTouchStart(event: TouchEvent) {
    event.preventDefault();
    if (!this.imgCanvasRef) return;

    if (event.touches.length === 2) {
      this.isPinching = true;
      this.isDragging = false;
      this.pinchStartDist = this.getTouchDist(event.touches);
      this.pinchStartSize = this.cropW;
      return;
    }

    if (event.touches.length !== 1) return;
    if (this.isPinching) return;

    const touch = event.touches[0];
    const rect = this.imgCanvasRef.nativeElement.getBoundingClientRect();
    const mx = touch.clientX - rect.left;
    const my = touch.clientY - rect.top;

    const canvas = this.imgCanvasRef.nativeElement;

    const handle = this.getHandleAt(mx, my);
    if (handle) {
      this.dragHandle = handle;
      this.isDragging = true;
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      const { bx, by, bw, bh } = this.getBoxPx(canvas.width, canvas.height);
      this.cropStartX = bx;
      this.cropStartY = by;
      this.cropStartW = bw;
      this.cropStartH = bh;
      return;
    }

    const { bx, by, bw, bh } = this.getBoxPx(canvas.width, canvas.height);

    if (mx >= bx && mx <= bx + bw && my >= by && my <= by + bh) {
      this.dragHandle = null;
      this.isDragging = true;
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.cropStartX = this.cropX;
      this.cropStartY = this.cropY;
      return;
    }

    const cw = canvas.width;
    const ch = canvas.height;
    this.cropX = Math.round(((mx - bw / 2) / cw) * 1000) / 10;
    this.cropY = Math.round(((my - bh / 2) / ch) * 1000) / 10;

    if (this.cropX + (bw / cw) * 100 > 100) this.cropX = 100 - (bw / cw) * 100;
    if (this.cropY + (bh / ch) * 100 > 100) this.cropY = 100 - (bh / ch) * 100;
    this.cropX = Math.max(0, this.cropX);
    this.cropY = Math.max(0, this.cropY);
    this.cropX = Math.round(this.cropX * 10) / 10;
    this.cropY = Math.round(this.cropY * 10) / 10;

    this.redraw();
  }

  onTouchMove(event: TouchEvent) {
    event.preventDefault();
    if (!this.imgCanvasRef) return;

    if (this.isPinching && event.touches.length === 2) {
      const dist = this.getTouchDist(event.touches);
      const scale = this.pinchStartDist > 0 ? dist / this.pinchStartDist : 1;
      let newSize = Math.round(this.pinchStartSize / scale);
      newSize = Math.max(5, Math.min(100, newSize));
      if (this.cropX + newSize > 100 || this.cropY + newSize > 100) {
        newSize = Math.max(5, this.cropW);
      }
      this.cropW = newSize;
      this.cropH = newSize;
      this.redraw();
      return;
    }

    if (!this.isDragging || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const canvas = this.imgCanvasRef.nativeElement;
    const cw = canvas.width;
    const ch = canvas.height;
    const rect = canvas.getBoundingClientRect();
    const dxpx = touch.clientX - this.dragStartX;
    const dypx = touch.clientY - this.dragStartY;

    if (this.dragHandle) {
      this.resizeFromHandle(dxpx, dypx, cw, ch);
    } else {
      const dx = (dxpx / rect.width) * 100;
      const dy = (dypx / rect.height) * 100;
      let newX = this.cropStartX + dx;
      let newY = this.cropStartY + dy;
      let bw = this.cropW;
      let bh = this.cropH;
      if (this.currentAspectRatio) {
        const ar = this.currentAspectRatio;
        if (bw / bh > ar) bh = bw / ar;
        else bw = bh * ar;
      }
      newX = Math.max(0, Math.min(100 - bw, newX));
      newY = Math.max(0, Math.min(100 - bh, newY));
      this.cropX = Math.round(newX * 10) / 10;
      this.cropY = Math.round(newY * 10) / 10;
    }

    this.redraw();
  }

  onTouchEnd() {
    this.isDragging = false;
    this.isPinching = false;
    this.dragHandle = null;
    this.pinchStartDist = 0;
  }

  private getTouchDist(touches: TouchList): number {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -3 : 3;
    let newSize = this.cropW + delta;
    let ratio = this.cropH / this.cropW;

    if (this.currentAspectRatio) {
      const ar = this.currentAspectRatio;
      let bw = newSize;
      let bh = newSize;
      if (bw / bh > ar) bh = bw / ar;
      else bw = bh * ar;
      if (this.cropX + bw > 100 || this.cropY + bh > 100) return;
    } else {
      if (this.cropX + newSize > 100 || this.cropY + (newSize * ratio) > 100) return;
    }

    this.cropW = Math.max(10, Math.min(100, newSize));
    this.cropH = this.cropW * ratio;
    this.redraw();
  }

  private redraw() {
    const canvas = this.imgCanvasRef?.nativeElement;
    const img = this.imageObj;
    if (!canvas || !img) return;
    this.drawScene(canvas, canvas.width, canvas.height, img);
  }

  zoomIn() {
    const newSize = Math.max(10, this.cropW - 5);
    this.cropW = newSize;
      this.cropH = newSize;
    this.redraw();
  }

  zoomOut() {
    const newSize = Math.min(100, this.cropW + 5);
    if (this.currentAspectRatio) {
      const ar = this.currentAspectRatio;
      let bw = newSize;
      let bh = newSize;
      if (bw / bh > ar) bh = bw / ar;
      else bw = bh * ar;
      if (this.cropX + bw > 100 || this.cropY + bh > 100) return;
    }
    this.cropW = newSize;
      this.cropH = newSize;
    this.redraw();
  }

  reset() {
    this.cropX = 10;
    this.cropY = 10;
    this.cropW = 80;
    this.cropH = 80;
    this.redraw();
  }

  removeImage() {
    this.imageObj = null;
    this.internalFile = null;
    this.hasImage = false;
    this.fileName = null;
    this.fileSize = null;
  }

  cancel() {
    this.onClose.emit();
    this.onVisibleChange(false);
  }

  async confirmCrop() {
    if (!this.imageObj || !this.internalFile) return;
    const img = this.imageObj;
    const canvas = this.imgCanvasRef?.nativeElement;
    if (!canvas) return;

    const cw = canvas.width;
    const ch = canvas.height;

    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const drawX = (cw - drawW) / 2;
    const drawY = (ch - drawH) / 2;

    const { bx, by, bw, bh } = this.getBoxPx(cw, ch);

    const sx = Math.max(0, (bx - drawX) / scale);
    const sy = Math.max(0, (by - drawY) / scale);
    const sw = Math.min(img.naturalWidth - sx, bw / scale);
    const sh = Math.min(img.naturalHeight - sy, bh / scale);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = this.maxWidth;
    outCanvas.height = this.maxHeight;
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) return;

    outCtx.drawImage(img, sx, sy, sw, sh, 0, 0, this.maxWidth, this.maxHeight);

    outCanvas.toBlob((blob) => {
      if (blob) {
        const ext = this.outputFormat === 'image/jpeg' ? '.jpg' : '.png';
        const name = this.internalFile!.name.replace(/\.[^.]+$/, ext);
        const croppedFile = new File([blob], name, { type: this.outputFormat });
        this.onCrop.emit(croppedFile);
        this.onVisibleChange(false);
      }
    }, this.outputFormat, this.quality);
  }
}
