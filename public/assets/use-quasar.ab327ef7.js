import{c as re,a as h,h as w,b as J,t as Ie,r as T,f as de,w as O,a4 as Ne,g as U,o as oe,i as ue,a5 as ze,a6 as Le,a7 as ye,J as Qe,n as Y,N as _e,a8 as Ke,W as ae,F as be,a9 as He,aa as Ze,ab as Ue,S as Ae,X as we,O as Ye,ac as fe,v as Ge,ad as Je,ae as We,af as Xe,e as te,l as et,m as tt,ag as Te,ah as at}from"./index.9609a1db.js";import{a as Ve,c as Pe}from"./use-timeout.42355262.js";var Tt=re({name:"QCardSection",props:{tag:{type:String,default:"div"},horizontal:Boolean},setup(e,{slots:t}){const a=h(()=>`q-card__section q-card__section--${e.horizontal===!0?"horiz row no-wrap":"vert"}`);return()=>w(e.tag,{class:a.value},J(t.default))}});let ve,le=0;const P=new Array(256);for(let e=0;e<256;e++)P[e]=(e+256).toString(16).substring(1);const nt=(()=>{const e=typeof crypto!="undefined"?crypto:typeof window!="undefined"?window.crypto||window.msCrypto:void 0;if(e!==void 0){if(e.randomBytes!==void 0)return e.randomBytes;if(e.getRandomValues!==void 0)return t=>{const a=new Uint8Array(t);return e.getRandomValues(a),a}}return t=>{const a=[];for(let n=t;n>0;n--)a.push(Math.floor(Math.random()*256));return a}})(),ke=4096;function me(){(ve===void 0||le+16>ke)&&(le=0,ve=nt(ke));const e=Array.prototype.slice.call(ve,le,le+=16);return e[6]=e[6]&15|64,e[8]=e[8]&63|128,P[e[0]]+P[e[1]]+P[e[2]]+P[e[3]]+"-"+P[e[4]]+P[e[5]]+"-"+P[e[6]]+P[e[7]]+"-"+P[e[8]]+P[e[9]]+"-"+P[e[10]]+P[e[11]]+P[e[12]]+P[e[13]]+P[e[14]]+P[e[15]]}function rt(e){return e==null?null:e}function Me(e,t){return e==null?t===!0?`f_${me()}`:null:e}function ot({getValue:e,required:t=!0}={}){if(Ie.value===!0){const a=e!==void 0?T(rt(e())):T(null);return t===!0&&a.value===null&&de(()=>{a.value=`f_${me()}`}),e!==void 0&&O(e,n=>{a.value=Me(n,t)}),a}return e!==void 0?h(()=>Me(e(),t)):T(`f_${me()}`)}const Ce=/^on[A-Z]/;function lt(){const{attrs:e,vnode:t}=U(),a={listeners:T({}),attributes:T({})};function n(){const u={},c={};for(const f in e)f!=="class"&&f!=="style"&&Ce.test(f)===!1&&(u[f]=e[f]);for(const f in t.props)Ce.test(f)===!0&&(c[f]=t.props[f]);a.attributes.value=u,a.listeners.value=c}return Ne(n),n(),a}function it({validate:e,resetValidation:t,requiresQForm:a}){const n=ue(ze,!1);if(n!==!1){const{props:u,proxy:c}=U();Object.assign(c,{validate:e,resetValidation:t}),O(()=>u.disable,f=>{f===!0?(typeof t=="function"&&t(),n.unbindComponent(c)):n.bindComponent(c)}),de(()=>{u.disable!==!0&&n.bindComponent(c)}),oe(()=>{u.disable!==!0&&n.unbindComponent(c)})}else a===!0&&console.error("Parent QForm not found on useFormChild()!")}const xe=/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/,Se=/^#[0-9a-fA-F]{4}([0-9a-fA-F]{4})?$/,qe=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,ie=/^rgb\(((0|[1-9][\d]?|1[\d]{0,2}|2[\d]?|2[0-4][\d]|25[0-5]),){2}(0|[1-9][\d]?|1[\d]{0,2}|2[\d]?|2[0-4][\d]|25[0-5])\)$/,se=/^rgba\(((0|[1-9][\d]?|1[\d]{0,2}|2[\d]?|2[0-4][\d]|25[0-5]),){2}(0|[1-9][\d]?|1[\d]{0,2}|2[\d]?|2[0-4][\d]|25[0-5]),(0|0\.[0-9]+[1-9]|0\.[1-9]+|1)\)$/,he={date:e=>/^-?[\d]+\/[0-1]\d\/[0-3]\d$/.test(e),time:e=>/^([0-1]?\d|2[0-3]):[0-5]\d$/.test(e),fulltime:e=>/^([0-1]?\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(e),timeOrFulltime:e=>/^([0-1]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(e),email:e=>/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(e),hexColor:e=>xe.test(e),hexaColor:e=>Se.test(e),hexOrHexaColor:e=>qe.test(e),rgbColor:e=>ie.test(e),rgbaColor:e=>se.test(e),rgbOrRgbaColor:e=>ie.test(e)||se.test(e),hexOrRgbColor:e=>xe.test(e)||ie.test(e),hexaOrRgbaColor:e=>Se.test(e)||se.test(e),anyColor:e=>qe.test(e)||ie.test(e)||se.test(e)},st=[!0,!1,"ondemand"],ut={modelValue:{},error:{type:Boolean,default:null},errorMessage:String,noErrorIcon:Boolean,rules:Array,reactiveRules:Boolean,lazyRules:{type:[Boolean,String],default:!1,validator:e=>st.includes(e)}};function ct(e,t){const{props:a,proxy:n}=U(),u=T(!1),c=T(null),f=T(!1);it({validate:I,resetValidation:j});let v=0,M;const C=h(()=>a.rules!==void 0&&a.rules!==null&&a.rules.length!==0),k=h(()=>a.disable!==!0&&C.value===!0&&t.value===!1),g=h(()=>a.error===!0||u.value===!0),H=h(()=>typeof a.errorMessage=="string"&&a.errorMessage.length!==0?a.errorMessage:c.value);O(()=>a.modelValue,()=>{f.value=!0,k.value===!0&&a.lazyRules===!1&&E()});function V(){a.lazyRules!=="ondemand"&&k.value===!0&&f.value===!0&&E()}O(()=>a.reactiveRules,z=>{z===!0?M===void 0&&(M=O(()=>a.rules,V,{immediate:!0,deep:!0})):M!==void 0&&(M(),M=void 0)},{immediate:!0}),O(()=>a.lazyRules,V),O(e,z=>{z===!0?f.value=!0:k.value===!0&&a.lazyRules!=="ondemand"&&E()});function j(){v++,t.value=!1,f.value=!1,u.value=!1,c.value=null,E.cancel()}function I(z=a.modelValue){if(a.disable===!0||C.value===!1)return!0;const $=++v,G=t.value!==!0?()=>{f.value=!0}:()=>{},L=(F,S)=>{F===!0&&G(),u.value=F,c.value=S||null,t.value=!1},N=[];for(let F=0;F<a.rules.length;F++){const S=a.rules[F];let A;if(typeof S=="function"?A=S(z,he):typeof S=="string"&&he[S]!==void 0&&(A=he[S](z)),A===!1||typeof A=="string")return L(!0,A),!1;A!==!0&&A!==void 0&&N.push(A)}return N.length===0?(L(!1),!0):(t.value=!0,Promise.all(N).then(F=>{if(F===void 0||Array.isArray(F)===!1||F.length===0)return $===v&&L(!1),!0;const S=F.find(A=>A===!1||typeof A=="string");return $===v&&L(S!==void 0,S),S===void 0},F=>($===v&&(console.error(F),L(!0)),!1)))}const E=Le(I,0);return oe(()=>{M!==void 0&&M(),E.cancel()}),Object.assign(n,{resetValidation:j,validate:I}),ye(n,"hasError",()=>g.value),{isDirtyModel:f,hasRules:C,hasError:g,errorMessage:H,validate:I,resetValidation:j}}let W=[],ne=[];function Ee(e){ne=ne.filter(t=>t!==e)}function dt(e){Ee(e),ne.push(e)}function Fe(e){Ee(e),ne.length===0&&W.length!==0&&(W[W.length-1](),W=[])}function Be(e){ne.length===0?e():W.push(e)}function ft(e){W=W.filter(t=>t!==e)}function pe(e){return e!=null&&(""+e).length!==0}const vt={...Ve,...ut,label:String,stackLabel:Boolean,hint:String,hideHint:Boolean,prefix:String,suffix:String,labelColor:String,color:String,bgColor:String,filled:Boolean,outlined:Boolean,borderless:Boolean,standout:[Boolean,String],square:Boolean,loading:Boolean,labelSlot:Boolean,bottomSlots:Boolean,hideBottomSpace:Boolean,rounded:Boolean,dense:Boolean,itemAligned:Boolean,counter:Boolean,clearable:Boolean,clearIcon:String,disable:Boolean,readonly:Boolean,autofocus:Boolean,for:String,maxlength:[Number,String]},ht=["update:modelValue","clear","focus","blur","popupShow","popupHide"];function gt({requiredForAttr:e=!0,tagProp:t}={}){const{props:a,proxy:n}=U(),u=Pe(a,n.$q),c=ot({required:e,getValue:()=>a.for});return{requiredForAttr:e,tag:t===!0?h(()=>a.tag):{value:"label"},isDark:u,editable:h(()=>a.disable!==!0&&a.readonly!==!0),innerLoading:T(!1),focused:T(!1),hasPopupOpen:!1,splitAttrs:lt(),targetUid:c,rootRef:T(null),targetRef:T(null),controlRef:T(null)}}function mt(e){const{props:t,emit:a,slots:n,attrs:u,proxy:c}=U(),{$q:f}=c;let v=null;e.hasValue===void 0&&(e.hasValue=h(()=>pe(t.modelValue))),e.emitValue===void 0&&(e.emitValue=o=>{a("update:modelValue",o)}),e.controlEvents===void 0&&(e.controlEvents={onFocusin:i,onFocusout:l}),Object.assign(e,{clearValue:d,onControlFocusin:i,onControlFocusout:l,focus:S}),e.computedCounter===void 0&&(e.computedCounter=h(()=>{if(t.counter!==!1){const o=typeof t.modelValue=="string"||typeof t.modelValue=="number"?(""+t.modelValue).length:Array.isArray(t.modelValue)===!0?t.modelValue.length:0,p=t.maxlength!==void 0?t.maxlength:t.maxValues;return o+(p!==void 0?" / "+p:"")}}));const{isDirtyModel:M,hasRules:C,hasError:k,errorMessage:g,resetValidation:H}=ct(e.focused,e.innerLoading),V=e.floatingLabel!==void 0?h(()=>t.stackLabel===!0||e.focused.value===!0||e.floatingLabel.value===!0):h(()=>t.stackLabel===!0||e.focused.value===!0||e.hasValue.value===!0),j=h(()=>t.bottomSlots===!0||t.hint!==void 0||C.value===!0||t.counter===!0||t.error!==null),I=h(()=>t.filled===!0?"filled":t.outlined===!0?"outlined":t.borderless===!0?"borderless":t.standout?"standout":"standard"),E=h(()=>`q-field row no-wrap items-start q-field--${I.value}`+(e.fieldClass!==void 0?` ${e.fieldClass.value}`:"")+(t.rounded===!0?" q-field--rounded":"")+(t.square===!0?" q-field--square":"")+(V.value===!0?" q-field--float":"")+($.value===!0?" q-field--labeled":"")+(t.dense===!0?" q-field--dense":"")+(t.itemAligned===!0?" q-field--item-aligned q-item-type":"")+(e.isDark.value===!0?" q-field--dark":"")+(e.getControl===void 0?" q-field--auto-height":"")+(e.focused.value===!0?" q-field--focused":"")+(k.value===!0?" q-field--error":"")+(k.value===!0||e.focused.value===!0?" q-field--highlighted":"")+(t.hideBottomSpace!==!0&&j.value===!0?" q-field--with-bottom":"")+(t.disable===!0?" q-field--disabled":t.readonly===!0?" q-field--readonly":"")),z=h(()=>"q-field__control relative-position row no-wrap"+(t.bgColor!==void 0?` bg-${t.bgColor}`:"")+(k.value===!0?" text-negative":typeof t.standout=="string"&&t.standout.length!==0&&e.focused.value===!0?` ${t.standout}`:t.color!==void 0?` text-${t.color}`:"")),$=h(()=>t.labelSlot===!0||t.label!==void 0),G=h(()=>"q-field__label no-pointer-events absolute ellipsis"+(t.labelColor!==void 0&&k.value!==!0?` text-${t.labelColor}`:"")),L=h(()=>({id:e.targetUid.value,editable:e.editable.value,focused:e.focused.value,floatingLabel:V.value,modelValue:t.modelValue,emitValue:e.emitValue})),N=h(()=>{const o={};return e.targetUid.value&&(o.for=e.targetUid.value),t.disable===!0&&(o["aria-disabled"]="true"),o});function F(){const o=document.activeElement;let p=e.targetRef!==void 0&&e.targetRef.value;p&&(o===null||o.id!==e.targetUid.value)&&(p.hasAttribute("tabindex")===!0||(p=p.querySelector("[tabindex]")),p&&p!==o&&p.focus({preventScroll:!0}))}function S(){Be(F)}function A(){ft(F);const o=document.activeElement;o!==null&&e.rootRef.value.contains(o)&&o.blur()}function i(o){v!==null&&(clearTimeout(v),v=null),e.editable.value===!0&&e.focused.value===!1&&(e.focused.value=!0,a("focus",o))}function l(o,p){v!==null&&clearTimeout(v),v=setTimeout(()=>{v=null,!(document.hasFocus()===!0&&(e.hasPopupOpen===!0||e.controlRef===void 0||e.controlRef.value===null||e.controlRef.value.contains(document.activeElement)!==!1))&&(e.focused.value===!0&&(e.focused.value=!1,a("blur",o)),p!==void 0&&p())})}function d(o){Qe(o),f.platform.is.mobile!==!0?(e.targetRef!==void 0&&e.targetRef.value||e.rootRef.value).focus():e.rootRef.value.contains(document.activeElement)===!0&&document.activeElement.blur(),t.type==="file"&&(e.inputRef.value.value=null),a("update:modelValue",null),a("clear",t.modelValue),Y(()=>{const p=M.value;H(),M.value=p})}function s(){const o=[];return n.prepend!==void 0&&o.push(w("div",{class:"q-field__prepend q-field__marginal row no-wrap items-center",key:"prepend",onClick:ae},n.prepend())),o.push(w("div",{class:"q-field__control-container col relative-position row no-wrap q-anchor--skip"},y())),k.value===!0&&t.noErrorIcon===!1&&o.push(q("error",[w(be,{name:f.iconSet.field.error,color:"negative"})])),t.loading===!0||e.innerLoading.value===!0?o.push(q("inner-loading-append",n.loading!==void 0?n.loading():[w(He,{color:t.color})])):t.clearable===!0&&e.hasValue.value===!0&&e.editable.value===!0&&o.push(q("inner-clearable-append",[w(be,{class:"q-field__focusable-action",tag:"button",name:t.clearIcon||f.iconSet.field.clear,tabindex:0,type:"button","aria-hidden":null,role:null,onClick:d})])),n.append!==void 0&&o.push(w("div",{class:"q-field__append q-field__marginal row no-wrap items-center",key:"append",onClick:ae},n.append())),e.getInnerAppend!==void 0&&o.push(q("inner-append",e.getInnerAppend())),e.getControlChild!==void 0&&o.push(e.getControlChild()),o}function y(){const o=[];return t.prefix!==void 0&&t.prefix!==null&&o.push(w("div",{class:"q-field__prefix no-pointer-events row items-center"},t.prefix)),e.getShadowControl!==void 0&&e.hasShadow.value===!0&&o.push(e.getShadowControl()),e.getControl!==void 0?o.push(e.getControl()):n.rawControl!==void 0?o.push(n.rawControl()):n.control!==void 0&&o.push(w("div",{ref:e.targetRef,class:"q-field__native row",tabindex:-1,...e.splitAttrs.attributes.value,"data-autofocus":t.autofocus===!0||void 0},n.control(L.value))),$.value===!0&&o.push(w("div",{class:G.value},J(n.label,t.label))),t.suffix!==void 0&&t.suffix!==null&&o.push(w("div",{class:"q-field__suffix no-pointer-events row items-center"},t.suffix)),o.concat(J(n.default))}function m(){let o,p;k.value===!0?g.value!==null?(o=[w("div",{role:"alert"},g.value)],p=`q--slot-error-${g.value}`):(o=J(n.error),p="q--slot-error"):(t.hideHint!==!0||e.focused.value===!0)&&(t.hint!==void 0?(o=[w("div",t.hint)],p=`q--slot-hint-${t.hint}`):(o=J(n.hint),p="q--slot-hint"));const Q=t.counter===!0||n.counter!==void 0;if(t.hideBottomSpace===!0&&Q===!1&&o===void 0)return;const x=w("div",{key:p,class:"q-field__messages col"},o);return w("div",{class:"q-field__bottom row items-start q-field__bottom--"+(t.hideBottomSpace!==!0?"animated":"stale"),onClick:ae},[t.hideBottomSpace===!0?x:w(Ze,{name:"q-transition--field-message"},()=>x),Q===!0?w("div",{class:"q-field__counter"},n.counter!==void 0?n.counter():e.computedCounter.value):null])}function q(o,p){return p===null?null:w("div",{key:o,class:"q-field__append q-field__marginal row no-wrap items-center q-anchor--skip"},p)}let b=!1;return _e(()=>{b=!0}),Ke(()=>{b===!0&&t.autofocus===!0&&c.focus()}),t.autofocus===!0&&de(()=>{c.focus()}),oe(()=>{v!==null&&clearTimeout(v)}),Object.assign(c,{focus:S,blur:A}),function(){const p=e.getControl===void 0&&n.control===void 0?{...e.splitAttrs.attributes.value,"data-autofocus":t.autofocus===!0||void 0,...N.value}:N.value;return w(e.tag.value,{ref:e.rootRef,class:[E.value,u.class],style:u.style,...p},[n.before!==void 0?w("div",{class:"q-field__before q-field__marginal row no-wrap items-center",onClick:ae},n.before()):null,w("div",{class:"q-field__inner relative-position col self-stretch"},[w("div",{ref:e.controlRef,class:z.value,tabindex:-1,...e.controlEvents},s()),j.value===!0?m():null]),n.after!==void 0?w("div",{class:"q-field__after q-field__marginal row no-wrap items-center",onClick:ae},n.after()):null])}}const De={date:"####/##/##",datetime:"####/##/## ##:##",time:"##:##",fulltime:"##:##:##",phone:"(###) ### - ####",card:"#### #### #### ####"},ce={"#":{pattern:"[\\d]",negate:"[^\\d]"},S:{pattern:"[a-zA-Z]",negate:"[^a-zA-Z]"},N:{pattern:"[0-9a-zA-Z]",negate:"[^0-9a-zA-Z]"},A:{pattern:"[a-zA-Z]",negate:"[^a-zA-Z]",transform:e=>e.toLocaleUpperCase()},a:{pattern:"[a-zA-Z]",negate:"[^a-zA-Z]",transform:e=>e.toLocaleLowerCase()},X:{pattern:"[0-9a-zA-Z]",negate:"[^0-9a-zA-Z]",transform:e=>e.toLocaleUpperCase()},x:{pattern:"[0-9a-zA-Z]",negate:"[^0-9a-zA-Z]",transform:e=>e.toLocaleLowerCase()}},Oe=Object.keys(ce);Oe.forEach(e=>{ce[e].regex=new RegExp(ce[e].pattern)});const pt=new RegExp("\\\\([^.*+?^${}()|([\\]])|([.*+?^${}()|[\\]])|(["+Oe.join("")+"])|(.)","g"),$e=/[.*+?^${}()|[\]\\]/g,R=String.fromCharCode(1),yt={mask:String,reverseFillMask:Boolean,fillMask:[Boolean,String],unmaskedValue:Boolean};function bt(e,t,a,n){let u,c,f,v,M,C;const k=T(null),g=T(V());function H(){return e.autogrow===!0||["textarea","text","search","url","tel","password"].includes(e.type)}O(()=>e.type+e.autogrow,I),O(()=>e.mask,i=>{if(i!==void 0)E(g.value,!0);else{const l=S(g.value);I(),e.modelValue!==l&&t("update:modelValue",l)}}),O(()=>e.fillMask+e.reverseFillMask,()=>{k.value===!0&&E(g.value,!0)}),O(()=>e.unmaskedValue,()=>{k.value===!0&&E(g.value)});function V(){if(I(),k.value===!0){const i=N(S(e.modelValue));return e.fillMask!==!1?A(i):i}return e.modelValue}function j(i){if(i<u.length)return u.slice(-i);let l="",d=u;const s=d.indexOf(R);if(s!==-1){for(let y=i-d.length;y>0;y--)l+=R;d=d.slice(0,s)+l+d.slice(s)}return d}function I(){if(k.value=e.mask!==void 0&&e.mask.length!==0&&H(),k.value===!1){v=void 0,u="",c="";return}const i=De[e.mask]===void 0?e.mask:De[e.mask],l=typeof e.fillMask=="string"&&e.fillMask.length!==0?e.fillMask.slice(0,1):"_",d=l.replace($e,"\\$&"),s=[],y=[],m=[];let q=e.reverseFillMask===!0,b="",o="";i.replace(pt,(_,r,D,Z,K)=>{if(Z!==void 0){const B=ce[Z];m.push(B),o=B.negate,q===!0&&(y.push("(?:"+o+"+)?("+B.pattern+"+)?(?:"+o+"+)?("+B.pattern+"+)?"),q=!1),y.push("(?:"+o+"+)?("+B.pattern+")?")}else if(D!==void 0)b="\\"+(D==="\\"?"":D),m.push(D),s.push("([^"+b+"]+)?"+b+"?");else{const B=r!==void 0?r:K;b=B==="\\"?"\\\\\\\\":B.replace($e,"\\\\$&"),m.push(B),s.push("([^"+b+"]+)?"+b+"?")}});const p=new RegExp("^"+s.join("")+"("+(b===""?".":"[^"+b+"]")+"+)?"+(b===""?"":"["+b+"]*")+"$"),Q=y.length-1,x=y.map((_,r)=>r===0&&e.reverseFillMask===!0?new RegExp("^"+d+"*"+_):r===Q?new RegExp("^"+_+"("+(o===""?".":o)+"+)?"+(e.reverseFillMask===!0?"$":d+"*")):new RegExp("^"+_));f=m,v=_=>{const r=p.exec(e.reverseFillMask===!0?_:_.slice(0,m.length+1));r!==null&&(_=r.slice(1).join(""));const D=[],Z=x.length;for(let K=0,B=_;K<Z;K++){const ee=x[K].exec(B);if(ee===null)break;B=B.slice(ee.shift().length),D.push(...ee)}return D.length!==0?D.join(""):_},u=m.map(_=>typeof _=="string"?_:R).join(""),c=u.split(R).join(l)}function E(i,l,d){const s=n.value,y=s.selectionEnd,m=s.value.length-y,q=S(i);l===!0&&I();const b=N(q),o=e.fillMask!==!1?A(b):b,p=g.value!==o;s.value!==o&&(s.value=o),p===!0&&(g.value=o),document.activeElement===s&&Y(()=>{if(o===c){const x=e.reverseFillMask===!0?c.length:0;s.setSelectionRange(x,x,"forward");return}if(d==="insertFromPaste"&&e.reverseFillMask!==!0){const x=s.selectionEnd;let _=y-1;for(let r=M;r<=_&&r<x;r++)u[r]!==R&&_++;$.right(s,_);return}if(["deleteContentBackward","deleteContentForward"].indexOf(d)!==-1){const x=e.reverseFillMask===!0?y===0?o.length>b.length?1:0:Math.max(0,o.length-(o===c?0:Math.min(b.length,m)+1))+1:y;s.setSelectionRange(x,x,"forward");return}if(e.reverseFillMask===!0)if(p===!0){const x=Math.max(0,o.length-(o===c?0:Math.min(b.length,m+1)));x===1&&y===1?s.setSelectionRange(x,x,"forward"):$.rightReverse(s,x)}else{const x=o.length-m;s.setSelectionRange(x,x,"backward")}else if(p===!0){const x=Math.max(0,u.indexOf(R),Math.min(b.length,y)-1);$.right(s,x)}else{const x=y-1;$.right(s,x)}});const Q=e.unmaskedValue===!0?S(o):o;String(e.modelValue)!==Q&&(e.modelValue!==null||Q!=="")&&a(Q,!0)}function z(i,l,d){const s=N(S(i.value));l=Math.max(0,u.indexOf(R),Math.min(s.length,l)),M=l,i.setSelectionRange(l,d,"forward")}const $={left(i,l){const d=u.slice(l-1).indexOf(R)===-1;let s=Math.max(0,l-1);for(;s>=0;s--)if(u[s]===R){l=s,d===!0&&l++;break}if(s<0&&u[l]!==void 0&&u[l]!==R)return $.right(i,0);l>=0&&i.setSelectionRange(l,l,"backward")},right(i,l){const d=i.value.length;let s=Math.min(d,l+1);for(;s<=d;s++)if(u[s]===R){l=s;break}else u[s-1]===R&&(l=s);if(s>d&&u[l-1]!==void 0&&u[l-1]!==R)return $.left(i,d);i.setSelectionRange(l,l,"forward")},leftReverse(i,l){const d=j(i.value.length);let s=Math.max(0,l-1);for(;s>=0;s--)if(d[s-1]===R){l=s;break}else if(d[s]===R&&(l=s,s===0))break;if(s<0&&d[l]!==void 0&&d[l]!==R)return $.rightReverse(i,0);l>=0&&i.setSelectionRange(l,l,"backward")},rightReverse(i,l){const d=i.value.length,s=j(d),y=s.slice(0,l+1).indexOf(R)===-1;let m=Math.min(d,l+1);for(;m<=d;m++)if(s[m-1]===R){l=m,l>0&&y===!0&&l--;break}if(m>d&&s[l-1]!==void 0&&s[l-1]!==R)return $.leftReverse(i,d);i.setSelectionRange(l,l,"forward")}};function G(i){t("click",i),C=void 0}function L(i){if(t("keydown",i),Ue(i)===!0||i.altKey===!0)return;const l=n.value,d=l.selectionStart,s=l.selectionEnd;if(i.shiftKey||(C=void 0),i.keyCode===37||i.keyCode===39){i.shiftKey&&C===void 0&&(C=l.selectionDirection==="forward"?d:s);const y=$[(i.keyCode===39?"right":"left")+(e.reverseFillMask===!0?"Reverse":"")];if(i.preventDefault(),y(l,C===d?s:d),i.shiftKey){const m=l.selectionStart;l.setSelectionRange(Math.min(C,m),Math.max(C,m),"forward")}}else i.keyCode===8&&e.reverseFillMask!==!0&&d===s?($.left(l,d),l.setSelectionRange(l.selectionStart,s,"backward")):i.keyCode===46&&e.reverseFillMask===!0&&d===s&&($.rightReverse(l,s),l.setSelectionRange(d,l.selectionEnd,"forward"))}function N(i){if(i==null||i==="")return"";if(e.reverseFillMask===!0)return F(i);const l=f;let d=0,s="";for(let y=0;y<l.length;y++){const m=i[d],q=l[y];if(typeof q=="string")s+=q,m===q&&d++;else if(m!==void 0&&q.regex.test(m))s+=q.transform!==void 0?q.transform(m):m,d++;else return s}return s}function F(i){const l=f,d=u.indexOf(R);let s=i.length-1,y="";for(let m=l.length-1;m>=0&&s!==-1;m--){const q=l[m];let b=i[s];if(typeof q=="string")y=q+y,b===q&&s--;else if(b!==void 0&&q.regex.test(b))do y=(q.transform!==void 0?q.transform(b):b)+y,s--,b=i[s];while(d===m&&b!==void 0&&q.regex.test(b));else return y}return y}function S(i){return typeof i!="string"||v===void 0?typeof i=="number"?v(""+i):i:v(i)}function A(i){return c.length-i.length<=0?i:e.reverseFillMask===!0&&i.length!==0?c.slice(0,-i.length)+i:i+c.slice(i.length)}return{innerValue:g,hasMask:k,moveCursorForPaste:z,updateMaskValue:E,onMaskedKeydown:L,onMaskedClick:G}}const wt={name:String};function Vt(e){return h(()=>({type:"hidden",name:e.name,value:e.modelValue}))}function Pt(e={}){return(t,a,n)=>{t[a](w("input",{class:"hidden"+(n||""),...e.value}))}}function kt(e){return h(()=>e.name||e.for)}function Mt(e,t){function a(){const n=e.modelValue;try{const u="DataTransfer"in window?new DataTransfer:"ClipboardEvent"in window?new ClipboardEvent("").clipboardData:void 0;return Object(n)===n&&("length"in n?Array.from(n):[n]).forEach(c=>{u.items.add(c)}),{files:u.files}}catch{return{files:void 0}}}return t===!0?h(()=>{if(e.type==="file")return a()}):h(a)}const Ct=/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/,xt=/[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{2b820}-\u{2ceaf}\uf900-\ufaff\u3300-\u33ff\ufe30-\ufe4f\uf900-\ufaff\u{2f800}-\u{2fa1f}]/u,St=/[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/,qt=/[a-z0-9_ -]$/i;function Ft(e){return function(a){if(a.type==="compositionend"||a.type==="change"){if(a.target.qComposing!==!0)return;a.target.qComposing=!1,e(a)}else a.type==="compositionupdate"&&a.target.qComposing!==!0&&typeof a.data=="string"&&(Ae.is.firefox===!0?qt.test(a.data)===!1:Ct.test(a.data)===!0||xt.test(a.data)===!0||St.test(a.data)===!0)===!0&&(a.target.qComposing=!0)}}var Et=re({name:"QInput",inheritAttrs:!1,props:{...vt,...yt,...wt,modelValue:{required:!1},shadowText:String,type:{type:String,default:"text"},debounce:[String,Number],autogrow:Boolean,inputClass:[Array,String,Object],inputStyle:[Array,String,Object]},emits:[...ht,"paste","change","keydown","click","animationend"],setup(e,{emit:t,attrs:a}){const{proxy:n}=U(),{$q:u}=n,c={};let f=NaN,v,M,C=null,k;const g=T(null),H=kt(e),{innerValue:V,hasMask:j,moveCursorForPaste:I,updateMaskValue:E,onMaskedKeydown:z,onMaskedClick:$}=bt(e,t,b,g),G=Mt(e,!0),L=h(()=>pe(V.value)),N=Ft(m),F=gt(),S=h(()=>e.type==="textarea"||e.autogrow===!0),A=h(()=>S.value===!0||["text","search","url","tel","password"].includes(e.type)),i=h(()=>{const r={...F.splitAttrs.listeners.value,onInput:m,onPaste:y,onChange:p,onBlur:Q,onFocus:we};return r.onCompositionstart=r.onCompositionupdate=r.onCompositionend=N,j.value===!0&&(r.onKeydown=z,r.onClick=$),e.autogrow===!0&&(r.onAnimationend=q),r}),l=h(()=>{const r={tabindex:0,"data-autofocus":e.autofocus===!0||void 0,rows:e.type==="textarea"?6:void 0,"aria-label":e.label,name:H.value,...F.splitAttrs.attributes.value,id:F.targetUid.value,maxlength:e.maxlength,disabled:e.disable===!0,readonly:e.readonly===!0};return S.value===!1&&(r.type=e.type),e.autogrow===!0&&(r.rows=1),r});O(()=>e.type,()=>{g.value&&(g.value.value=e.modelValue)}),O(()=>e.modelValue,r=>{if(j.value===!0){if(M===!0&&(M=!1,String(r)===f))return;E(r)}else V.value!==r&&(V.value=r,e.type==="number"&&c.hasOwnProperty("value")===!0&&(v===!0?v=!1:delete c.value));e.autogrow===!0&&Y(o)}),O(()=>e.autogrow,r=>{r===!0?Y(o):g.value!==null&&a.rows>0&&(g.value.style.height="auto")}),O(()=>e.dense,()=>{e.autogrow===!0&&Y(o)});function d(){Be(()=>{const r=document.activeElement;g.value!==null&&g.value!==r&&(r===null||r.id!==F.targetUid.value)&&g.value.focus({preventScroll:!0})})}function s(){g.value!==null&&g.value.select()}function y(r){if(j.value===!0&&e.reverseFillMask!==!0){const D=r.target;I(D,D.selectionStart,D.selectionEnd)}t("paste",r)}function m(r){if(!r||!r.target)return;if(e.type==="file"){t("update:modelValue",r.target.files);return}const D=r.target.value;if(r.target.qComposing===!0){c.value=D;return}if(j.value===!0)E(D,!1,r.inputType);else if(b(D),A.value===!0&&r.target===document.activeElement){const{selectionStart:Z,selectionEnd:K}=r.target;Z!==void 0&&K!==void 0&&Y(()=>{r.target===document.activeElement&&D.indexOf(r.target.value)===0&&r.target.setSelectionRange(Z,K)})}e.autogrow===!0&&o()}function q(r){t("animationend",r),o()}function b(r,D){k=()=>{C=null,e.type!=="number"&&c.hasOwnProperty("value")===!0&&delete c.value,e.modelValue!==r&&f!==r&&(f=r,D===!0&&(M=!0),t("update:modelValue",r),Y(()=>{f===r&&(f=NaN)})),k=void 0},e.type==="number"&&(v=!0,c.value=r),e.debounce!==void 0?(C!==null&&clearTimeout(C),c.value=r,C=setTimeout(k,e.debounce)):k()}function o(){requestAnimationFrame(()=>{const r=g.value;if(r!==null){const D=r.parentNode.style,{scrollTop:Z}=r,{overflowY:K,maxHeight:B}=u.platform.is.firefox===!0?{}:window.getComputedStyle(r),ee=K!==void 0&&K!=="scroll";ee===!0&&(r.style.overflowY="hidden"),D.marginBottom=r.scrollHeight-1+"px",r.style.height="1px",r.style.height=r.scrollHeight+"px",ee===!0&&(r.style.overflowY=parseInt(B,10)<r.scrollHeight?"auto":"hidden"),D.marginBottom="",r.scrollTop=Z}})}function p(r){N(r),C!==null&&(clearTimeout(C),C=null),k!==void 0&&k(),t("change",r.target.value)}function Q(r){r!==void 0&&we(r),C!==null&&(clearTimeout(C),C=null),k!==void 0&&k(),v=!1,M=!1,delete c.value,e.type!=="file"&&setTimeout(()=>{g.value!==null&&(g.value.value=V.value!==void 0?V.value:"")})}function x(){return c.hasOwnProperty("value")===!0?c.value:V.value!==void 0?V.value:""}oe(()=>{Q()}),de(()=>{e.autogrow===!0&&o()}),Object.assign(F,{innerValue:V,fieldClass:h(()=>`q-${S.value===!0?"textarea":"input"}`+(e.autogrow===!0?" q-textarea--autogrow":"")),hasShadow:h(()=>e.type!=="file"&&typeof e.shadowText=="string"&&e.shadowText.length!==0),inputRef:g,emitValue:b,hasValue:L,floatingLabel:h(()=>L.value===!0&&(e.type!=="number"||isNaN(V.value)===!1)||pe(e.displayValue)),getControl:()=>w(S.value===!0?"textarea":"input",{ref:g,class:["q-field__native q-placeholder",e.inputClass],style:e.inputStyle,...l.value,...i.value,...e.type!=="file"?{value:x()}:G.value}),getShadowControl:()=>w("div",{class:"q-field__native q-field__shadow absolute-bottom no-pointer-events"+(S.value===!0?"":" text-no-wrap")},[w("span",{class:"invisible"},x()),w("span",e.shadowText)])});const _=mt(F);return Object.assign(n,{focus:d,select:s,getNativeElement:()=>g.value}),ye(n,"nativeEl",()=>g.value),_}}),Bt=re({name:"QCard",props:{...Ve,tag:{type:String,default:"div"},square:Boolean,flat:Boolean,bordered:Boolean},setup(e,{slots:t}){const{proxy:{$q:a}}=U(),n=Pe(e,a),u=h(()=>"q-card"+(n.value===!0?" q-card--dark q-dark":"")+(e.bordered===!0?" q-card--bordered":"")+(e.square===!0?" q-card--square no-border-radius":"")+(e.flat===!0?" q-card--flat no-shadow":""));return()=>w(e.tag,{class:u.value},J(t.default))}});function Ot(){let e;const t=U();function a(){e=void 0}return _e(a),oe(a),{removeTick:a,registerTick(n){e=n,Y(()=>{e===n&&(Ye(t)===!1&&e(),e=void 0)})}}}const jt={transitionShow:{type:String,default:"fade"},transitionHide:{type:String,default:"fade"},transitionDuration:{type:[String,Number],default:300}};function It(e,t=()=>{},a=()=>{}){return{transitionProps:h(()=>{const n=`q-transition--${e.transitionShow||t()}`,u=`q-transition--${e.transitionHide||a()}`;return{appear:!0,enterFromClass:`${n}-enter-from`,enterActiveClass:`${n}-enter-active`,enterToClass:`${n}-enter-to`,leaveFromClass:`${u}-leave-from`,leaveActiveClass:`${u}-leave-active`,leaveToClass:`${u}-leave-to`}}),transitionStyle:h(()=>`--q-transition-duration: ${e.transitionDuration}ms`)}}const ge=[];function Nt(e,t){do{if(e.$options.name==="QMenu"){if(e.hide(t),e.$props.separateClosePopup===!0)return fe(e)}else if(e.__qPortal===!0){const a=fe(e);return a!==void 0&&a.$options.name==="QPopupProxy"?(e.hide(t),a):e}e=fe(e)}while(e!=null)}const Dt=re({name:"QPortal",setup(e,{slots:t}){return()=>t.default()}});function $t(e){for(e=e.parent;e!=null;){if(e.type.name==="QGlobalDialog")return!0;if(e.type.name==="QDialog"||e.type.name==="QMenu")return!1;e=e.parent}return!1}function zt(e,t,a,n){const u=T(!1),c=T(!1);let f=null;const v={},M=n==="dialog"&&$t(e);function C(g){if(g===!0){Fe(v),c.value=!0;return}c.value=!1,u.value===!1&&(M===!1&&f===null&&(f=We(!1,n)),u.value=!0,ge.push(e.proxy),dt(v))}function k(g){if(c.value=!1,g!==!0)return;Fe(v),u.value=!1;const H=ge.indexOf(e.proxy);H!==-1&&ge.splice(H,1),f!==null&&(Xe(f),f=null)}return Ge(()=>{k(!0)}),e.proxy.__qPortal=!0,ye(e.proxy,"contentEl",()=>t.value),{showPortal:C,hidePortal:k,portalIsActive:u,portalIsAccessible:c,renderPortal:()=>M===!0?a():u.value===!0?[w(Je,{to:f},w(Dt,a))]:void 0}}const X=[];function je(e){X[X.length-1](e)}function Lt(e){Ae.is.desktop===!0&&(X.push(e),X.length===1&&document.body.addEventListener("focusin",je))}function Qt(e){const t=X.indexOf(e);t!==-1&&(X.splice(t,1),X.length===0&&document.body.removeEventListener("focusin",je))}var Kt=re({name:"QPage",props:{padding:Boolean,styleFn:Function},setup(e,{slots:t}){const{proxy:{$q:a}}=U(),n=ue(et,te);if(n===te)return console.error("QPage needs to be a deep child of QLayout"),te;if(ue(tt,te)===te)return console.error("QPage needs to be child of QPageContainer"),te;const c=h(()=>{const v=(n.header.space===!0?n.header.size:0)+(n.footer.space===!0?n.footer.size:0);if(typeof e.styleFn=="function"){const M=n.isContainer.value===!0?n.containerHeight.value:a.screen.height;return e.styleFn(v,M)}return{minHeight:n.isContainer.value===!0?n.containerHeight.value-v+"px":a.screen.height===0?v!==0?`calc(100vh - ${v}px)`:"100vh":a.screen.height-v+"px"}}),f=h(()=>`q-page${e.padding===!0?" q-layout-padding":""}`);return()=>w("main",{class:f.value,style:c.value},J(t.default))}});const Re=Te("datasets",{state:()=>({trialItemData:new Map,trialCircuitData:new Map,trialPollutionData:new Map,trialSystemData:new Map,count:0,queue:[]}),getters:{},actions:{smoothData(e,t){let a=[];if(typeof t=="number"&&!Number.isInteger(t))t=Number.parseInt(t.toFixed(0));else throw new Error("Invalid smoothing value");if(t>=1&&e.length>=t)for(let n=0;n<e.length-t+1;n++){const f=e.slice(n,n+t).reduce((v,M)=>v+M.y,0)/t;a.push({x:e[n+Math.floor(t/2)].x,y:f})}else a=e;return a},smoothXYData(e,t,a){let n=[],u=[];if(Number.isInteger(a)||(a=Number.parseInt(a.toFixed(0))),e.length!=t.length)if(t.length<e.length){const c=e.length-t.length;for(let f=0;f<c;f++)t.unshift(0)}else throw new Error("Y data is longer than X - something is wrong!");if(a>=1&&t.length>=a){for(let c=0;c<t.length-a+1;c++){const M=t.slice(c,c+a).reduce((C,k)=>C+k,0)/a;n.push(e[c+Math.floor(a/2)]),u.push(M)}return{x:n,y:u}}else return{x:e,y:t}},smoothYData(e,t){let a=[];if(Number.isInteger(t)||(t=Number.parseInt(t.toFixed(0))),t>1&&e.length>=t)for(let n=0;n<e.length-t+1;n++){const f=e.slice(n,n+t).reduce((v,M)=>v+M,0)/t;a.push(f)}else a=e;return a},async loadDataset(e,t){switch(t){case"item":if(this.trialItemData.has(e))return this.trialItemData.get(e);break;case"circuit":if(this.trialCircuitData.has(e))return this.trialCircuitData.get(e);break;case"pollution":if(this.trialPollutionData.has(e))return this.trialPollutionData.get(e);break;case"system":if(this.trialSystemData.has(e))return this.trialSystemData.get(e);break}const n=await Rt().queryData(e,`data_${t}`);if(n){switch(t){case"item":this.trialItemData.set(e,n);break;case"circuit":this.trialCircuitData.set(e,n);break;case"pollution":this.trialPollutionData.set(e,n);break;case"system":this.trialSystemData.set(e,n);break}if(this.count=this.queue.unshift(`${e}_${t}`),this.queue&&this.count>20){const[u,c]=this.queue.pop().split("_");switch(c){case"item":this.trialItemData.delete(u);break;case"circuit":this.trialCircuitData.delete(u);break;case"pollution":this.trialPollutionData.delete(u);break;case"system":this.trialSystemData.delete(u);break}}}return n},clearDataset(e){this.trialItemData.delete(e),this.trialCircuitData.delete(e),this.trialPollutionData.delete(e),this.trialSystemData.delete(e)},async clearAllDatasets(){this.trialItemData.clear(),this.trialCircuitData.clear(),this.trialPollutionData.clear(),this.trialSystemData.clear()}}}),Rt=Te("public",{state:()=>({trialMap:new Map,sourceMap:new Map,trialList:[],maxTrials:5,devMode:!1}),getters:{},actions:{addTrial(e){if(e&&(e==null?void 0:e.id)){if(this.trialList.length>=5){let t=this.trialList.pop();t&&this.removeTrial(t)}this.trialList.unshift(e.id),this.trialMap.set(e.id,e)}else throw new Error("Invalid trial object")},removeTrial(e){const t=this.trialMap.get(e);t!=null&&t.source&&this.sourceMap.delete(t.source),this.trialMap.delete(e),Re().clearDataset(e)},addSource(e){if(e&&(e==null?void 0:e.id)){if(this.sourceMap.size>=5){const t=Array.from(this.sourceMap.keys());this.sourceMap.delete(t[0])}this.sourceMap.set(e.id,e)}else throw new Error("Invalid source object")},async loadSource(e){if(this.sourceMap.has(e))return this.sourceMap.get(e);const t=await this.querySource(e);return this.addSource(t),t},async loadTrial(e){const t=await this.queryTrial(e);if(t!=null&&t.itemMetadata){const a=Object.entries(t.itemMetadata.avg).map(([u,c])=>({key:u,value:c})),n=Object.entries(t.itemMetadata.total).map(([u,c])=>({key:u,value:c}));t.itemMetadata={avg:a,total:n}}return t!=null&&t.systemMetadata&&(t.systemMetadata=Object.entries(t.systemMetadata.min).map(([a,n])=>{const u=t.systemMetadata.avg[a],c=t.systemMetadata.max[a];return{key:a,min:n,avg:u,max:c}})),this.addTrial(t),t},async clearStorage(){this.trialMap.clear(),this.sourceMap.clear(),await Re().clearAllDatasets()},async queryExecutionStatus(e){const t=await fetch(`${this.devMode===!0?"/api":""}/query/${e}/status`);if(t.status!==404)return await t.json()},async querySource(e){const t=await fetch(`${this.devMode===!0?"/api":""}/query/${e}/source`);if(t.status!==404)return await t.json()},async queryModlist(e){const t=await fetch(`${this.devMode===!0?"/api":""}/query/${e}/modlist`);if(t.status!==404)return await t.json()},async queryTrial(e){const t=await fetch(`${this.devMode===!0?"/api":""}/query/${e}/trial`);if(t.status!==404)return await t.json()},async queryData(e,t="data_all"){const a=await fetch(`${this.devMode===!0?"/api":""}/query/${e}/${t}`);if(a.status!==404)return await a.json()},async queryLargestTrialOfSource(e){return await(await fetch(`${this.devMode===!0?"/api":""}/analysis/largestTrialForSource/${e}`)).json()},async queryDefaultTrialOfSource(e){return await(await fetch(`${this.devMode===!0?"/api":""}/analysis/defaultTrialForSource/${e}`)).text()},async checkSource(e){return await(await fetch(`${this.devMode===!0?"/api":""}/check/${e}`)).json()},async submitSource(e){return await(await fetch(`${this.devMode===!0?"/api":""}/submit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({variant:"source",source:e})})).json()},async submitTrial(e){return await(await fetch(`${this.devMode===!0?"/api":""}/submit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({variant:"trial",trial:e})})).json()},async submitQuickSource(e){return await(await fetch(`${this.devMode===!0?"/api":""}/quickSubmit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({blueprintStr:e})})).json()},async loadDefaultTrialForSource(e){const t=await this.queryDefaultTrialOfSource(e);if(t){let a=await this.loadTrial(t);return a!=null&&a.id&&this.addTrial(a),a}else return}}});function Ht(){return ue(at)}export{Ft as A,ge as B,Kt as Q,Ht as a,Tt as b,Et as c,Bt as d,jt as e,Ot as f,It as g,zt as h,Be as i,Lt as j,me as k,ot as l,Re as m,wt as n,Pt as o,Vt as p,vt as q,Qt as r,ht as s,he as t,Rt as u,mt as v,gt as w,Nt as x,kt as y,pe as z};
