import{e as Ne}from"./chunk-3V4FFSBY.js";import{$ as ke,H as k,N as K,P as Q,Q as Y,R as x,T as G,X as Le,b as _e,ba as Fe,c as Ce,ca as F,ea as W,g as De,i as Ee,j as Oe,k as Te,l as se,s as le}from"./chunk-SYO2D24S.js";import{F as Me,ca as Se,d as ge,fa as we,ga as Ie,h as be,k as U,l as xe}from"./chunk-YBKB6OHG.js";import{$a as j,Ab as ce,Bb as oe,Eb as T,Fa as d,Gb as l,Hb as P,Ib as w,Ic as b,Jb as me,Kb as he,Lb as I,Mb as N,Oa as te,Sb as ve,T as A,Tb as fe,U as J,Ub as L,Va as R,Vb as $,W as B,Wa as ne,Xa as m,Xb as re,Y as p,Za as z,_a as h,a as _,ba as v,bc as Z,ca as f,cc as ye,dc as q,gb as pe,ja as a,ka as ae,kb as y,lb as g,na as D,oa as ee,pa as de,qa as c,qb as C,rb as H,sb as ue,ub as E,uc as u,vb as O,wb as S,yc as o,zb as ie}from"./chunk-I3RGZUCU.js";var X=(()=>{class t extends Y{modelValue=D(void 0);$filled=u(()=>Me(this.modelValue()));writeModelValue(e){this.modelValue.set(e)}static \u0275fac=(()=>{let e;return function(i){return(e||(e=c(t)))(i||t)}})();static \u0275dir=m({type:t,features:[h]})}return t})();var Ve=`
    .p-inputtext {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('inputtext.color');
        background: dt('inputtext.background');
        padding-block: dt('inputtext.padding.y');
        padding-inline: dt('inputtext.padding.x');
        border: 1px solid dt('inputtext.border.color');
        transition:
            background dt('inputtext.transition.duration'),
            color dt('inputtext.transition.duration'),
            border-color dt('inputtext.transition.duration'),
            outline-color dt('inputtext.transition.duration'),
            box-shadow dt('inputtext.transition.duration');
        appearance: none;
        border-radius: dt('inputtext.border.radius');
        outline-color: transparent;
        box-shadow: dt('inputtext.shadow');
    }

    .p-inputtext:enabled:hover {
        border-color: dt('inputtext.hover.border.color');
    }

    .p-inputtext:enabled:focus {
        border-color: dt('inputtext.focus.border.color');
        box-shadow: dt('inputtext.focus.ring.shadow');
        outline: dt('inputtext.focus.ring.width') dt('inputtext.focus.ring.style') dt('inputtext.focus.ring.color');
        outline-offset: dt('inputtext.focus.ring.offset');
    }

    .p-inputtext.p-invalid {
        border-color: dt('inputtext.invalid.border.color');
    }

    .p-inputtext.p-variant-filled {
        background: dt('inputtext.filled.background');
    }

    .p-inputtext.p-variant-filled:enabled:hover {
        background: dt('inputtext.filled.hover.background');
    }

    .p-inputtext.p-variant-filled:enabled:focus {
        background: dt('inputtext.filled.focus.background');
    }

    .p-inputtext:disabled {
        opacity: 1;
        background: dt('inputtext.disabled.background');
        color: dt('inputtext.disabled.color');
    }

    .p-inputtext::placeholder {
        color: dt('inputtext.placeholder.color');
    }

    .p-inputtext.p-invalid::placeholder {
        color: dt('inputtext.invalid.placeholder.color');
    }

    .p-inputtext-sm {
        font-size: dt('inputtext.sm.font.size');
        padding-block: dt('inputtext.sm.padding.y');
        padding-inline: dt('inputtext.sm.padding.x');
    }

    .p-inputtext-lg {
        font-size: dt('inputtext.lg.font.size');
        padding-block: dt('inputtext.lg.padding.y');
        padding-inline: dt('inputtext.lg.padding.x');
    }

    .p-inputtext-fluid {
        width: 100%;
    }
`;var Ke=`
    ${Ve}

    /* For PrimeNG */
   .p-inputtext.ng-invalid.ng-dirty {
        border-color: dt('inputtext.invalid.border.color');
    }

    .p-inputtext.ng-invalid.ng-dirty::placeholder {
        color: dt('inputtext.invalid.placeholder.color');
    }
`,Qe={root:({instance:t})=>["p-inputtext p-component",{"p-filled":t.$filled(),"p-inputtext-sm":t.pSize==="small","p-inputtext-lg":t.pSize==="large","p-invalid":t.invalid(),"p-variant-filled":t.$variant()==="filled","p-inputtext-fluid":t.hasFluid}]},Ae=(()=>{class t extends K{name="inputtext";style=Ke;classes=Qe;static \u0275fac=(()=>{let e;return function(i){return(e||(e=c(t)))(i||t)}})();static \u0275prov=A({token:t,factory:t.\u0275fac})}return t})();var Be=new B("INPUTTEXT_INSTANCE"),kt=(()=>{class t extends X{componentName="InputText";hostName="";ptInputText=o();pInputTextPT=o();pInputTextUnstyled=o();bindDirectiveInstance=p(x,{self:!0});$pcInputText=p(Be,{optional:!0,skipSelf:!0})??void 0;ngControl=p(Ne,{optional:!0,self:!0});pcFluid=p(G,{optional:!0,host:!0,skipSelf:!0});pSize;variant=o();fluid=o(void 0,{transform:b});invalid=o(void 0,{transform:b});$variant=u(()=>this.variant()||this.config.inputStyle()||this.config.inputVariant());_componentStyle=p(Ae);constructor(){super(),ee(()=>{let e=this.ptInputText()||this.pInputTextPT();e&&this.directivePT.set(e)}),ee(()=>{this.pInputTextUnstyled()&&this.directiveUnstyled.set(this.pInputTextUnstyled())})}onAfterViewInit(){this.writeModelValue(this.ngControl?.value??this.el.nativeElement.value),this.cd.detectChanges()}onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptm("root"))}onDoCheck(){this.writeModelValue(this.ngControl?.value??this.el.nativeElement.value)}onInput(){this.writeModelValue(this.ngControl?.value??this.el.nativeElement.value)}get hasFluid(){return this.fluid()??!!this.pcFluid}get dataP(){return this.cn({invalid:this.invalid(),fluid:this.hasFluid,filled:this.$variant()==="filled",[this.pSize]:this.pSize})}static \u0275fac=function(n){return new(n||t)};static \u0275dir=m({type:t,selectors:[["","pInputText",""]],hostVars:3,hostBindings:function(n,i){n&1&&T("input",function(){return i.onInput()}),n&2&&(pe("data-p",i.dataP),L(i.cx("root")))},inputs:{hostName:"hostName",ptInputText:[1,"ptInputText"],pInputTextPT:[1,"pInputTextPT"],pInputTextUnstyled:[1,"pInputTextUnstyled"],pSize:"pSize",variant:[1,"variant"],fluid:[1,"fluid"],invalid:[1,"invalid"]},features:[Z([Ae,{provide:Be,useExisting:t},{provide:Q,useExisting:t}]),z([x]),h]})}return t})(),Ft=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=ne({type:t});static \u0275inj=J({})}return t})();var Ye=["*"];function Ge(t,s){t&1&&(E(0,"span",5),$(1,"*"),O())}function We(t,s){if(t&1&&(E(0,"label",1),$(1),y(2,Ge,2,0,"span",5),O()),t&2){let e=l();oe("htmlFor",e.id()),d(),re(" ",e.label()," "),d(),g(e.required()?2:-1)}}function Xe(t,s){if(t&1&&S(0,"i",3),t&2){let e=l();oe("className",e.icon()+" gm-field-icon")}}function Je(t,s){t&1&&S(0,"i",6)}function et(t,s){t&1&&S(0,"i",7)}function tt(t,s){if(t&1&&y(0,Je,1,0,"i",6)(1,et,1,0,"i",7),t&2){let e,n=l();g((e=n.control())!=null&&e.valid?0:(e=n.control())!=null&&e.invalid?1:-1)}}function nt(t,s){if(t&1&&(E(0,"span",4),S(1,"i",8),$(2),O()),t&2){let e=l();d(2),re(" ",e.errorMsg()||"Campo inv\xE1lido"," ")}}var Re=class t{id=o.required();label=o("");icon=o("");required=o(!1);control=o();errorMsg=o("");static \u0275fac=function(e){return new(e||t)};static \u0275cmp=R({type:t,selectors:[["app-form-field"]],inputs:{id:[1,"id"],label:[1,"label"],icon:[1,"icon"],required:[1,"required"],control:[1,"control"],errorMsg:[1,"errorMsg"]},ngContentSelectors:Ye,decls:7,vars:6,consts:[[1,"gm-field"],[1,"gm-label",3,"for"],[1,"gm-control-wrap"],[3,"className"],[1,"gm-error-msg"],[1,"gm-required"],[1,"pi","pi-check","gm-status-icon","gm-valid"],[1,"pi","pi-times","gm-status-icon","gm-invalid"],[1,"pi","pi-exclamation-circle"]],template:function(e,n){if(e&1&&(P(),E(0,"div",0),y(1,We,3,3,"label",1),E(2,"div",2),y(3,Xe,1,1,"i",3),w(4),y(5,tt,2,1),O(),y(6,nt,3,1,"span",4),O()),e&2){let i,r;ve("gm-has-icon",n.icon()),d(),g(n.label()?1:-1),d(2),g(n.icon()?3:-1),d(2),g((i=n.control())!=null&&i.touched||(i=n.control())!=null&&i.dirty?5:-1),d(),g(((r=n.control())!=null&&r.touched||(r=n.control())!=null&&r.dirty)&&((r=n.control())!=null&&r.invalid)?6:-1)}},dependencies:[U],encapsulation:2,changeDetection:0})};var ze=class t{updatingSelf=!1;sub;ngOnInit(){this.id||(this.id=this.prefix+Math.random().toString(36).substring(2,11)),this.initControl()}ngOnChanges(s){s.control&&!s.control.firstChange&&(this.sub?.unsubscribe(),this.initControl())}ngOnDestroy(){this.sub?.unsubscribe()}initControl(){this.control&&(this.onControlInit(),this.sub=this.control.valueChanges.subscribe(s=>{this.updatingSelf||this.onControlChange(s)}))}onControlInit(){}onControlChange(s){}setControlValue(s,e){this.updatingSelf=!0,this.control.setValue(s,e),this.control.markAsDirty(),this.control.markAsTouched(),this.updatingSelf=!1}onBlur(){this.control&&(this.control.markAsTouched(),this.control.updateValueAndValidity())}static \u0275fac=function(e){return new(e||t)};static \u0275dir=m({type:t,inputs:{control:"control"},features:[de]})};var je=(()=>{class t extends X{required=o(void 0,{transform:b});invalid=o(void 0,{transform:b});disabled=o(void 0,{transform:b});name=o();_disabled=D(!1);$disabled=u(()=>this.disabled()||this._disabled());onModelChange=()=>{};onModelTouched=()=>{};writeDisabledState(e){this._disabled.set(e)}writeControlValue(e,n){}writeValue(e){this.writeControlValue(e,this.writeModelValue.bind(this))}registerOnChange(e){this.onModelChange=e}registerOnTouched(e){this.onModelTouched=e}setDisabledState(e){this.writeDisabledState(e),this.cd.markForCheck()}static \u0275fac=(()=>{let e;return function(i){return(e||(e=c(t)))(i||t)}})();static \u0275dir=m({type:t,inputs:{required:[1,"required"],invalid:[1,"invalid"],disabled:[1,"disabled"],name:[1,"name"]},features:[h]})}return t})();var Wt=(()=>{class t extends je{pcFluid=p(G,{optional:!0,host:!0,skipSelf:!0});fluid=o(void 0,{transform:b});variant=o();size=o();inputSize=o();pattern=o();min=o();max=o();step=o();minlength=o();maxlength=o();$variant=u(()=>this.variant()||this.config.inputStyle()||this.config.inputVariant());get hasFluid(){return this.fluid()??!!this.pcFluid}static \u0275fac=(()=>{let e;return function(i){return(e||(e=c(t)))(i||t)}})();static \u0275dir=m({type:t,inputs:{fluid:[1,"fluid"],variant:[1,"variant"],size:[1,"size"],inputSize:[1,"inputSize"],pattern:[1,"pattern"],min:[1,"min"],max:[1,"max"],step:[1,"step"],minlength:[1,"minlength"],maxlength:[1,"maxlength"]},features:[h]})}return t})();var He=["content"],it=["overlay"],Pe=["*","*"],ot=()=>({mode:null}),qe=t=>({$implicit:t}),rt=t=>({mode:t});function st(t,s){t&1&&ie(0)}function lt(t,s){if(t&1&&(w(0),j(1,st,1,0,"ng-container",3)),t&2){let e=l();d(),C("ngTemplateOutlet",e.contentTemplate||e._contentTemplate)("ngTemplateOutletContext",q(3,qe,ye(2,ot)))}}function at(t,s){t&1&&ie(0)}function dt(t,s){if(t&1){let e=ce();H(0,"div",5,0),T("click",function(){v(e);let i=l(2);return f(i.onOverlayClick())}),H(2,"p-motion",6),T("onBeforeEnter",function(i){v(e);let r=l(2);return f(r.onOverlayBeforeEnter(i))})("onEnter",function(i){v(e);let r=l(2);return f(r.onOverlayEnter(i))})("onAfterEnter",function(i){v(e);let r=l(2);return f(r.onOverlayAfterEnter(i))})("onBeforeLeave",function(i){v(e);let r=l(2);return f(r.onOverlayBeforeLeave(i))})("onLeave",function(i){v(e);let r=l(2);return f(r.onOverlayLeave(i))})("onAfterLeave",function(i){v(e);let r=l(2);return f(r.onOverlayAfterLeave(i))}),H(3,"div",5,1),T("click",function(i){v(e);let r=l(2);return f(r.onOverlayContentClick(i))}),w(5,1),j(6,at,1,0,"ng-container",3),ue()()()}if(t&2){let e=l(2);fe(e.sx("root")),L(e.cn(e.cx("root"),e.styleClass)),C("pBind",e.ptm("root")),d(2),C("visible",e.visible)("appear",!0)("options",e.computedMotionOptions()),d(),L(e.cn(e.cx("content"),e.contentStyleClass)),C("pBind",e.ptm("content")),d(3),C("ngTemplateOutlet",e.contentTemplate||e._contentTemplate)("ngTemplateOutletContext",q(15,qe,q(13,rt,e.overlayMode)))}}function pt(t,s){if(t&1&&j(0,dt,7,17,"div",4),t&2){let e=l();C("ngIf",e.modalVisible)}}var ut={root:()=>({position:"absolute",top:"0"})},ct=`
.p-overlay-modal {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.p-overlay-content {
    transform-origin: inherit;
    will-change: transform;
}

/* Github Issue #18560 */
.p-component-overlay.p-component {
    position: relative;
}

.p-overlay-modal > .p-overlay-content {
    z-index: 1;
    width: 90%;
}

/* Position */
/* top */
.p-overlay-top {
    align-items: flex-start;
}
.p-overlay-top-start {
    align-items: flex-start;
    justify-content: flex-start;
}
.p-overlay-top-end {
    align-items: flex-start;
    justify-content: flex-end;
}

/* bottom */
.p-overlay-bottom {
    align-items: flex-end;
}
.p-overlay-bottom-start {
    align-items: flex-end;
    justify-content: flex-start;
}
.p-overlay-bottom-end {
    align-items: flex-end;
    justify-content: flex-end;
}

/* left */
.p-overlay-left {
    justify-content: flex-start;
}
.p-overlay-left-start {
    justify-content: flex-start;
    align-items: flex-start;
}
.p-overlay-left-end {
    justify-content: flex-start;
    align-items: flex-end;
}

/* right */
.p-overlay-right {
    justify-content: flex-end;
}
.p-overlay-right-start {
    justify-content: flex-end;
    align-items: flex-start;
}
.p-overlay-right-end {
    justify-content: flex-end;
    align-items: flex-end;
}

.p-overlay-content ~ .p-overlay-content {
    display: none;
}
`,mt={host:"p-overlay-host",root:({instance:t})=>["p-overlay p-component",{"p-overlay-modal p-overlay-mask p-overlay-mask-enter-active":t.modal,"p-overlay-center":t.modal&&t.overlayResponsiveDirection==="center","p-overlay-top":t.modal&&t.overlayResponsiveDirection==="top","p-overlay-top-start":t.modal&&t.overlayResponsiveDirection==="top-start","p-overlay-top-end":t.modal&&t.overlayResponsiveDirection==="top-end","p-overlay-bottom":t.modal&&t.overlayResponsiveDirection==="bottom","p-overlay-bottom-start":t.modal&&t.overlayResponsiveDirection==="bottom-start","p-overlay-bottom-end":t.modal&&t.overlayResponsiveDirection==="bottom-end","p-overlay-left":t.modal&&t.overlayResponsiveDirection==="left","p-overlay-left-start":t.modal&&t.overlayResponsiveDirection==="left-start","p-overlay-left-end":t.modal&&t.overlayResponsiveDirection==="left-end","p-overlay-right":t.modal&&t.overlayResponsiveDirection==="right","p-overlay-right-start":t.modal&&t.overlayResponsiveDirection==="right-start","p-overlay-right-end":t.modal&&t.overlayResponsiveDirection==="right-end"}],content:"p-overlay-content"},$e=(()=>{class t extends K{name="overlay";style=ct;classes=mt;inlineStyles=ut;static \u0275fac=(()=>{let e;return function(i){return(e||(e=c(t)))(i||t)}})();static \u0275prov=A({token:t,factory:t.\u0275fac})}return t})(),Ze=new B("OVERLAY_INSTANCE"),Dn=(()=>{class t extends Y{overlayService;zone;componentName="Overlay";$pcOverlay=p(Ze,{optional:!0,skipSelf:!0})??void 0;hostName="";get visible(){return this._visible}set visible(e){this._visible=e,this._visible&&!this.modalVisible&&(this.modalVisible=!0)}get mode(){return this._mode||this.overlayOptions?.mode}set mode(e){this._mode=e}get style(){return F.merge(this._style,this.modal?this.overlayResponsiveOptions?.style:this.overlayOptions?.style)}set style(e){this._style=e}get styleClass(){return F.merge(this._styleClass,this.modal?this.overlayResponsiveOptions?.styleClass:this.overlayOptions?.styleClass)}set styleClass(e){this._styleClass=e}get contentStyle(){return F.merge(this._contentStyle,this.modal?this.overlayResponsiveOptions?.contentStyle:this.overlayOptions?.contentStyle)}set contentStyle(e){this._contentStyle=e}get contentStyleClass(){return F.merge(this._contentStyleClass,this.modal?this.overlayResponsiveOptions?.contentStyleClass:this.overlayOptions?.contentStyleClass)}set contentStyleClass(e){this._contentStyleClass=e}get target(){let e=this._target||this.overlayOptions?.target;return e===void 0?"@prev":e}set target(e){this._target=e}get autoZIndex(){let e=this._autoZIndex||this.overlayOptions?.autoZIndex;return e===void 0?!0:e}set autoZIndex(e){this._autoZIndex=e}get baseZIndex(){let e=this._baseZIndex||this.overlayOptions?.baseZIndex;return e===void 0?0:e}set baseZIndex(e){this._baseZIndex=e}get showTransitionOptions(){let e=this._showTransitionOptions||this.overlayOptions?.showTransitionOptions;return e===void 0?".12s cubic-bezier(0, 0, 0.2, 1)":e}set showTransitionOptions(e){this._showTransitionOptions=e}get hideTransitionOptions(){let e=this._hideTransitionOptions||this.overlayOptions?.hideTransitionOptions;return e===void 0?".1s linear":e}set hideTransitionOptions(e){this._hideTransitionOptions=e}get listener(){return this._listener||this.overlayOptions?.listener}set listener(e){this._listener=e}get responsive(){return this._responsive||this.overlayOptions?.responsive}set responsive(e){this._responsive=e}get options(){return this._options}set options(e){this._options=e}appendTo=o(void 0);inline=o(!1);motionOptions=o(void 0);computedMotionOptions=u(()=>_(_({},this.ptm("motion")),this.motionOptions()||this.overlayOptions?.motionOptions));visibleChange=new a;onBeforeShow=new a;onShow=new a;onBeforeHide=new a;onHide=new a;onAnimationStart=new a;onAnimationDone=new a;onBeforeEnter=new a;onEnter=new a;onAfterEnter=new a;onBeforeLeave=new a;onLeave=new a;onAfterLeave=new a;overlayViewChild;contentViewChild;contentTemplate;templates;hostAttrSelector=o();$appendTo=u(()=>this.appendTo()||this.config.overlayAppendTo());_contentTemplate;_visible=!1;_mode;_style;_styleClass;_contentStyle;_contentStyleClass;_target;_autoZIndex;_baseZIndex;_showTransitionOptions;_hideTransitionOptions;_listener;_responsive;_options;modalVisible=!1;isOverlayClicked=!1;isOverlayContentClicked=!1;scrollHandler;documentClickListener;documentResizeListener;_componentStyle=p($e);bindDirectiveInstance=p(x,{self:!0});documentKeyboardListener;parentDragSubscription=null;window;transformOptions={default:"scaleY(0.8)",center:"scale(0.7)",top:"translate3d(0px, -100%, 0px)","top-start":"translate3d(0px, -100%, 0px)","top-end":"translate3d(0px, -100%, 0px)",bottom:"translate3d(0px, 100%, 0px)","bottom-start":"translate3d(0px, 100%, 0px)","bottom-end":"translate3d(0px, 100%, 0px)",left:"translate3d(-100%, 0px, 0px)","left-start":"translate3d(-100%, 0px, 0px)","left-end":"translate3d(-100%, 0px, 0px)",right:"translate3d(100%, 0px, 0px)","right-start":"translate3d(100%, 0px, 0px)","right-end":"translate3d(100%, 0px, 0px)"};get modal(){if(xe(this.platformId))return this.mode==="modal"||this.overlayResponsiveOptions&&this.document.defaultView?.matchMedia(this.overlayResponsiveOptions.media?.replace("@media","")||`(max-width: ${this.overlayResponsiveOptions.breakpoint})`).matches}get overlayMode(){return this.mode||(this.modal?"modal":"overlay")}get overlayOptions(){return _(_({},this.config?.overlayOptions),this.options)}get overlayResponsiveOptions(){return _(_({},this.overlayOptions?.responsive),this.responsive)}get overlayResponsiveDirection(){return this.overlayResponsiveOptions?.direction||"center"}get overlayEl(){return this.overlayViewChild?.nativeElement}get contentEl(){return this.contentViewChild?.nativeElement}get targetEl(){return Te(this.target,this.el?.nativeElement)}constructor(e,n){super(),this.overlayService=e,this.zone=n}onAfterContentInit(){this.templates?.forEach(e=>{e.getType()==="content"?this._contentTemplate=e.template:this._contentTemplate=e.template})}onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptm("host"))}show(e,n=!1){this.onVisibleChange(!0),this.handleEvents("onShow",{overlay:e||this.overlayEl,target:this.targetEl,mode:this.overlayMode}),n&&le(this.targetEl),this.modal&&_e(this.document?.body,"p-overflow-hidden")}hide(e,n=!1){if(this.visible)this.onVisibleChange(!1),this.handleEvents("onHide",{overlay:e||this.overlayEl,target:this.targetEl,mode:this.overlayMode}),n&&le(this.targetEl),this.modal&&Ce(this.document?.body,"p-overflow-hidden");else return}onVisibleChange(e){this._visible=e,this.visibleChange.emit(e)}onOverlayClick(){this.isOverlayClicked=!0}onOverlayContentClick(e){this.overlayService.add({originalEvent:e,target:this.targetEl}),this.isOverlayContentClicked=!0}container=D(void 0);onOverlayBeforeEnter(e){this.handleEvents("onBeforeShow",{overlay:this.overlayEl,target:this.targetEl,mode:this.overlayMode}),this.container.set(this.overlayEl||e.element),this.show(this.overlayEl,!0),this.hostAttrSelector()&&this.overlayEl&&this.overlayEl.setAttribute(this.hostAttrSelector(),""),this.appendOverlay(),this.alignOverlay(),this.bindParentDragListener(),this.setZIndex(),this.handleEvents("onBeforeEnter",e)}onOverlayEnter(e){this.handleEvents("onEnter",e)}onOverlayAfterEnter(e){this.bindListeners(),this.handleEvents("onAfterEnter",e)}onOverlayBeforeLeave(e){this.handleEvents("onBeforeHide",{overlay:this.overlayEl,target:this.targetEl,mode:this.overlayMode}),this.handleEvents("onBeforeLeave",e)}onOverlayLeave(e){this.handleEvents("onLeave",e)}onOverlayAfterLeave(e){this.hide(this.overlayEl,!0),this.container.set(null),this.unbindListeners(),this.appendOverlay(),W.clear(this.overlayEl),this.modalVisible=!1,this.cd.markForCheck(),this.handleEvents("onAfterLeave",e)}handleEvents(e,n){this[e].emit(n),this.options&&this.options[e]&&this.options[e](n),this.config?.overlayOptions&&(this.config?.overlayOptions)[e]&&(this.config?.overlayOptions)[e](n)}setZIndex(){this.autoZIndex&&W.set(this.overlayMode,this.overlayEl,this.baseZIndex+this.config?.zIndex[this.overlayMode])}appendOverlay(){this.$appendTo()&&this.$appendTo()!=="self"&&(this.$appendTo()==="body"?se(this.document.body,this.overlayEl):se(this.$appendTo(),this.overlayEl))}alignOverlay(){this.modal||this.overlayEl&&this.targetEl&&(this.overlayEl.style.minWidth=Ee(this.targetEl)+"px",this.$appendTo()==="self"?Oe(this.overlayEl,this.targetEl):De(this.overlayEl,this.targetEl))}bindListeners(){this.bindScrollListener(),this.bindDocumentClickListener(),this.bindDocumentResizeListener(),this.bindDocumentKeyboardListener()}unbindListeners(){this.unbindScrollListener(),this.unbindDocumentClickListener(),this.unbindDocumentResizeListener(),this.unbindDocumentKeyboardListener(),this.unbindParentDragListener()}bindParentDragListener(){!this.parentDragSubscription&&this.$appendTo()!=="self"&&this.targetEl&&(this.parentDragSubscription=this.overlayService.parentDragObservable.subscribe(e=>{e.contains(this.targetEl)&&this.hide(this.overlayEl,!0)}))}unbindParentDragListener(){this.parentDragSubscription&&(this.parentDragSubscription.unsubscribe(),this.parentDragSubscription=null)}bindScrollListener(){this.scrollHandler||(this.scrollHandler=new Le(this.targetEl,e=>{(!this.listener||this.listener(e,{type:"scroll",mode:this.overlayMode,valid:!0}))&&this.hide(e,!0)})),this.scrollHandler.bindScrollListener()}unbindScrollListener(){this.scrollHandler&&this.scrollHandler.unbindScrollListener()}bindDocumentClickListener(){this.documentClickListener||(this.documentClickListener=this.renderer.listen(this.document,"click",e=>{let i=!(this.targetEl&&(this.targetEl.isSameNode(e.target)||!this.isOverlayClicked&&this.targetEl.contains(e.target)))&&!this.isOverlayContentClicked;(this.listener?this.listener(e,{type:"outside",mode:this.overlayMode,valid:e.which!==3&&i}):i)&&this.hide(e),this.isOverlayClicked=this.isOverlayContentClicked=!1}))}unbindDocumentClickListener(){this.documentClickListener&&(this.documentClickListener(),this.documentClickListener=null)}bindDocumentResizeListener(){this.documentResizeListener||(this.documentResizeListener=this.renderer.listen(this.document.defaultView,"resize",e=>{(this.listener?this.listener(e,{type:"resize",mode:this.overlayMode,valid:!k()}):!k())&&this.hide(e,!0)}))}unbindDocumentResizeListener(){this.documentResizeListener&&(this.documentResizeListener(),this.documentResizeListener=null)}bindDocumentKeyboardListener(){this.documentKeyboardListener||this.zone.runOutsideAngular(()=>{this.documentKeyboardListener=this.renderer.listen(this.document.defaultView,"keydown",e=>{if(this.overlayOptions.hideOnEscape===!1||e.code!=="Escape")return;(this.listener?this.listener(e,{type:"keydown",mode:this.overlayMode,valid:!k()}):!k())&&this.zone.run(()=>{this.hide(e,!0)})})})}unbindDocumentKeyboardListener(){this.documentKeyboardListener&&(this.documentKeyboardListener(),this.documentKeyboardListener=null)}onDestroy(){this.hide(this.overlayEl,!0),this.overlayEl&&this.$appendTo()!=="self"&&(this.renderer.appendChild(this.el.nativeElement,this.overlayEl),W.clear(this.overlayEl)),this.scrollHandler&&(this.scrollHandler.destroy(),this.scrollHandler=null),this.unbindListeners()}static \u0275fac=function(n){return new(n||t)(te(Se),te(ae))};static \u0275cmp=R({type:t,selectors:[["p-overlay"]],contentQueries:function(n,i,r){if(n&1&&me(r,He,4)(r,we,4),n&2){let V;I(V=N())&&(i.contentTemplate=V.first),I(V=N())&&(i.templates=V)}},viewQuery:function(n,i){if(n&1&&he(it,5)(He,5),n&2){let r;I(r=N())&&(i.overlayViewChild=r.first),I(r=N())&&(i.contentViewChild=r.first)}},inputs:{hostName:"hostName",visible:"visible",mode:"mode",style:"style",styleClass:"styleClass",contentStyle:"contentStyle",contentStyleClass:"contentStyleClass",target:"target",autoZIndex:"autoZIndex",baseZIndex:"baseZIndex",showTransitionOptions:"showTransitionOptions",hideTransitionOptions:"hideTransitionOptions",listener:"listener",responsive:"responsive",options:"options",appendTo:[1,"appendTo"],inline:[1,"inline"],motionOptions:[1,"motionOptions"],hostAttrSelector:[1,"hostAttrSelector"]},outputs:{visibleChange:"visibleChange",onBeforeShow:"onBeforeShow",onShow:"onShow",onBeforeHide:"onBeforeHide",onHide:"onHide",onAnimationStart:"onAnimationStart",onAnimationDone:"onAnimationDone",onBeforeEnter:"onBeforeEnter",onEnter:"onEnter",onAfterEnter:"onAfterEnter",onBeforeLeave:"onBeforeLeave",onLeave:"onLeave",onAfterLeave:"onAfterLeave"},features:[Z([$e,{provide:Ze,useExisting:t},{provide:Q,useExisting:t}]),z([x]),h],ngContentSelectors:Pe,decls:2,vars:1,consts:[["overlay",""],["content",""],[3,"class","style","pBind"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],[3,"class","style","pBind","click",4,"ngIf"],[3,"click","pBind"],["name","p-anchored-overlay",3,"onBeforeEnter","onEnter","onAfterEnter","onBeforeLeave","onLeave","onAfterLeave","visible","appear","options"]],template:function(n,i){n&1&&(P(Pe),y(0,lt,2,5)(1,pt,1,1,"div",2)),n&2&&g(i.inline()?0:1)},dependencies:[U,ge,be,Ie,x,Fe,ke],encapsulation:2,changeDetection:0})}return t})();export{X as a,kt as b,Ft as c,Re as d,ze as e,je as f,Wt as g,Dn as h};
