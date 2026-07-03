import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Injector, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { UnifiedCrudService } from '@shared/crud-base/unified-crud.service';

@Component({
  selector: 'app-catalog-shell',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  template: `
    <div class="p-1 md:p-2">
      <app-crud-page 
        [title]="title"
        [subtitle]="subtitle" 
        [columns]="cols"
        [data]="crud.items()" 
        [loading]="crud.loading()" 
        [formFields]="formFields" 
        [resourceName]="resourceName" 
        [isSaving]="crud.isSaving()"
        [lazy]="true" 
        [totalRecords]="crud.totalRecords()"
        [showDelete]="showDelete"
        (onLazyLoad)="crud.load($event)" 
        (onSave)="crud.save($event)"
        (onConfirmDelete)="crud.confirmDelete($event)">
      </app-crud-page>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UnifiedCrudService]
})
export class CatalogShellComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private injector = inject(Injector);
  private cdr = inject(ChangeDetectorRef);
  crud = inject(UnifiedCrudService);

  title = '';
  subtitle = 'Administra tu catálogo';
  resourceName = '';
  showDelete = true;
  cols: any[] = [];
  formFields: any[] = [];

  async ngOnInit() {
    const data = this.route.snapshot.data;
    
    this.title = data['title'] || 'Catálogo';
    this.subtitle = data['subtitle'] || this.subtitle;
    this.resourceName = data['resourceName'] || 'Elemento';
    this.showDelete = data['showDelete'] !== undefined ? data['showDelete'] : true;
    
    // Resolve dynamic imports for cols and formFields
    this.cols = typeof data['cols'] === 'function' ? await data['cols']() : (data['cols'] || []);
    this.formFields = typeof data['formFields'] === 'function' ? await data['formFields']() : (data['formFields'] || []);
    
    // Notify Angular of changes after async operation (OnPush)
    this.cdr.markForCheck();
    
    // Get service dynamically
    const serviceType = data['service'] as Type<any>;
    const serviceInstance = serviceType ? this.injector.get(serviceType) : null;

    const fetchMethod = data['methods']?.fetch as string;
    const createMethod = data['methods']?.create as string;
    const updateMethod = data['methods']?.update as string;
    const deleteMethod = data['methods']?.delete as string;

    this.crud.initialize({
      fnFetch: (serviceInstance && fetchMethod) ? ((serviceInstance as any)[fetchMethod] as Function).bind(serviceInstance) : undefined,
      fnCreate: (serviceInstance && createMethod) ? ((serviceInstance as any)[createMethod] as Function).bind(serviceInstance) : undefined,
      fnUpdate: (serviceInstance && updateMethod) ? ((serviceInstance as any)[updateMethod] as Function).bind(serviceInstance) : undefined,
      fnDelete: (serviceInstance && deleteMethod) ? ((serviceInstance as any)[deleteMethod] as Function).bind(serviceInstance) : undefined,
      resourceName: this.resourceName,
      defaultSortKey: data['defaultSortKey'] || 'sort_order'
    });
    
    // Forzar carga porque el (onLazyLoad) inicial pudo haber fallado si el config no estaba listo aún (por el await)
    this.crud.load();
  }
}
