import { Directive, input, TemplateRef, ViewContainerRef, effect, inject, EmbeddedViewRef } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

@Directive({ selector: '[appHasPermission]', standalone: true })
export class HasPermissionDirective {
  readonly appHasPermission = input.required<string>();

  private auth = inject(AuthService);
  private tpl = inject(TemplateRef);
  private vcr = inject(ViewContainerRef);
  private viewRef: EmbeddedViewRef<unknown> | null = null;

  constructor() {
    effect(() => {
      if (this.auth.checkPermission(this.appHasPermission())) {
        if (!this.viewRef) this.viewRef = this.vcr.createEmbeddedView(this.tpl);
      } else {
        this.vcr.clear();
        this.viewRef = null;
      }
    });
  }
}
