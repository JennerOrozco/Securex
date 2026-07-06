import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { BaseFormControl } from '../base-form-control';
import { FormFieldComponent } from '../form-field/form-field.component';

interface Hsv {
  h: number;
  s: number;
  v: number;
}

@Component({
  selector: 'app-input-color',
  standalone: true,
  imports: [CommonModule, FormFieldComponent, InputTextModule],
  templateUrl: './input-color.html',
  styleUrl: './input-color.css',
})
export class InputColorComponent extends BaseFormControl {
  @Input() id = '';
  @Input() label = '';
  @Input() placeholder = '#000000';
  @Input() icon = 'pi pi-palette';
  @Input() required = false;
  @Input() override control!: AbstractControl;

  isOpen = false;
  hsv: Hsv = { h: 210, s: 60, v: 70 };
  hexDraft = '';

  protected prefix = 'color-';

  @HostBinding('class.is-open') get openClass() {
    return this.isOpen;
  }

  readonly presets: string[] = [
    '#1a2333', '#9c2b3a', '#c9a14a', '#3f6b52',
    '#2f6690', '#7a4f9c', '#8b8478', '#e8e2d6',
  ];

  @ViewChild('satBox') private satBoxRef?: ElementRef<HTMLDivElement>;
  @ViewChild('hueBar') private hueBarRef?: ElementRef<HTMLDivElement>;

  private dragTarget: 'sat' | 'hue' | null = null;

  constructor(private host: ElementRef<HTMLElement>) {
    super();
  }

  override onControlInit(): void {
    this.syncFromControl(this.control?.value);
  }

  override onControlChange(val: unknown): void {
    if (val !== this.hexValue) this.syncFromControl(val);
  }

  get hexValue(): string {
    return hsvToHex(this.hsv);
  }

  get hueBackground(): string {
    return `hsl(${this.hsv.h}, 100%, 50%)`;
  }

  togglePanel(): void {
    this.isOpen ? this.close() : this.open();
  }

  open(): void {
    this.hexDraft = this.hexValue;
    this.isOpen = true;
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.control?.markAsTouched();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  @HostListener('document:pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.dragTarget) return;
    event.preventDefault();
    if (this.dragTarget === 'sat') this.updateSatFromEvent(event);
    else this.updateHueFromEvent(event);
  }

  @HostListener('document:pointerup')
  onPointerUp(): void {
    if (this.dragTarget) {
      this.dragTarget = null;
      this.emitChange();
    }
  }

  startSatDrag(event: PointerEvent): void {
    this.dragTarget = 'sat';
    this.updateSatFromEvent(event);
  }

  startHueDrag(event: PointerEvent): void {
    this.dragTarget = 'hue';
    this.updateHueFromEvent(event);
  }

  onHexInput(value: string): void {
    this.hexDraft = value;
  }

  commitHexDraft(): void {
    const parsed = hexToHsv(this.hexDraft);
    if (parsed) {
      this.hsv = parsed;
      this.emitChange();
    } else {
      this.hexDraft = this.hexValue;
    }
  }

  selectPreset(hex: string): void {
    const parsed = hexToHsv(hex);
    if (!parsed) return;
    this.hsv = parsed;
    this.hexDraft = this.hexValue;
    this.emitChange();
  }

  private updateSatFromEvent(event: PointerEvent): void {
    const rect = this.satBoxRef?.nativeElement.getBoundingClientRect();
    if (!rect) return;
    const x = clamp(event.clientX - rect.left, 0, rect.width);
    const y = clamp(event.clientY - rect.top, 0, rect.height);
    this.hsv = { ...this.hsv, s: (x / rect.width) * 100, v: 100 - (y / rect.height) * 100 };
    this.hexDraft = this.hexValue;
  }

  private updateHueFromEvent(event: PointerEvent): void {
    const rect = this.hueBarRef?.nativeElement.getBoundingClientRect();
    if (!rect) return;
    const x = clamp(event.clientX - rect.left, 0, rect.width);
    this.hsv = { ...this.hsv, h: (x / rect.width) * 360 };
    this.hexDraft = this.hexValue;
  }

  private syncFromControl(value: unknown): void {
    const parsed = typeof value === 'string' ? hexToHsv(value) : null;
    this.hsv = parsed ?? this.hsv;
    this.hexDraft = this.hexValue;
  }

  private emitChange(): void {
    this.setControlValue(this.hexValue);
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function hexToHsv(hex: string): Hsv | null {
  const match = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim());
  if (!match) return null;
  let h = match[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let hue = 0;
  if (d !== 0) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;
  return { h: hue, s, v };
}

function hsvToHex(hsv: Hsv): string {
  const { h, s, v } = hsv;
  const sNorm = s / 100;
  const vNorm = v / 100;
  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vNorm - c;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else[r, g, b] = [c, 0, x];
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
