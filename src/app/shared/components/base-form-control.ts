import { Directive, OnDestroy, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive()
export abstract class BaseFormControl implements OnInit, OnChanges, OnDestroy {
  abstract id: string;
  abstract label: string;
  abstract placeholder: string;
  abstract icon: string;
  abstract required: boolean;
  @Input() abstract control: AbstractControl;

  protected updatingSelf = false;
  private sub?: Subscription;

  protected abstract prefix: string;

  ngOnInit() {
    if (!this.id) {
      this.id = this.prefix + Math.random().toString(36).substring(2, 11);
    }
    this.initControl();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['control'] && !changes['control'].firstChange) {
      this.sub?.unsubscribe();
      this.initControl();
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private initControl() {
    if (this.control) {
      this.onControlInit();
      this.sub = this.control.valueChanges.subscribe((val) => {
        if (!this.updatingSelf) {
          this.onControlChange(val);
        }
      });
    }
  }

  protected onControlInit() {}
  protected onControlChange(_val: any) {}

  protected setControlValue(value: any, options?: { emitEvent?: boolean }) {
    this.updatingSelf = true;
    this.control.setValue(value, options);
    this.control.markAsDirty();
    this.control.markAsTouched();
    this.updatingSelf = false;
  }

  onBlur() {
    if (this.control) {
      this.control.markAsTouched();
      this.control.updateValueAndValidity();
    }
  }
}
