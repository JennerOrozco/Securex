import { Directive, input, TemplateRef, ViewContainerRef, effect, inject, EmbeddedViewRef } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

@Directive({ selector: '[appHasPermission]', standalone: true })
export class HasPermissionDirective {
  readonly appHasPermission = input.required<string>();
  readonly appHasPermissionElse = input<TemplateRef<any> | null>(null);

  private auth = inject(AuthService);
  private tpl = inject(TemplateRef);
  private vcr = inject(ViewContainerRef);
  
  private viewRef: EmbeddedViewRef<unknown> | null = null;
  private elseViewRef: EmbeddedViewRef<unknown> | null = null;

  constructor() {
    effect(() => {
      const hasPerm = this.auth.checkPermission(this.appHasPermission());
      const elseTpl = this.appHasPermissionElse();

      this.vcr.clear();
      this.viewRef = null;
      this.elseViewRef = null;

      if (hasPerm) {
        this.viewRef = this.vcr.createEmbeddedView(this.tpl);
      } else if (elseTpl) {
        this.elseViewRef = this.vcr.createEmbeddedView(elseTpl);
      }
    });
  }
}
