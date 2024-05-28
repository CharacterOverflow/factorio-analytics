import{u as ge,a as pe}from"./QList.4713488d.js";import{c as ne,a as f,h as w,g as H,b as W,t as Ee,r as B,f as ue,w as O,a2 as Be,o as ce,i as ie,a3 as Te,a4 as Pe,a5 as Re,K as Oe,n as J,S as je,a6 as ze,Z as te,F as ye,a7 as Le,a8 as Qe,a9 as Ie,P as Ke,_ as be,e as ee,l as Ne,m as Ze,aa as De,ab as He}from"./index.b769df83.js";const Ue={true:"inset",item:"item-inset","item-thumbnail":"item-thumbnail-inset"},de={xs:2,sm:4,md:8,lg:16,xl:24};var xt=ne({name:"QSeparator",props:{...ge,spaced:[Boolean,String],inset:[Boolean,String],vertical:Boolean,color:String,size:String},setup(e){const t=H(),a=pe(e,t.proxy.$q),n=f(()=>e.vertical===!0?"vertical":"horizontal"),c=f(()=>` q-separator--${n.value}`),l=f(()=>e.inset!==!1?`${c.value}-${Ue[e.inset]}`:""),v=f(()=>`q-separator${c.value}${l.value}`+(e.color!==void 0?` bg-${e.color}`:"")+(a.value===!0?" q-separator--dark":"")),h=f(()=>{const C={};if(e.size!==void 0&&(C[e.vertical===!0?"width":"height"]=e.size),e.spaced!==!1){const x=e.spaced===!0?`${de.md}px`:e.spaced in de?`${de[e.spaced]}px`:e.spaced,k=e.vertical===!0?["Left","Right"]:["Top","Bottom"];C[`margin${k[0]}`]=C[`margin${k[1]}`]=x}return C});return()=>w("hr",{class:v.value,style:h.value,"aria-orientation":n.value})}}),Mt=ne({name:"QCardSection",props:{tag:{type:String,default:"div"},horizontal:Boolean},setup(e,{slots:t}){const a=f(()=>`q-card__section q-card__section--${e.horizontal===!0?"horiz row no-wrap":"vert"}`);return()=>w(e.tag,{class:a.value},W(t.default))}});let fe,re=0;const E=new Array(256);for(let e=0;e<256;e++)E[e]=(e+256).toString(16).substring(1);const Ye=(()=>{const e=typeof crypto!="undefined"?crypto:typeof window!="undefined"?window.crypto||window.msCrypto:void 0;if(e!==void 0){if(e.randomBytes!==void 0)return e.randomBytes;if(e.getRandomValues!==void 0)return t=>{const a=new Uint8Array(t);return e.getRandomValues(a),a}}return t=>{const a=[];for(let n=t;n>0;n--)a.push(Math.floor(Math.random()*256));return a}})(),ke=4096;function he(){(fe===void 0||re+16>ke)&&(re=0,fe=Ye(ke));const e=Array.prototype.slice.call(fe,re,re+=16);return e[6]=e[6]&15|64,e[8]=e[8]&63|128,E[e[0]]+E[e[1]]+E[e[2]]+E[e[3]]+"-"+E[e[4]]+E[e[5]]+"-"+E[e[6]]+E[e[7]]+"-"+E[e[8]]+E[e[9]]+"-"+E[e[10]]+E[e[11]]+E[e[12]]+E[e[13]]+E[e[14]]+E[e[15]]}function Je(e){return e==null?null:e}function we(e,t){return e==null?t===!0?`f_${he()}`:null:e}function We({getValue:e,required:t=!0}={}){if(Ee.value===!0){const a=e!==void 0?B(Je(e())):B(null);return t===!0&&a.value===null&&ue(()=>{a.value=`f_${he()}`}),e!==void 0&&O(e,n=>{a.value=we(n,t)}),a}return e!==void 0?f(()=>we(e(),t)):B(`f_${he()}`)}const xe=/^on[A-Z]/;function Xe(){const{attrs:e,vnode:t}=H(),a={listeners:B({}),attributes:B({})};function n(){const c={},l={};for(const v in e)v!=="class"&&v!=="style"&&xe.test(v)===!1&&(c[v]=e[v]);for(const v in t.props)xe.test(v)===!0&&(l[v]=t.props[v]);a.attributes.value=c,a.listeners.value=l}return Be(n),n(),a}function Ge({validate:e,resetValidation:t,requiresQForm:a}){const n=ie(Te,!1);if(n!==!1){const{props:c,proxy:l}=H();Object.assign(l,{validate:e,resetValidation:t}),O(()=>c.disable,v=>{v===!0?(typeof t=="function"&&t(),n.unbindComponent(l)):n.bindComponent(l)}),ue(()=>{c.disable!==!0&&n.bindComponent(l)}),ce(()=>{c.disable!==!0&&n.unbindComponent(l)})}else a===!0&&console.error("Parent QForm not found on useFormChild()!")}const Me=/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/,Ce=/^#[0-9a-fA-F]{4}([0-9a-fA-F]{4})?$/,Se=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,le=/^rgb\(((0|[1-9][\d]?|1[\d]{0,2}|2[\d]?|2[0-4][\d]|25[0-5]),){2}(0|[1-9][\d]?|1[\d]{0,2}|2[\d]?|2[0-4][\d]|25[0-5])\)$/,oe=/^rgba\(((0|[1-9][\d]?|1[\d]{0,2}|2[\d]?|2[0-4][\d]|25[0-5]),){2}(0|[1-9][\d]?|1[\d]{0,2}|2[\d]?|2[0-4][\d]|25[0-5]),(0|0\.[0-9]+[1-9]|0\.[1-9]+|1)\)$/,ve={date:e=>/^-?[\d]+\/[0-1]\d\/[0-3]\d$/.test(e),time:e=>/^([0-1]?\d|2[0-3]):[0-5]\d$/.test(e),fulltime:e=>/^([0-1]?\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(e),timeOrFulltime:e=>/^([0-1]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(e),email:e=>/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(e),hexColor:e=>Me.test(e),hexaColor:e=>Ce.test(e),hexOrHexaColor:e=>Se.test(e),rgbColor:e=>le.test(e),rgbaColor:e=>oe.test(e),rgbOrRgbaColor:e=>le.test(e)||oe.test(e),hexOrRgbColor:e=>Me.test(e)||le.test(e),hexaOrRgbaColor:e=>Ce.test(e)||oe.test(e),anyColor:e=>Se.test(e)||le.test(e)||oe.test(e)},et=[!0,!1,"ondemand"],tt={modelValue:{},error:{type:Boolean,default:null},errorMessage:String,noErrorIcon:Boolean,rules:Array,reactiveRules:Boolean,lazyRules:{type:[Boolean,String],default:!1,validator:e=>et.includes(e)}};function at(e,t){const{props:a,proxy:n}=H(),c=B(!1),l=B(null),v=B(!1);Ge({validate:z,resetValidation:j});let h=0,C;const x=f(()=>a.rules!==void 0&&a.rules!==null&&a.rules.length!==0),k=f(()=>a.disable!==!0&&x.value===!0&&t.value===!1),b=f(()=>a.error===!0||c.value===!0),U=f(()=>typeof a.errorMessage=="string"&&a.errorMessage.length!==0?a.errorMessage:l.value);O(()=>a.modelValue,()=>{v.value=!0,k.value===!0&&a.lazyRules===!1&&T()});function V(){a.lazyRules!=="ondemand"&&k.value===!0&&v.value===!0&&T()}O(()=>a.reactiveRules,Q=>{Q===!0?C===void 0&&(C=O(()=>a.rules,V,{immediate:!0,deep:!0})):C!==void 0&&(C(),C=void 0)},{immediate:!0}),O(()=>a.lazyRules,V),O(e,Q=>{Q===!0?v.value=!0:k.value===!0&&a.lazyRules!=="ondemand"&&T()});function j(){h++,t.value=!1,v.value=!1,c.value=!1,l.value=null,T.cancel()}function z(Q=a.modelValue){if(a.disable===!0||x.value===!1)return!0;const R=++h,Y=t.value!==!0?()=>{v.value=!0}:()=>{},I=($,S)=>{$===!0&&Y(),c.value=$,l.value=S||null,t.value=!1},L=[];for(let $=0;$<a.rules.length;$++){const S=a.rules[$];let _;if(typeof S=="function"?_=S(Q,ve):typeof S=="string"&&ve[S]!==void 0&&(_=ve[S](Q)),_===!1||typeof _=="string")return I(!0,_),!1;_!==!0&&_!==void 0&&L.push(_)}return L.length===0?(I(!1),!0):(t.value=!0,Promise.all(L).then($=>{if($===void 0||Array.isArray($)===!1||$.length===0)return R===h&&I(!1),!0;const S=$.find(_=>_===!1||typeof _=="string");return R===h&&I(S!==void 0,S),S===void 0},$=>(R===h&&(console.error($),I(!0)),!1)))}const T=Pe(z,0);return ce(()=>{C!==void 0&&C(),T.cancel()}),Object.assign(n,{resetValidation:j,validate:z}),Re(n,"hasError",()=>b.value),{isDirtyModel:v,hasRules:x,hasError:b,errorMessage:U,validate:z,resetValidation:j}}let X=[],ae=[];function Ae(e){ae=ae.filter(t=>t!==e)}function Ct(e){Ae(e),ae.push(e)}function St(e){Ae(e),ae.length===0&&X.length!==0&&(X[X.length-1](),X=[])}function _e(e){ae.length===0?e():X.push(e)}function nt(e){X=X.filter(t=>t!==e)}function me(e){return e!=null&&(""+e).length!==0}const rt={...ge,...tt,label:String,stackLabel:Boolean,hint:String,hideHint:Boolean,prefix:String,suffix:String,labelColor:String,color:String,bgColor:String,filled:Boolean,outlined:Boolean,borderless:Boolean,standout:[Boolean,String],square:Boolean,loading:Boolean,labelSlot:Boolean,bottomSlots:Boolean,hideBottomSpace:Boolean,rounded:Boolean,dense:Boolean,itemAligned:Boolean,counter:Boolean,clearable:Boolean,clearIcon:String,disable:Boolean,readonly:Boolean,autofocus:Boolean,for:String,maxlength:[Number,String]},lt=["update:modelValue","clear","focus","blur","popupShow","popupHide"];function ot({requiredForAttr:e=!0,tagProp:t}={}){const{props:a,proxy:n}=H(),c=pe(a,n.$q),l=We({required:e,getValue:()=>a.for});return{requiredForAttr:e,tag:t===!0?f(()=>a.tag):{value:"label"},isDark:c,editable:f(()=>a.disable!==!0&&a.readonly!==!0),innerLoading:B(!1),focused:B(!1),hasPopupOpen:!1,splitAttrs:Xe(),targetUid:l,rootRef:B(null),targetRef:B(null),controlRef:B(null)}}function it(e){const{props:t,emit:a,slots:n,attrs:c,proxy:l}=H(),{$q:v}=l;let h=null;e.hasValue===void 0&&(e.hasValue=f(()=>me(t.modelValue))),e.emitValue===void 0&&(e.emitValue=o=>{a("update:modelValue",o)}),e.controlEvents===void 0&&(e.controlEvents={onFocusin:s,onFocusout:i}),Object.assign(e,{clearValue:d,onControlFocusin:s,onControlFocusout:i,focus:S}),e.computedCounter===void 0&&(e.computedCounter=f(()=>{if(t.counter!==!1){const o=typeof t.modelValue=="string"||typeof t.modelValue=="number"?(""+t.modelValue).length:Array.isArray(t.modelValue)===!0?t.modelValue.length:0,g=t.maxlength!==void 0?t.maxlength:t.maxValues;return o+(g!==void 0?" / "+g:"")}}));const{isDirtyModel:C,hasRules:x,hasError:k,errorMessage:b,resetValidation:U}=at(e.focused,e.innerLoading),V=e.floatingLabel!==void 0?f(()=>t.stackLabel===!0||e.focused.value===!0||e.floatingLabel.value===!0):f(()=>t.stackLabel===!0||e.focused.value===!0||e.hasValue.value===!0),j=f(()=>t.bottomSlots===!0||t.hint!==void 0||x.value===!0||t.counter===!0||t.error!==null),z=f(()=>t.filled===!0?"filled":t.outlined===!0?"outlined":t.borderless===!0?"borderless":t.standout?"standout":"standard"),T=f(()=>`q-field row no-wrap items-start q-field--${z.value}`+(e.fieldClass!==void 0?` ${e.fieldClass.value}`:"")+(t.rounded===!0?" q-field--rounded":"")+(t.square===!0?" q-field--square":"")+(V.value===!0?" q-field--float":"")+(R.value===!0?" q-field--labeled":"")+(t.dense===!0?" q-field--dense":"")+(t.itemAligned===!0?" q-field--item-aligned q-item-type":"")+(e.isDark.value===!0?" q-field--dark":"")+(e.getControl===void 0?" q-field--auto-height":"")+(e.focused.value===!0?" q-field--focused":"")+(k.value===!0?" q-field--error":"")+(k.value===!0||e.focused.value===!0?" q-field--highlighted":"")+(t.hideBottomSpace!==!0&&j.value===!0?" q-field--with-bottom":"")+(t.disable===!0?" q-field--disabled":t.readonly===!0?" q-field--readonly":"")),Q=f(()=>"q-field__control relative-position row no-wrap"+(t.bgColor!==void 0?` bg-${t.bgColor}`:"")+(k.value===!0?" text-negative":typeof t.standout=="string"&&t.standout.length!==0&&e.focused.value===!0?` ${t.standout}`:t.color!==void 0?` text-${t.color}`:"")),R=f(()=>t.labelSlot===!0||t.label!==void 0),Y=f(()=>"q-field__label no-pointer-events absolute ellipsis"+(t.labelColor!==void 0&&k.value!==!0?` text-${t.labelColor}`:"")),I=f(()=>({id:e.targetUid.value,editable:e.editable.value,focused:e.focused.value,floatingLabel:V.value,modelValue:t.modelValue,emitValue:e.emitValue})),L=f(()=>{const o={};return e.targetUid.value&&(o.for=e.targetUid.value),t.disable===!0&&(o["aria-disabled"]="true"),o});function $(){const o=document.activeElement;let g=e.targetRef!==void 0&&e.targetRef.value;g&&(o===null||o.id!==e.targetUid.value)&&(g.hasAttribute("tabindex")===!0||(g=g.querySelector("[tabindex]")),g&&g!==o&&g.focus({preventScroll:!0}))}function S(){_e($)}function _(){nt($);const o=document.activeElement;o!==null&&e.rootRef.value.contains(o)&&o.blur()}function s(o){h!==null&&(clearTimeout(h),h=null),e.editable.value===!0&&e.focused.value===!1&&(e.focused.value=!0,a("focus",o))}function i(o,g){h!==null&&clearTimeout(h),h=setTimeout(()=>{h=null,!(document.hasFocus()===!0&&(e.hasPopupOpen===!0||e.controlRef===void 0||e.controlRef.value===null||e.controlRef.value.contains(document.activeElement)!==!1))&&(e.focused.value===!0&&(e.focused.value=!1,a("blur",o)),g!==void 0&&g())})}function d(o){Oe(o),v.platform.is.mobile!==!0?(e.targetRef!==void 0&&e.targetRef.value||e.rootRef.value).focus():e.rootRef.value.contains(document.activeElement)===!0&&document.activeElement.blur(),t.type==="file"&&(e.inputRef.value.value=null),a("update:modelValue",null),a("clear",t.modelValue),J(()=>{const g=C.value;U(),C.value=g})}function u(){const o=[];return n.prepend!==void 0&&o.push(w("div",{class:"q-field__prepend q-field__marginal row no-wrap items-center",key:"prepend",onClick:te},n.prepend())),o.push(w("div",{class:"q-field__control-container col relative-position row no-wrap q-anchor--skip"},p())),k.value===!0&&t.noErrorIcon===!1&&o.push(q("error",[w(ye,{name:v.iconSet.field.error,color:"negative"})])),t.loading===!0||e.innerLoading.value===!0?o.push(q("inner-loading-append",n.loading!==void 0?n.loading():[w(Le,{color:t.color})])):t.clearable===!0&&e.hasValue.value===!0&&e.editable.value===!0&&o.push(q("inner-clearable-append",[w(ye,{class:"q-field__focusable-action",tag:"button",name:t.clearIcon||v.iconSet.field.clear,tabindex:0,type:"button","aria-hidden":null,role:null,onClick:d})])),n.append!==void 0&&o.push(w("div",{class:"q-field__append q-field__marginal row no-wrap items-center",key:"append",onClick:te},n.append())),e.getInnerAppend!==void 0&&o.push(q("inner-append",e.getInnerAppend())),e.getControlChild!==void 0&&o.push(e.getControlChild()),o}function p(){const o=[];return t.prefix!==void 0&&t.prefix!==null&&o.push(w("div",{class:"q-field__prefix no-pointer-events row items-center"},t.prefix)),e.getShadowControl!==void 0&&e.hasShadow.value===!0&&o.push(e.getShadowControl()),e.getControl!==void 0?o.push(e.getControl()):n.rawControl!==void 0?o.push(n.rawControl()):n.control!==void 0&&o.push(w("div",{ref:e.targetRef,class:"q-field__native row",tabindex:-1,...e.splitAttrs.attributes.value,"data-autofocus":t.autofocus===!0||void 0},n.control(I.value))),R.value===!0&&o.push(w("div",{class:Y.value},W(n.label,t.label))),t.suffix!==void 0&&t.suffix!==null&&o.push(w("div",{class:"q-field__suffix no-pointer-events row items-center"},t.suffix)),o.concat(W(n.default))}function m(){let o,g;k.value===!0?b.value!==null?(o=[w("div",{role:"alert"},b.value)],g=`q--slot-error-${b.value}`):(o=W(n.error),g="q--slot-error"):(t.hideHint!==!0||e.focused.value===!0)&&(t.hint!==void 0?(o=[w("div",t.hint)],g=`q--slot-hint-${t.hint}`):(o=W(n.hint),g="q--slot-hint"));const K=t.counter===!0||n.counter!==void 0;if(t.hideBottomSpace===!0&&K===!1&&o===void 0)return;const M=w("div",{key:g,class:"q-field__messages col"},o);return w("div",{class:"q-field__bottom row items-start q-field__bottom--"+(t.hideBottomSpace!==!0?"animated":"stale"),onClick:te},[t.hideBottomSpace===!0?M:w(Qe,{name:"q-transition--field-message"},()=>M),K===!0?w("div",{class:"q-field__counter"},n.counter!==void 0?n.counter():e.computedCounter.value):null])}function q(o,g){return g===null?null:w("div",{key:o,class:"q-field__append q-field__marginal row no-wrap items-center q-anchor--skip"},g)}let y=!1;return je(()=>{y=!0}),ze(()=>{y===!0&&t.autofocus===!0&&l.focus()}),t.autofocus===!0&&ue(()=>{l.focus()}),ce(()=>{h!==null&&clearTimeout(h)}),Object.assign(l,{focus:S,blur:_}),function(){const g=e.getControl===void 0&&n.control===void 0?{...e.splitAttrs.attributes.value,"data-autofocus":t.autofocus===!0||void 0,...L.value}:L.value;return w(e.tag.value,{ref:e.rootRef,class:[T.value,c.class],style:c.style,...g},[n.before!==void 0?w("div",{class:"q-field__before q-field__marginal row no-wrap items-center",onClick:te},n.before()):null,w("div",{class:"q-field__inner relative-position col self-stretch"},[w("div",{ref:e.controlRef,class:Q.value,tabindex:-1,...e.controlEvents},u()),j.value===!0?m():null]),n.after!==void 0?w("div",{class:"q-field__after q-field__marginal row no-wrap items-center",onClick:te},n.after()):null])}}const qe={date:"####/##/##",datetime:"####/##/## ##:##",time:"##:##",fulltime:"##:##:##",phone:"(###) ### - ####",card:"#### #### #### ####"},se={"#":{pattern:"[\\d]",negate:"[^\\d]"},S:{pattern:"[a-zA-Z]",negate:"[^a-zA-Z]"},N:{pattern:"[0-9a-zA-Z]",negate:"[^0-9a-zA-Z]"},A:{pattern:"[a-zA-Z]",negate:"[^a-zA-Z]",transform:e=>e.toLocaleUpperCase()},a:{pattern:"[a-zA-Z]",negate:"[^a-zA-Z]",transform:e=>e.toLocaleLowerCase()},X:{pattern:"[0-9a-zA-Z]",negate:"[^0-9a-zA-Z]",transform:e=>e.toLocaleUpperCase()},x:{pattern:"[0-9a-zA-Z]",negate:"[^0-9a-zA-Z]",transform:e=>e.toLocaleLowerCase()}},Ve=Object.keys(se);Ve.forEach(e=>{se[e].regex=new RegExp(se[e].pattern)});const st=new RegExp("\\\\([^.*+?^${}()|([\\]])|([.*+?^${}()|[\\]])|(["+Ve.join("")+"])|(.)","g"),$e=/[.*+?^${}()|[\]\\]/g,D=String.fromCharCode(1),ut={mask:String,reverseFillMask:Boolean,fillMask:[Boolean,String],unmaskedValue:Boolean};function ct(e,t,a,n){let c,l,v,h,C,x;const k=B(null),b=B(V());function U(){return e.autogrow===!0||["textarea","text","search","url","tel","password"].includes(e.type)}O(()=>e.type+e.autogrow,z),O(()=>e.mask,s=>{if(s!==void 0)T(b.value,!0);else{const i=S(b.value);z(),e.modelValue!==i&&t("update:modelValue",i)}}),O(()=>e.fillMask+e.reverseFillMask,()=>{k.value===!0&&T(b.value,!0)}),O(()=>e.unmaskedValue,()=>{k.value===!0&&T(b.value)});function V(){if(z(),k.value===!0){const s=L(S(e.modelValue));return e.fillMask!==!1?_(s):s}return e.modelValue}function j(s){if(s<c.length)return c.slice(-s);let i="",d=c;const u=d.indexOf(D);if(u!==-1){for(let p=s-d.length;p>0;p--)i+=D;d=d.slice(0,u)+i+d.slice(u)}return d}function z(){if(k.value=e.mask!==void 0&&e.mask.length!==0&&U(),k.value===!1){h=void 0,c="",l="";return}const s=qe[e.mask]===void 0?e.mask:qe[e.mask],i=typeof e.fillMask=="string"&&e.fillMask.length!==0?e.fillMask.slice(0,1):"_",d=i.replace($e,"\\$&"),u=[],p=[],m=[];let q=e.reverseFillMask===!0,y="",o="";s.replace(st,(A,r,F,Z,N)=>{if(Z!==void 0){const P=se[Z];m.push(P),o=P.negate,q===!0&&(p.push("(?:"+o+"+)?("+P.pattern+"+)?(?:"+o+"+)?("+P.pattern+"+)?"),q=!1),p.push("(?:"+o+"+)?("+P.pattern+")?")}else if(F!==void 0)y="\\"+(F==="\\"?"":F),m.push(F),u.push("([^"+y+"]+)?"+y+"?");else{const P=r!==void 0?r:N;y=P==="\\"?"\\\\\\\\":P.replace($e,"\\\\$&"),m.push(P),u.push("([^"+y+"]+)?"+y+"?")}});const g=new RegExp("^"+u.join("")+"("+(y===""?".":"[^"+y+"]")+"+)?"+(y===""?"":"["+y+"]*")+"$"),K=p.length-1,M=p.map((A,r)=>r===0&&e.reverseFillMask===!0?new RegExp("^"+d+"*"+A):r===K?new RegExp("^"+A+"("+(o===""?".":o)+"+)?"+(e.reverseFillMask===!0?"$":d+"*")):new RegExp("^"+A));v=m,h=A=>{const r=g.exec(e.reverseFillMask===!0?A:A.slice(0,m.length+1));r!==null&&(A=r.slice(1).join(""));const F=[],Z=M.length;for(let N=0,P=A;N<Z;N++){const G=M[N].exec(P);if(G===null)break;P=P.slice(G.shift().length),F.push(...G)}return F.length!==0?F.join(""):A},c=m.map(A=>typeof A=="string"?A:D).join(""),l=c.split(D).join(i)}function T(s,i,d){const u=n.value,p=u.selectionEnd,m=u.value.length-p,q=S(s);i===!0&&z();const y=L(q),o=e.fillMask!==!1?_(y):y,g=b.value!==o;u.value!==o&&(u.value=o),g===!0&&(b.value=o),document.activeElement===u&&J(()=>{if(o===l){const M=e.reverseFillMask===!0?l.length:0;u.setSelectionRange(M,M,"forward");return}if(d==="insertFromPaste"&&e.reverseFillMask!==!0){const M=u.selectionEnd;let A=p-1;for(let r=C;r<=A&&r<M;r++)c[r]!==D&&A++;R.right(u,A);return}if(["deleteContentBackward","deleteContentForward"].indexOf(d)!==-1){const M=e.reverseFillMask===!0?p===0?o.length>y.length?1:0:Math.max(0,o.length-(o===l?0:Math.min(y.length,m)+1))+1:p;u.setSelectionRange(M,M,"forward");return}if(e.reverseFillMask===!0)if(g===!0){const M=Math.max(0,o.length-(o===l?0:Math.min(y.length,m+1)));M===1&&p===1?u.setSelectionRange(M,M,"forward"):R.rightReverse(u,M)}else{const M=o.length-m;u.setSelectionRange(M,M,"backward")}else if(g===!0){const M=Math.max(0,c.indexOf(D),Math.min(y.length,p)-1);R.right(u,M)}else{const M=p-1;R.right(u,M)}});const K=e.unmaskedValue===!0?S(o):o;String(e.modelValue)!==K&&(e.modelValue!==null||K!=="")&&a(K,!0)}function Q(s,i,d){const u=L(S(s.value));i=Math.max(0,c.indexOf(D),Math.min(u.length,i)),C=i,s.setSelectionRange(i,d,"forward")}const R={left(s,i){const d=c.slice(i-1).indexOf(D)===-1;let u=Math.max(0,i-1);for(;u>=0;u--)if(c[u]===D){i=u,d===!0&&i++;break}if(u<0&&c[i]!==void 0&&c[i]!==D)return R.right(s,0);i>=0&&s.setSelectionRange(i,i,"backward")},right(s,i){const d=s.value.length;let u=Math.min(d,i+1);for(;u<=d;u++)if(c[u]===D){i=u;break}else c[u-1]===D&&(i=u);if(u>d&&c[i-1]!==void 0&&c[i-1]!==D)return R.left(s,d);s.setSelectionRange(i,i,"forward")},leftReverse(s,i){const d=j(s.value.length);let u=Math.max(0,i-1);for(;u>=0;u--)if(d[u-1]===D){i=u;break}else if(d[u]===D&&(i=u,u===0))break;if(u<0&&d[i]!==void 0&&d[i]!==D)return R.rightReverse(s,0);i>=0&&s.setSelectionRange(i,i,"backward")},rightReverse(s,i){const d=s.value.length,u=j(d),p=u.slice(0,i+1).indexOf(D)===-1;let m=Math.min(d,i+1);for(;m<=d;m++)if(u[m-1]===D){i=m,i>0&&p===!0&&i--;break}if(m>d&&u[i-1]!==void 0&&u[i-1]!==D)return R.leftReverse(s,d);s.setSelectionRange(i,i,"forward")}};function Y(s){t("click",s),x=void 0}function I(s){if(t("keydown",s),Ie(s)===!0||s.altKey===!0)return;const i=n.value,d=i.selectionStart,u=i.selectionEnd;if(s.shiftKey||(x=void 0),s.keyCode===37||s.keyCode===39){s.shiftKey&&x===void 0&&(x=i.selectionDirection==="forward"?d:u);const p=R[(s.keyCode===39?"right":"left")+(e.reverseFillMask===!0?"Reverse":"")];if(s.preventDefault(),p(i,x===d?u:d),s.shiftKey){const m=i.selectionStart;i.setSelectionRange(Math.min(x,m),Math.max(x,m),"forward")}}else s.keyCode===8&&e.reverseFillMask!==!0&&d===u?(R.left(i,d),i.setSelectionRange(i.selectionStart,u,"backward")):s.keyCode===46&&e.reverseFillMask===!0&&d===u&&(R.rightReverse(i,u),i.setSelectionRange(d,i.selectionEnd,"forward"))}function L(s){if(s==null||s==="")return"";if(e.reverseFillMask===!0)return $(s);const i=v;let d=0,u="";for(let p=0;p<i.length;p++){const m=s[d],q=i[p];if(typeof q=="string")u+=q,m===q&&d++;else if(m!==void 0&&q.regex.test(m))u+=q.transform!==void 0?q.transform(m):m,d++;else return u}return u}function $(s){const i=v,d=c.indexOf(D);let u=s.length-1,p="";for(let m=i.length-1;m>=0&&u!==-1;m--){const q=i[m];let y=s[u];if(typeof q=="string")p=q+p,y===q&&u--;else if(y!==void 0&&q.regex.test(y))do p=(q.transform!==void 0?q.transform(y):y)+p,u--,y=s[u];while(d===m&&y!==void 0&&q.regex.test(y));else return p}return p}function S(s){return typeof s!="string"||h===void 0?typeof s=="number"?h(""+s):s:h(s)}function _(s){return l.length-s.length<=0?s:e.reverseFillMask===!0&&s.length!==0?l.slice(0,-s.length)+s:s+l.slice(s.length)}return{innerValue:b,hasMask:k,moveCursorForPaste:Q,updateMaskValue:T,onMaskedKeydown:I,onMaskedClick:Y}}const dt={name:String};function qt(e){return f(()=>({type:"hidden",name:e.name,value:e.modelValue}))}function $t(e={}){return(t,a,n)=>{t[a](w("input",{class:"hidden"+(n||""),...e.value}))}}function ft(e){return f(()=>e.name||e.for)}function vt(e,t){function a(){const n=e.modelValue;try{const c="DataTransfer"in window?new DataTransfer:"ClipboardEvent"in window?new ClipboardEvent("").clipboardData:void 0;return Object(n)===n&&("length"in n?Array.from(n):[n]).forEach(l=>{c.items.add(l)}),{files:c.files}}catch{return{files:void 0}}}return t===!0?f(()=>{if(e.type==="file")return a()}):f(a)}const ht=/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/,mt=/[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{2b820}-\u{2ceaf}\uf900-\ufaff\u3300-\u33ff\ufe30-\ufe4f\uf900-\ufaff\u{2f800}-\u{2fa1f}]/u,gt=/[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/,pt=/[a-z0-9_ -]$/i;function yt(e){return function(a){if(a.type==="compositionend"||a.type==="change"){if(a.target.qComposing!==!0)return;a.target.qComposing=!1,e(a)}else a.type==="compositionupdate"&&a.target.qComposing!==!0&&typeof a.data=="string"&&(Ke.is.firefox===!0?pt.test(a.data)===!1:ht.test(a.data)===!0||mt.test(a.data)===!0||gt.test(a.data)===!0)===!0&&(a.target.qComposing=!0)}}var Ft=ne({name:"QInput",inheritAttrs:!1,props:{...rt,...ut,...dt,modelValue:{required:!1},shadowText:String,type:{type:String,default:"text"},debounce:[String,Number],autogrow:Boolean,inputClass:[Array,String,Object],inputStyle:[Array,String,Object]},emits:[...lt,"paste","change","keydown","click","animationend"],setup(e,{emit:t,attrs:a}){const{proxy:n}=H(),{$q:c}=n,l={};let v=NaN,h,C,x=null,k;const b=B(null),U=ft(e),{innerValue:V,hasMask:j,moveCursorForPaste:z,updateMaskValue:T,onMaskedKeydown:Q,onMaskedClick:R}=ct(e,t,y,b),Y=vt(e,!0),I=f(()=>me(V.value)),L=yt(m),$=ot(),S=f(()=>e.type==="textarea"||e.autogrow===!0),_=f(()=>S.value===!0||["text","search","url","tel","password"].includes(e.type)),s=f(()=>{const r={...$.splitAttrs.listeners.value,onInput:m,onPaste:p,onChange:g,onBlur:K,onFocus:be};return r.onCompositionstart=r.onCompositionupdate=r.onCompositionend=L,j.value===!0&&(r.onKeydown=Q,r.onClick=R),e.autogrow===!0&&(r.onAnimationend=q),r}),i=f(()=>{const r={tabindex:0,"data-autofocus":e.autofocus===!0||void 0,rows:e.type==="textarea"?6:void 0,"aria-label":e.label,name:U.value,...$.splitAttrs.attributes.value,id:$.targetUid.value,maxlength:e.maxlength,disabled:e.disable===!0,readonly:e.readonly===!0};return S.value===!1&&(r.type=e.type),e.autogrow===!0&&(r.rows=1),r});O(()=>e.type,()=>{b.value&&(b.value.value=e.modelValue)}),O(()=>e.modelValue,r=>{if(j.value===!0){if(C===!0&&(C=!1,String(r)===v))return;T(r)}else V.value!==r&&(V.value=r,e.type==="number"&&l.hasOwnProperty("value")===!0&&(h===!0?h=!1:delete l.value));e.autogrow===!0&&J(o)}),O(()=>e.autogrow,r=>{r===!0?J(o):b.value!==null&&a.rows>0&&(b.value.style.height="auto")}),O(()=>e.dense,()=>{e.autogrow===!0&&J(o)});function d(){_e(()=>{const r=document.activeElement;b.value!==null&&b.value!==r&&(r===null||r.id!==$.targetUid.value)&&b.value.focus({preventScroll:!0})})}function u(){b.value!==null&&b.value.select()}function p(r){if(j.value===!0&&e.reverseFillMask!==!0){const F=r.target;z(F,F.selectionStart,F.selectionEnd)}t("paste",r)}function m(r){if(!r||!r.target)return;if(e.type==="file"){t("update:modelValue",r.target.files);return}const F=r.target.value;if(r.target.qComposing===!0){l.value=F;return}if(j.value===!0)T(F,!1,r.inputType);else if(y(F),_.value===!0&&r.target===document.activeElement){const{selectionStart:Z,selectionEnd:N}=r.target;Z!==void 0&&N!==void 0&&J(()=>{r.target===document.activeElement&&F.indexOf(r.target.value)===0&&r.target.setSelectionRange(Z,N)})}e.autogrow===!0&&o()}function q(r){t("animationend",r),o()}function y(r,F){k=()=>{x=null,e.type!=="number"&&l.hasOwnProperty("value")===!0&&delete l.value,e.modelValue!==r&&v!==r&&(v=r,F===!0&&(C=!0),t("update:modelValue",r),J(()=>{v===r&&(v=NaN)})),k=void 0},e.type==="number"&&(h=!0,l.value=r),e.debounce!==void 0?(x!==null&&clearTimeout(x),l.value=r,x=setTimeout(k,e.debounce)):k()}function o(){requestAnimationFrame(()=>{const r=b.value;if(r!==null){const F=r.parentNode.style,{scrollTop:Z}=r,{overflowY:N,maxHeight:P}=c.platform.is.firefox===!0?{}:window.getComputedStyle(r),G=N!==void 0&&N!=="scroll";G===!0&&(r.style.overflowY="hidden"),F.marginBottom=r.scrollHeight-1+"px",r.style.height="1px",r.style.height=r.scrollHeight+"px",G===!0&&(r.style.overflowY=parseInt(P,10)<r.scrollHeight?"auto":"hidden"),F.marginBottom="",r.scrollTop=Z}})}function g(r){L(r),x!==null&&(clearTimeout(x),x=null),k!==void 0&&k(),t("change",r.target.value)}function K(r){r!==void 0&&be(r),x!==null&&(clearTimeout(x),x=null),k!==void 0&&k(),h=!1,C=!1,delete l.value,e.type!=="file"&&setTimeout(()=>{b.value!==null&&(b.value.value=V.value!==void 0?V.value:"")})}function M(){return l.hasOwnProperty("value")===!0?l.value:V.value!==void 0?V.value:""}ce(()=>{K()}),ue(()=>{e.autogrow===!0&&o()}),Object.assign($,{innerValue:V,fieldClass:f(()=>`q-${S.value===!0?"textarea":"input"}`+(e.autogrow===!0?" q-textarea--autogrow":"")),hasShadow:f(()=>e.type!=="file"&&typeof e.shadowText=="string"&&e.shadowText.length!==0),inputRef:b,emitValue:y,hasValue:I,floatingLabel:f(()=>I.value===!0&&(e.type!=="number"||isNaN(V.value)===!1)||me(e.displayValue)),getControl:()=>w(S.value===!0?"textarea":"input",{ref:b,class:["q-field__native q-placeholder",e.inputClass],style:e.inputStyle,...i.value,...s.value,...e.type!=="file"?{value:M()}:Y.value}),getShadowControl:()=>w("div",{class:"q-field__native q-field__shadow absolute-bottom no-pointer-events"+(S.value===!0?"":" text-no-wrap")},[w("span",{class:"invisible"},M()),w("span",e.shadowText)])});const A=it($);return Object.assign(n,{focus:d,select:u,getNativeElement:()=>b.value}),Re(n,"nativeEl",()=>b.value),A}}),Rt=ne({name:"QCard",props:{...ge,tag:{type:String,default:"div"},square:Boolean,flat:Boolean,bordered:Boolean},setup(e,{slots:t}){const{proxy:{$q:a}}=H(),n=pe(e,a),c=f(()=>"q-card"+(n.value===!0?" q-card--dark q-dark":"")+(e.bordered===!0?" q-card--bordered":"")+(e.square===!0?" q-card--square no-border-radius":"")+(e.flat===!0?" q-card--flat no-shadow":""));return()=>w(e.tag,{class:c.value},W(t.default))}}),Dt=ne({name:"QPage",props:{padding:Boolean,styleFn:Function},setup(e,{slots:t}){const{proxy:{$q:a}}=H(),n=ie(Ne,ee);if(n===ee)return console.error("QPage needs to be a deep child of QLayout"),ee;if(ie(Ze,ee)===ee)return console.error("QPage needs to be child of QPageContainer"),ee;const l=f(()=>{const h=(n.header.space===!0?n.header.size:0)+(n.footer.space===!0?n.footer.size:0);if(typeof e.styleFn=="function"){const C=n.isContainer.value===!0?n.containerHeight.value:a.screen.height;return e.styleFn(h,C)}return{minHeight:n.isContainer.value===!0?n.containerHeight.value-h+"px":a.screen.height===0?h!==0?`calc(100vh - ${h}px)`:"100vh":a.screen.height-h+"px"}}),v=f(()=>`q-page${e.padding===!0?" q-layout-padding":""}`);return()=>w("main",{class:v.value,style:l.value},W(t.default))}});const Fe=De("datasets",{state:()=>({trialItemData:new Map,trialElectricData:new Map,trialCircuitData:new Map,trialPollutionData:new Map,trialSystemData:new Map,count:0,queue:[]}),getters:{},actions:{async loadDataset(e,t,a){switch(t){case"item":if(this.trialItemData.has(e))return this.trialItemData.get(e);break;case"electric":if(this.trialElectricData.has(e))return this.trialElectricData.get(e);break;case"circuit":if(this.trialCircuitData.has(e))return this.trialCircuitData.get(e);break;case"pollution":if(this.trialPollutionData.has(e))return this.trialPollutionData.get(e);break;case"system":if(this.trialSystemData.has(e))return this.trialSystemData.get(e);break}const c=await bt().queryData(e,`data_${t}`);if(c){switch(t){case"item":this.trialItemData.set(e,{data:c.data.map(l=>({cons:l.cons/a*60,prod:l.prod/a*60,tick:l.tick,label:l.label}))});break;case"electric":this.trialElectricData.set(e,{data:c.data.map(l=>({cons:l.cons/a*60,prod:l.prod/a*60,tick:l.tick,label:l.label}))});break;case"circuit":this.trialCircuitData.set(e,c);break;case"pollution":this.trialPollutionData.set(e,{data:c.data.map(l=>({count:l.count/a*60,tick:l.tick,label:l.label}))});break;case"system":this.trialSystemData.set(e,c);break}if(this.count=this.queue.unshift(`${e}_${t}`),this.queue&&this.count>20){const[l,v]=this.queue.pop().split("_");switch(v){case"item":this.trialItemData.delete(l);break;case"electric":this.trialElectricData.delete(l);break;case"circuit":this.trialCircuitData.delete(l);break;case"pollution":this.trialPollutionData.delete(l);break;case"system":this.trialSystemData.delete(l);break}}}return c},clearDataset(e){this.trialItemData.delete(e),this.trialElectricData.delete(e),this.trialCircuitData.delete(e),this.trialPollutionData.delete(e),this.trialSystemData.delete(e)},clearAllDatasets(){this.trialItemData.clear(),this.trialElectricData.clear(),this.trialCircuitData.clear(),this.trialPollutionData.clear(),this.trialSystemData.clear()},smoothData(e,t,a){let n=[],c=[];if(a>1&&t.length/2>=a)for(let l=0;l<t.length-a+1;l++){const C=t.slice(l,l+a).reduce((x,k)=>x+k,0)/a;n.push(e[l+Math.floor(a/2)]),c.push(C)}else n=e,c=t;return{xArr:n,yArr:c}}}}),bt=De("public",{state:()=>({trialMap:new Map,sourceMap:new Map,trialList:[],maxTrials:5,devMode:!1}),getters:{},actions:{addTrial(e){if(e&&(e==null?void 0:e.id)){if(this.trialList.length>=5){let t=this.trialList.pop();t&&this.removeTrial(t)}this.trialList.unshift(e.id),this.trialMap.set(e.id,e)}else throw new Error("Invalid trial object")},removeTrial(e){const t=this.trialMap.get(e);t!=null&&t.source&&this.sourceMap.delete(t.source),this.trialMap.delete(e),Fe().clearDataset(e)},addSource(e){if(e&&(e==null?void 0:e.id)){if(this.sourceMap.size>=5){const t=Array.from(this.sourceMap.keys());this.sourceMap.delete(t[0])}this.sourceMap.set(e.id,e)}else throw new Error("Invalid source object")},async loadSource(e){if(this.sourceMap.has(e))return this.sourceMap.get(e);const t=await this.querySource(e);return this.addSource(t),t},async loadTrial(e){const t=await this.queryTrial(e);if(t!=null&&t.itemMetadata){const a=Object.entries(t.itemMetadata.avg).map(([c,l])=>({key:c,value:l})),n=Object.entries(t.itemMetadata.total).map(([c,l])=>({key:c,value:l}));t.itemMetadata={avg:a,total:n}}return t!=null&&t.systemMetadata&&(t.systemMetadata=Object.entries(t.systemMetadata.min).map(([a,n])=>{const c=t.systemMetadata.avg[a],l=t.systemMetadata.max[a];return{key:a,min:n,avg:c,max:l}})),this.addTrial(t),t},async clearStorage(){this.trialMap.clear(),this.sourceMap.clear(),await Fe().clearAllDatasets()},async queryExecutionStatus(e){const t=await fetch(`${this.devMode===!0?"/api":""}/query/${e}/status`);if(t.status!==404)return await t.json()},async querySource(e){const t=await fetch(`${this.devMode===!0?"/api":""}/query/${e}/source`);if(t.status!==404)return await t.json()},async queryModlist(e){const t=await fetch(`${this.devMode===!0?"/api":""}/query/${e}/modlist`);if(t.status!==404)return await t.json()},async queryTrial(e){const t=await fetch(`${this.devMode===!0?"/api":""}/query/${e}/trial`);if(t.status!==404)return await t.json()},async queryData(e,t="data_all"){const a=await fetch(`${this.devMode===!0?"/api":""}/query/${e}/${t}`);if(a.status!==404)return await a.json()},async queryLargestTrialOfSource(e){return await(await fetch(`${this.devMode===!0?"/api":""}/analysis/largestTrialForSource/${e}`)).json()},async queryDefaultTrialOfSource(e){return await(await fetch(`${this.devMode===!0?"/api":""}/analysis/defaultTrialForSource/${e}`)).text()},async checkSource(e){return await(await fetch(`${this.devMode===!0?"/api":""}/check/${e}`)).json()},async submitSource(e){return await(await fetch(`${this.devMode===!0?"/api":""}/submit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({variant:"source",source:e})})).json()},async submitTrial(e){return await(await fetch(`${this.devMode===!0?"/api":""}/submit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({variant:"trial",trial:e})})).json()},async submitQuickSource(e){return await(await fetch(`${this.devMode===!0?"/api":""}/quickSubmit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({blueprintStr:e})})).json()},async loadDefaultTrialForSource(e){const t=await this.queryDefaultTrialOfSource(e);if(t){let a=await this.loadTrial(t);return a!=null&&a.id&&this.addTrial(a),a}else return}}});function At(){return ie(He)}export{Dt as Q,At as a,Mt as b,xt as c,Ft as d,Rt as e,Ct as f,_e as g,he as h,dt as i,$t as j,qt as k,Fe as l,St as r,ve as t,bt as u};