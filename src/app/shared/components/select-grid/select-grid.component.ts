import { Component, Input, Output, EventEmitter } from '@angular/core';
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
})
export class SelectGridComponent {
  @Input() id: string = 'sg-' + Math.random().toString(36).substr(2, 9);
  @Input() label: string = '';
  @Input() placeholder: string = 'Seleccione...';
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() control!: AbstractControl;
  @Input() options: any[] = [];
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() columns: SelectGridColumn[] = [];
  @Input() filterBy: string = '';
  @Input() showClear: boolean = true;
  @Input() emptyFilterLabel: string = 'Nuevo';
  @Input() emptyFilterIcon: string = 'pi pi-plus';
  @Input() allowAdd: boolean = true;
  @Input() showAvatar: boolean = false;

  @Output() onEmptyFilterAction = new EventEmitter<void>();
  @Output() onChange = new EventEmitter<any>();

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
    const val = this.control?.value;
    if (!val || !this.options) return null;
    return this.options.find(o => o[this.optionValue] === val) || null;
  }
}
