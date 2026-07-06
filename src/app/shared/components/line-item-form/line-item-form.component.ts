import { Component, input, model, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';

import { FormControl } from '@angular/forms';

export interface LineItem {
  uuid?: string;
  product_uuid: string;
  parent_uuid?: string;
  type: 'repuesto' | 'servicio' | 'gasto';
  quantity: number;
  unit_price: number;
  unit_cost: number;
  discount: number;
  total: number;
  is_hidden: boolean;
  level?: number;
  product?: { uuid: string; product_name: string; sku: string; item_type: string; unit_price: number; average_cost: number };
}

const LINE_ITEM_TYPE_OPTIONS = [
  { label: 'Repuesto', value: 'repuesto' },
  { label: 'Servicio', value: 'servicio' },
  { label: 'Gasto', value: 'gasto' }
];

import { InputNumberComponent } from '../input-number/input-number.component';
import { SegmentSelectComponent } from '../segment-select/segment-select.component';
import { SelectGridComponent } from '../select-grid/select-grid.component';

@Component({
  selector: 'app-line-item-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    ButtonModule, CheckboxModule, TooltipModule,
    InputNumberComponent, SegmentSelectComponent, SelectGridComponent
  ],
  templateUrl: './line-item-form.component.html',
  styleUrl: './line-item-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineItemFormComponent {
  typeOptions = LINE_ITEM_TYPE_OPTIONS;
  productColumns = [
    { field: 'sku', header: 'SKU', icon: 'pi pi-barcode' },
    { field: 'formattedPrice', header: 'Precio', icon: 'pi pi-tag' }
  ];
  parentColumns = [
    { field: 'sku', header: 'SKU', icon: 'pi pi-barcode' },
    { field: 'formattedPrice', header: 'Total Servicio', icon: 'pi pi-money-bill' }
  ];

  saving = model(false);
  productOptions = input<{ label: string; value: string; product: any }[]>([]);
  parentOptions = input<{ label: string; value: string }[]>([]);

  onSubmit = output<any>();
  onCancel = output<void>();

  productControl = new FormControl('');
  parentControl = new FormControl('');
  quantityControl = new FormControl<number>(1);
  unitPriceControl = new FormControl<number>(0);
  unitCostControl = new FormControl<number>(0);
  discountControl = new FormControl<number>(0);
  profitMarginControl = new FormControl<number>(0);

  selectedProductUuid = signal('');
  quantity = signal(1);
  unitPrice = signal(0);
  unitCost = signal(0);
  discount = signal(0);
  profitMargin = signal(0);
  lineType = signal<'repuesto' | 'servicio' | 'gasto'>('repuesto');
  isHidden = signal(false);
  parentUuid = signal('');
  editingUuid = signal('');

  constructor() {
    this.productControl.valueChanges.subscribe(val => {
      if (val !== null) {
        this.onProductSelect(val);
      }
    });
    this.parentControl.valueChanges.subscribe(val => {
      if (val !== null) {
        this.parentUuid.set(val);
      }
    });
    this.quantityControl.valueChanges.subscribe(val => {
      if (val !== null) {
        this.quantity.set(val);
      }
    });
    this.unitPriceControl.valueChanges.subscribe(val => {
      if (val !== null) {
        this.unitPrice.set(val);
        this.syncMarginFromPrice();
      }
    });
    this.unitCostControl.valueChanges.subscribe(val => {
      if (val !== null) {
        this.unitCost.set(val);
        this.syncPriceFromMargin();
      }
    });
    this.discountControl.valueChanges.subscribe(val => {
      if (val !== null) {
        this.discount.set(val);
      }
    });
    this.profitMarginControl.valueChanges.subscribe(val => {
      if (val !== null) {
        this.profitMargin.set(val);
        this.syncPriceFromMargin();
      }
    });
  }

  filteredProductOptions = computed(() => {
    const opts = this.productOptions();
    const type = this.lineType();
    let filtered = opts;
    if (type === 'repuesto') {
      // Show only repuestos/articles (item_type === 1)
      filtered = opts.filter(o => o.product?.item_type === 1);
    } else if (type === 'servicio') {
      // Show only services (item_type === 2)
      filtered = opts.filter(o => o.product?.item_type === 2);
    } else {
      // Show repuestos and others for gast (item_type !== 2)
      filtered = opts.filter(o => o.product?.item_type !== 2);
    }
    return filtered.map(o => {
      const price = o.product?.unit_price ? `Q ${o.product.unit_price.toFixed(2)}` : 'Q 0.00';
      const sku = o.product?.sku || 'N/A';
      return {
        ...o,
        label: o.product?.item_name || o.label,
        formattedPrice: price,
        sku: sku
      };
    });
  });

  total = computed(() => this.quantity() * this.unitPrice() - this.discount());
  canSubmit = computed(() => {
    if (!this.selectedProductUuid()) return false;
    if (this.quantity() <= 0) return false;
    if (this.lineType() === 'gasto' && !this.parentUuid()) return false;
    if (this.lineType() !== 'servicio' && this.unitCost() > 0 && this.unitPrice() > 0 && this.unitPrice() < this.unitCost()) return false;
    return true;
  });

  private syncPriceFromMargin(): void {
    const cost = this.unitCost();
    const margin = this.profitMargin();
    if (cost > 0 && margin > 0 && margin < 100) {
      const price = cost / (1 - margin / 100);
      this.unitPrice.set(price);
      this.unitPriceControl.setValue(price, { emitEvent: false });
    }
  }

  private syncMarginFromPrice(): void {
    const cost = this.unitCost();
    const price = this.unitPrice();
    if (cost > 0 && price > cost) {
      const margin = (1 - cost / price) * 100;
      this.profitMargin.set(margin);
      this.profitMarginControl.setValue(margin, { emitEvent: false });
    }
  }

  onTypeChange(type: string): void {
    this.lineType.set(type as any);
    this.selectedProductUuid.set('');
    this.productControl.setValue('', { emitEvent: false });
    if (type === 'gasto') {
      this.isHidden.set(true);
    } else if (type === 'servicio') {
      this.unitPrice.set(0);
      this.unitPriceControl.setValue(0, { emitEvent: false });
      this.unitCost.set(0);
      this.unitCostControl.setValue(0, { emitEvent: false });
      this.discount.set(0);
      this.discountControl.setValue(0, { emitEvent: false });
      this.profitMargin.set(0);
      this.profitMarginControl.setValue(0, { emitEvent: false });
      this.isHidden.set(false);
    } else {
      this.isHidden.set(false);
    }
  }

  onProductSelect(uuid: string): void {
    this.selectedProductUuid.set(uuid);
    this.productControl.setValue(uuid, { emitEvent: false });
    const product = this.productOptions().find(o => o.value === uuid)?.product;
    if (!product) return;
    const type = this.lineType();
    if (type === 'servicio') {
      this.unitPrice.set(0);
      this.unitPriceControl.setValue(0, { emitEvent: false });
      this.unitCost.set(0);
      this.unitCostControl.setValue(0, { emitEvent: false });
    } else {
      this.unitPrice.set(product.unit_price || 0);
      this.unitPriceControl.setValue(product.unit_price || 0, { emitEvent: false });
      this.unitCost.set(product.average_cost || 0);
      this.unitCostControl.setValue(product.average_cost || 0, { emitEvent: false });
      this.syncMarginFromPrice();
    }
  }

  startEdit(item: LineItem): void {
    this.editingUuid.set(item.uuid || '');
    this.lineType.set(item.type); // Set type first so options filter synchronously updates
    this.selectedProductUuid.set(item.product_uuid);
    this.productControl.setValue(item.product_uuid, { emitEvent: false });
    this.quantity.set(item.quantity || 1);
    this.quantityControl.setValue(item.quantity || 1, { emitEvent: false });
    this.unitPrice.set(item.unit_price || 0);
    this.unitPriceControl.setValue(item.unit_price || 0, { emitEvent: false });
    this.unitCost.set(item.unit_cost || 0);
    this.unitCostControl.setValue(item.unit_cost || 0, { emitEvent: false });
    this.syncMarginFromPrice();
    this.discount.set(item.discount || 0);
    this.discountControl.setValue(item.discount || 0, { emitEvent: false });
    this.isHidden.set(item.is_hidden || false);
    this.parentUuid.set(item.parent_uuid || '');
    this.parentControl.setValue(item.parent_uuid || '', { emitEvent: false });
  }

  buildPayload(): any {
    return {
      product_uuid: this.selectedProductUuid(),
      type: this.lineType(),
      quantity: this.quantity(),
      unit_price: this.unitPrice(),
      unit_cost: this.unitCost(),
      discount: this.discount(),
      is_hidden: this.isHidden(),
      parent_uuid: this.parentUuid() || undefined,
      total: this.total(),
    };
  }

  reset(): void {
    this.selectedProductUuid.set('');
    this.productControl.setValue('', { emitEvent: false });
    this.quantity.set(1);
    this.quantityControl.setValue(1, { emitEvent: false });
    this.unitPrice.set(0);
    this.unitPriceControl.setValue(0, { emitEvent: false });
    this.unitCost.set(0);
    this.unitCostControl.setValue(0, { emitEvent: false });
    this.discount.set(0);
    this.discountControl.setValue(0, { emitEvent: false });
    this.profitMargin.set(0);
    this.profitMarginControl.setValue(0, { emitEvent: false });
    this.isHidden.set(false);
    this.parentUuid.set('');
    this.parentControl.setValue('', { emitEvent: false });
    this.editingUuid.set('');
    this.lineType.set('repuesto');
  }
}
