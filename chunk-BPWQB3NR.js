import{a as ne}from"./chunk-XZD5HUGA.js";import{R as Y,T as Z,U as ee,V as v}from"./chunk-FEGLZRDY.js";import{Aa as s,Cb as K,Cc as G,Db as d,Eb as L,Fb as O,Fc as U,Na as P,Nb as Q,O as B,Qa as A,R as V,Ra as D,Sa as m,T as y,Y as p,Z as l,Za as f,_ as M,_b as H,ea as x,fb as c,gb as _,hb as g,ib as N,kc as E,la as C,mb as I,nb as w,pb as h,rb as u,sb as r,tb as j,ub as F,vb as z,wa as S,wc as $,xb as T,xd as J,yb as k,yc as q,yd as W,zb as R,zd as X}from"./chunk-Q7KJUPWW.js";var te=`
    .p-chip {
        display: inline-flex;
        align-items: center;
        background: dt('chip.background');
        color: dt('chip.color');
        border-radius: dt('chip.border.radius');
        padding-block: dt('chip.padding.y');
        padding-inline: dt('chip.padding.x');
        gap: dt('chip.gap');
    }

    .p-chip-icon {
        color: dt('chip.icon.color');
        font-size: dt('chip.icon.size');
        width: dt('chip.icon.size');
        height: dt('chip.icon.size');
    }

    .p-chip-image {
        border-radius: 50%;
        width: dt('chip.image.width');
        height: dt('chip.image.height');
        margin-inline-start: calc(-1 * dt('chip.padding.y'));
    }

    .p-chip:has(.p-chip-remove-icon) {
        padding-inline-end: dt('chip.padding.y');
    }

    .p-chip:has(.p-chip-image) {
        padding-block-start: calc(dt('chip.padding.y') / 2);
        padding-block-end: calc(dt('chip.padding.y') / 2);
    }

    .p-chip-remove-icon {
        cursor: pointer;
        font-size: dt('chip.remove.icon.size');
        width: dt('chip.remove.icon.size');
        height: dt('chip.remove.icon.size');
        color: dt('chip.remove.icon.color');
        border-radius: 50%;
        transition:
            outline-color dt('chip.transition.duration'),
            box-shadow dt('chip.transition.duration');
        outline-color: transparent;
    }

    .p-chip-remove-icon:focus-visible {
        box-shadow: dt('chip.remove.icon.focus.ring.shadow');
        outline: dt('chip.remove.icon.focus.ring.width') dt('chip.remove.icon.focus.ring.style') dt('chip.remove.icon.focus.ring.color');
        outline-offset: dt('chip.remove.icon.focus.ring.offset');
    }
`;var re=["removeicon"],ce=["*"];function ae(n,a){if(n&1){let e=h();_(0,"img",4),u("error",function(i){p(e);let o=r();return l(o.imageError(i))}),g()}if(n&2){let e=r();d(e.cx("image")),c("pBind",e.ptm("image"))("src",e.image,S)("alt",e.alt)}}function se(n,a){if(n&1&&N(0,"span",6),n&2){let e=r(2);d(e.icon),c("pBind",e.ptm("icon"))("ngClass",e.cx("icon"))}}function pe(n,a){if(n&1&&m(0,se,1,4,"span",5),n&2){let e=r();c("ngIf",e.icon)}}function le(n,a){if(n&1&&(_(0,"div",7),L(1),g()),n&2){let e=r();d(e.cx("label")),c("pBind",e.ptm("label")),s(),O(e.label)}}function de(n,a){if(n&1){let e=h();_(0,"span",11),u("click",function(i){p(e);let o=r(3);return l(o.close(i))})("keydown",function(i){p(e);let o=r(3);return l(o.onKeydown(i))}),g()}if(n&2){let e=r(3);d(e.removeIcon),c("pBind",e.ptm("removeIcon"))("ngClass",e.cx("removeIcon")),f("tabindex",e.disabled?-1:0)("aria-label",e.removeAriaLabel)}}function me(n,a){if(n&1){let e=h();M(),_(0,"svg",12),u("click",function(i){p(e);let o=r(3);return l(o.close(i))})("keydown",function(i){p(e);let o=r(3);return l(o.onKeydown(i))}),g()}if(n&2){let e=r(3);d(e.cx("removeIcon")),c("pBind",e.ptm("removeIcon")),f("tabindex",e.disabled?-1:0)("aria-label",e.removeAriaLabel)}}function _e(n,a){if(n&1&&(I(0),m(1,de,1,6,"span",9)(2,me,1,5,"svg",10),w()),n&2){let e=r(2);s(),c("ngIf",e.removeIcon),s(),c("ngIf",!e.removeIcon)}}function ge(n,a){}function fe(n,a){n&1&&m(0,ge,0,0,"ng-template")}function he(n,a){if(n&1){let e=h();_(0,"span",13),u("click",function(i){p(e);let o=r(2);return l(o.close(i))})("keydown",function(i){p(e);let o=r(2);return l(o.onKeydown(i))}),m(1,fe,1,0,null,14),g()}if(n&2){let e=r(2);d(e.cx("removeIcon")),c("pBind",e.ptm("removeIcon")),f("tabindex",e.disabled?-1:0)("aria-label",e.removeAriaLabel),s(),c("ngTemplateOutlet",e.removeIconTemplate||e._removeIconTemplate)}}function ue(n,a){if(n&1&&(I(0),m(1,_e,3,2,"ng-container",3)(2,he,2,6,"span",8),w()),n&2){let e=r();s(),c("ngIf",!e.removeIconTemplate&&!e._removeIconTemplate),s(),c("ngIf",e.removeIconTemplate||e._removeIconTemplate)}}var ve={root:({instance:n})=>({display:!n.visible&&"none"})},be={root:({instance:n})=>["p-chip p-component",{"p-disabled":n.disabled}],image:"p-chip-image",icon:"p-chip-icon",label:"p-chip-label",removeIcon:"p-chip-remove-icon"},ie=(()=>{class n extends Y{name="chip";style=te;classes=be;inlineStyles=ve;static \u0275fac=(()=>{let e;return function(i){return(e||(e=C(n)))(i||n)}})();static \u0275prov=B({token:n,factory:n.\u0275fac})}return n})();var oe=new V("CHIP_INSTANCE"),Qe=(()=>{class n extends ee{componentName="Chip";$pcChip=y(oe,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=y(v,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}label;icon;image;alt;styleClass;disabled=!1;removable=!1;removeIcon;onRemove=new x;onImageError=new x;visible=!0;get removeAriaLabel(){return this.config.getTranslation(X.ARIA).removeLabel}get chipProps(){return this._chipProps}set chipProps(e){this._chipProps=e,e&&typeof e=="object"&&Object.entries(e).forEach(([t,i])=>this[`_${t}`]!==i&&(this[`_${t}`]=i))}_chipProps;_componentStyle=y(ie);removeIconTemplate;templates;_removeIconTemplate;onAfterContentInit(){this.templates.forEach(e=>{e.getType()==="removeicon"?this._removeIconTemplate=e.template:this._removeIconTemplate=e.template})}onChanges(e){if(e.chipProps&&e.chipProps.currentValue){let{currentValue:t}=e.chipProps;t.label!==void 0&&(this.label=t.label),t.icon!==void 0&&(this.icon=t.icon),t.image!==void 0&&(this.image=t.image),t.alt!==void 0&&(this.alt=t.alt),t.styleClass!==void 0&&(this.styleClass=t.styleClass),t.removable!==void 0&&(this.removable=t.removable),t.removeIcon!==void 0&&(this.removeIcon=t.removeIcon)}}close(e){this.visible=!1,this.onRemove.emit(e)}onKeydown(e){(e.key==="Enter"||e.key==="Backspace")&&this.close(e)}imageError(e){this.onImageError.emit(e)}get dataP(){return this.cn({removable:this.removable})}static \u0275fac=(()=>{let e;return function(i){return(e||(e=C(n)))(i||n)}})();static \u0275cmp=P({type:n,selectors:[["p-chip"]],contentQueries:function(t,i,o){if(t&1&&z(o,re,4)(o,J,4),t&2){let b;T(b=k())&&(i.removeIconTemplate=b.first),T(b=k())&&(i.templates=b)}},hostVars:6,hostBindings:function(t,i){t&2&&(f("aria-label",i.label)("data-p",i.dataP),K(i.sx("root")),d(i.cn(i.cx("root"),i.styleClass)))},inputs:{label:"label",icon:"icon",image:"image",alt:"alt",styleClass:"styleClass",disabled:[2,"disabled","disabled",E],removable:[2,"removable","removable",E],removeIcon:"removeIcon",chipProps:"chipProps"},outputs:{onRemove:"onRemove",onImageError:"onImageError"},features:[Q([ie,{provide:oe,useExisting:n},{provide:Z,useExisting:n}]),A([v]),D],ngContentSelectors:ce,decls:6,vars:4,consts:[["iconTemplate",""],[3,"pBind","class","src","alt","error",4,"ngIf","ngIfElse"],[3,"pBind","class",4,"ngIf"],[4,"ngIf"],[3,"error","pBind","src","alt"],[3,"pBind","class","ngClass",4,"ngIf"],[3,"pBind","ngClass"],[3,"pBind"],["role","button",3,"pBind","class","click","keydown",4,"ngIf"],["role","button",3,"pBind","class","ngClass","click","keydown",4,"ngIf"],["data-p-icon","times-circle","role","button",3,"pBind","class","click","keydown",4,"ngIf"],["role","button",3,"click","keydown","pBind","ngClass"],["data-p-icon","times-circle","role","button",3,"click","keydown","pBind"],["role","button",3,"click","keydown","pBind"],[4,"ngTemplateOutlet"]],template:function(t,i){if(t&1&&(j(),F(0),m(1,ae,1,5,"img",1)(2,pe,1,1,"ng-template",null,0,H)(4,le,2,4,"div",2)(5,ue,3,2,"ng-container",3)),t&2){let o=R(3);s(),c("ngIf",i.image)("ngIfElse",o),s(3),c("ngIf",i.label),s(),c("ngIf",i.removable)}},dependencies:[U,$,q,G,ne,W,v],encapsulation:2,changeDetection:0})}return n})();export{Qe as a};
