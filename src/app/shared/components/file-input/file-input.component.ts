import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormFieldComponent } from '../form-field/form-field.component';
import { BaseFormControl } from '../base-form-control';
import { getFileIcon, getFileIconClass, formatFileSize } from '../../modals/modal-shell/modal-shell.utils';

@Component({
  selector: 'app-file-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent],
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FileInputComponent extends BaseFormControl implements OnInit, OnChanges {
  protected prefix = 'file-';

  @Input() id: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() override control!: any;
  @Input() accept: string = '*';
  @Input() mode: 'add' | 'edit' | 'view' = 'add';
  @Input() fallbackIcon: string = 'pi-file';

  filePayload: File | null = null;
  localPreview: string | null = null;
  dragOver = false;

  getFileIcon = getFileIcon;
  getFileIconClass = getFileIconClass;
  formatFileSize = formatFileSize;

  override ngOnInit() {
    super.ngOnInit();
    this.syncInitialState();
  }

  override ngOnChanges(changes: SimpleChanges) {
    if (changes['control'] || changes['mode']) {
      this.syncInitialState();
    }
  }

  private syncInitialState() {
    if (!this.control?.value) {
      this.filePayload = null;
      this.localPreview = null;
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  private processFile(file: File) {
    this.filePayload = file;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.localPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.localPreview = null;
    }
    this.setControlValue(file);
  }

  removeFile(event: Event) {
    event.stopPropagation();
    this.filePayload = null;
    this.localPreview = null;
    this.setControlValue('');
  }
}
