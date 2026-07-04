import { Component, Input, ViewEncapsulation, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseFormControl } from '../base-form-control';
import { FormFieldComponent } from '../form-field/form-field.component';
import { AvatarUploadComponent } from '../avatar-upload/avatar-upload.component';

@Component({
  selector: 'app-input-avatar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent, AvatarUploadComponent],
  template: `
    <app-form-field [id]="id" [label]="label" [icon]="icon" [required]="required" [control]="control">
      <div class="gm-input-avatar-container">
        <app-avatar-upload
          [imageUrl]="localPreview"
          [initials]="initials"
          [showDelete]="mode !== 'view' && !!localPreview"
          [title]="mode === 'view' ? 'Logo' : 'Cambiar logo'"
          (onImageCropped)="onImageCropped($event)"
          (onDelete)="onDelete()"
        ></app-avatar-upload>
      </div>
    </app-form-field>
  `,
  styles: [`
    .gm-input-avatar-container {
      display: flex;
      justify-content: flex-start;
      margin-top: 0.5rem;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class InputAvatarComponent extends BaseFormControl {
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() override control!: any;
  @Input() mode: 'add' | 'edit' | 'view' = 'add';
  @Input() initials: string = 'C';
  @Input() placeholder: string = '';
  protected prefix = 'avatar-';

  localPreview: string | null = null;
  private cdr = inject(ChangeDetectorRef);

  override ngOnInit() {
    super.ngOnInit();
    this.syncInitialState();
  }

  override ngOnChanges(changes: any) {
    if (changes['control'] || changes['mode']) {
      this.syncInitialState();
    }
  }

  private syncInitialState() {
    const value = this.control?.value;
    if (value && typeof value === 'string') {
      this.localPreview = value;
    } else if (!value) {
      this.localPreview = null;
    }
  }

  onImageCropped(file: File) {
    if (this.mode === 'view') return;
    
    // Generar un preview local usando FileReader
    const reader = new FileReader();
    reader.onload = () => {
      this.localPreview = reader.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);

    // Guardar el File original en el FormControl
    this.setControlValue(file);
  }

  onDelete() {
    if (this.mode === 'view') return;
    this.localPreview = null;
    this.setControlValue(null);
  }
}
