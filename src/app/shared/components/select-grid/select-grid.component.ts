import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { FormFieldComponent } from '../form-field/form-field.component';
import { SelectGridColumn } from './select-grid.types';

@Component({
  selector: 'app-select-grid',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectModule, ButtonModule, FormFieldComponent],
  templateUrl: './select-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectGridComponent {
  id = input<string>('sg-' + Math.random().toString(36).substring(2, 11));
  label = input<string>('');
  placeholder = input<string>('Seleccione...');
  icon = input<string>('');
  required = input<boolean>(false);
  control = input.required<AbstractControl>();
  options = input<any[]>([]);
  optionLabel = input<string>('label');
  optionValue = input<string>('value');
  columns = input<SelectGridColumn[]>([]);
  filterBy = input<string>('');
  showClear = input<boolean>(true);
  emptyFilterLabel = input<string>('Nuevo');
  emptyFilterIcon = input<string>('pi pi-plus');
  allowAdd = input<boolean>(true);
  showAvatar = input<boolean>(false);

  onEmptyFilterAction = output<void>();
  onChange = output<any>();

  getNestedValue(item: any, path: string): any {
    if (!item || !path) return '';
    return path.split('.').reduce((acc, part) => acc && acc[part], item);
  }

  getItemImage(item: any): string | null {
    if (!item) return null;
    
    if (item.photo_url) return item.photo_url;
    
    const product = item.product || item;
    if (product && product.photos && Array.isArray(product.photos)) {
      const primaryPhoto = product.photos.find((p: any) => p.is_primary) || product.photos[0];
      if (primaryPhoto) {
        return primaryPhoto.photo_url;
      }
    }
    
    return null;
  }

  getItemIcon(item: any): string {
    const product = item?.product || item;
    if (!product) return 'pi pi-box';
    
    const type = Number(product.item_type);
    if (type === 1) return 'pi pi-box'; // Article / Product
    if (type === 2) return 'pi pi-wrench'; // Service
    return 'pi pi-tag'; // Consumable
  }

  getSelectedOption(): any {
    const val = this.control()?.value;
    const opts = this.options();
    if (!val || !opts) return null;
    return opts.find(o => o[this.optionValue()] === val) || null;
  }
}

