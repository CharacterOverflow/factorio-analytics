import{r as oe,t as ie,f as S,c as re,o as H,q as J,n as P,h as ne,g as D,s as w,L as k,w as N,M as se,N as le,O as U,P as p,K as ee,R as ue,S as ae,T as de,U as ce,V as fe,W as ve,X as T,Y as z,Z as B,_ as V,$ as Y,a0 as M}from"./index.b769df83.js";function pe(){const t=oe(!ie.value);return t.value===!1&&S(()=>{t.value=!0}),{isHydrated:t}}const te=typeof ResizeObserver!="undefined",F=te===!0?{}:{style:"display:block;position:absolute;top:0;left:0;right:0;bottom:0;height:100%;width:100%;overflow:hidden;pointer-events:none;z-index:-1;",url:"about:blank"};var He=re({name:"QResizeObserver",props:{debounce:{type:[String,Number],default:100}},emits:["resize"],setup(t,{emit:o}){let r=null,n,e={width:-1,height:-1};function i(u){u===!0||t.debounce===0||t.debounce==="0"?s():r===null&&(r=setTimeout(s,t.debounce))}function s(){if(r!==null&&(clearTimeout(r),r=null),n){const{offsetWidth:u,offsetHeight:l}=n;(u!==e.width||l!==e.height)&&(e={width:u,height:l},o("resize",e))}}const{proxy:a}=D();if(a.trigger=i,te===!0){let u;const l=c=>{n=a.$el.parentNode,n?(u=new ResizeObserver(i),u.observe(n),s()):c!==!0&&P(()=>{l(!0)})};return S(()=>{l()}),H(()=>{r!==null&&clearTimeout(r),u!==void 0&&(u.disconnect!==void 0?u.disconnect():n&&u.unobserve(n))}),J}else{let c=function(){r!==null&&(clearTimeout(r),r=null),l!==void 0&&(l.removeEventListener!==void 0&&l.removeEventListener("resize",i,w.passive),l=void 0)},f=function(){c(),n&&n.contentDocument&&(l=n.contentDocument.defaultView,l.addEventListener("resize",i,w.passive),s())};const{isHydrated:u}=pe();let l;return S(()=>{P(()=>{n=a.$el,n&&f()})}),H(c),()=>{if(u.value===!0)return ne("object",{class:"q--avoid-card-border",style:F.style,tabindex:-1,type:"text/html",data:F.url,"aria-hidden":"true",onLoad:f})}}}});function Pe(t,o,r){let n;function e(){n!==void 0&&(k.remove(n),n=void 0)}return H(()=>{t.value===!0&&e()}),{removeFromHistory:e,addToHistory(){n={condition:()=>r.value===!0,handler:o},k.add(n)}}}const ze={modelValue:{type:Boolean,default:null},"onUpdate:modelValue":[Function,Array]},Ve=["beforeShow","show","beforeHide","hide"];function Me({showing:t,canShow:o,hideOnRouteChange:r,handleShow:n,handleHide:e,processOnMount:i}){const s=D(),{props:a,emit:u,proxy:l}=s;let c;function f(d){t.value===!0?h(d):m(d)}function m(d){if(a.disable===!0||d!==void 0&&d.qAnchorHandled===!0||o!==void 0&&o(d)!==!0)return;const g=a["onUpdate:modelValue"]!==void 0;g===!0&&(u("update:modelValue",!0),c=d,P(()=>{c===d&&(c=void 0)})),(a.modelValue===null||g===!1)&&v(d)}function v(d){t.value!==!0&&(t.value=!0,u("beforeShow",d),n!==void 0?n(d):u("show",d))}function h(d){if(a.disable===!0)return;const g=a["onUpdate:modelValue"]!==void 0;g===!0&&(u("update:modelValue",!1),c=d,P(()=>{c===d&&(c=void 0)})),(a.modelValue===null||g===!1)&&b(d)}function b(d){t.value!==!1&&(t.value=!1,u("beforeHide",d),e!==void 0?e(d):u("hide",d))}function _(d){a.disable===!0&&d===!0?a["onUpdate:modelValue"]!==void 0&&u("update:modelValue",!1):d===!0!==t.value&&(d===!0?v:b)(c)}N(()=>a.modelValue,_),r!==void 0&&se(s)===!0&&N(()=>l.$route.fullPath,()=>{r.value===!0&&t.value===!0&&h()}),i===!0&&S(()=>{_(a.modelValue)});const R={show:m,hide:h,toggle:f};return Object.assign(l,R),R}const me=[null,document,document.body,document.scrollingElement,document.documentElement];function xe(t,o){let r=le(o);if(r===void 0){if(t==null)return window;r=t.closest(".scroll,.scroll-y,.overflow-auto")}return me.includes(r)?window:r}function he(t){return t===window?window.pageYOffset||window.scrollY||document.body.scrollTop||0:t.scrollTop}function we(t){return t===window?window.pageXOffset||window.scrollX||document.body.scrollLeft||0:t.scrollLeft}let L;function Oe(){if(L!==void 0)return L;const t=document.createElement("p"),o=document.createElement("div");U(t,{width:"100%",height:"200px"}),U(o,{position:"absolute",top:"0px",left:"0px",visibility:"hidden",width:"200px",height:"150px",overflow:"hidden"}),o.appendChild(t),document.body.appendChild(o);const r=t.offsetWidth;o.style.overflow="scroll";let n=t.offsetWidth;return r===n&&(n=o.clientWidth),o.remove(),L=r-n,L}function ye(t,o=!0){return!t||t.nodeType!==Node.ELEMENT_NODE?!1:o?t.scrollHeight>t.clientHeight&&(t.classList.contains("scroll")||t.classList.contains("overflow-auto")||["auto","scroll"].includes(window.getComputedStyle(t)["overflow-y"])):t.scrollWidth>t.clientWidth&&(t.classList.contains("scroll")||t.classList.contains("overflow-auto")||["auto","scroll"].includes(window.getComputedStyle(t)["overflow-x"]))}let E=0,x,O,C,X=!1,$,j,K,y=null;function ge(t){be(t)&&ee(t)}function be(t){if(t.target===document.body||t.target.classList.contains("q-layout__backdrop"))return!0;const o=ue(t),r=t.shiftKey&&!t.deltaX,n=!r&&Math.abs(t.deltaX)<=Math.abs(t.deltaY),e=r||n?t.deltaY:t.deltaX;for(let i=0;i<o.length;i++){const s=o[i];if(ye(s,n))return n?e<0&&s.scrollTop===0?!0:e>0&&s.scrollTop+s.clientHeight===s.scrollHeight:e<0&&s.scrollLeft===0?!0:e>0&&s.scrollLeft+s.clientWidth===s.scrollWidth}return!0}function I(t){t.target===document&&(document.scrollingElement.scrollTop=document.scrollingElement.scrollTop)}function q(t){X!==!0&&(X=!0,requestAnimationFrame(()=>{X=!1;const{height:o}=t.target,{clientHeight:r,scrollTop:n}=document.scrollingElement;(C===void 0||o!==window.innerHeight)&&(C=r-o,document.scrollingElement.scrollTop=n),n>C&&(document.scrollingElement.scrollTop-=Math.ceil((n-C)/8))}))}function Q(t){const o=document.body,r=window.visualViewport!==void 0;if(t==="add"){const{overflowY:n,overflowX:e}=window.getComputedStyle(o);x=we(window),O=he(window),$=o.style.left,j=o.style.top,K=window.location.href,o.style.left=`-${x}px`,o.style.top=`-${O}px`,e!=="hidden"&&(e==="scroll"||o.scrollWidth>window.innerWidth)&&o.classList.add("q-body--force-scrollbar-x"),n!=="hidden"&&(n==="scroll"||o.scrollHeight>window.innerHeight)&&o.classList.add("q-body--force-scrollbar-y"),o.classList.add("q-body--prevent-scroll"),document.qScrollPrevented=!0,p.is.ios===!0&&(r===!0?(window.scrollTo(0,0),window.visualViewport.addEventListener("resize",q,w.passiveCapture),window.visualViewport.addEventListener("scroll",q,w.passiveCapture),window.scrollTo(0,0)):window.addEventListener("scroll",I,w.passiveCapture))}p.is.desktop===!0&&p.is.mac===!0&&window[`${t}EventListener`]("wheel",ge,w.notPassive),t==="remove"&&(p.is.ios===!0&&(r===!0?(window.visualViewport.removeEventListener("resize",q,w.passiveCapture),window.visualViewport.removeEventListener("scroll",q,w.passiveCapture)):window.removeEventListener("scroll",I,w.passiveCapture)),o.classList.remove("q-body--prevent-scroll"),o.classList.remove("q-body--force-scrollbar-x"),o.classList.remove("q-body--force-scrollbar-y"),document.qScrollPrevented=!1,o.style.left=$,o.style.top=j,window.location.href===K&&window.scrollTo(x,O),C=void 0)}function Ee(t){let o="add";if(t===!0){if(E++,y!==null){clearTimeout(y),y=null;return}if(E>1)return}else{if(E===0||(E--,E>0))return;if(o="remove",p.is.ios===!0&&p.is.nativeMobile===!0){y!==null&&clearTimeout(y),y=setTimeout(()=>{Q(o),y=null},100);return}}Q(o)}function Xe(){let t;return{preventBodyScroll(o){o!==t&&(t!==void 0||o===!0)&&(t=o,Ee(o))}}}function Ae(){let t=null;const o=D();function r(){t!==null&&(clearTimeout(t),t=null)}return ae(r),H(r),{removeTimeout:r,registerTimeout(n,e){r(),de(o)===!1&&(t=setTimeout(()=>{t=null,n()},e))}}}const W={left:!0,right:!0,up:!0,down:!0,horizontal:!0,vertical:!0},Ce=Object.keys(W);W.all=!0;function Z(t){const o={};for(const r of Ce)t[r]===!0&&(o[r]=!0);return Object.keys(o).length===0?W:(o.horizontal===!0?o.left=o.right=!0:o.left===!0&&o.right===!0&&(o.horizontal=!0),o.vertical===!0?o.up=o.down=!0:o.up===!0&&o.down===!0&&(o.vertical=!0),o.horizontal===!0&&o.vertical===!0&&(o.all=!0),o)}const Te=["INPUT","TEXTAREA"];function G(t,o){return o.event===void 0&&t.target!==void 0&&t.target.draggable!==!0&&typeof o.handler=="function"&&Te.includes(t.target.nodeName.toUpperCase())===!1&&(t.qClonedBy===void 0||t.qClonedBy.indexOf(o.uid)===-1)}function Le(){if(window.getSelection!==void 0){const t=window.getSelection();t.empty!==void 0?t.empty():t.removeAllRanges!==void 0&&(t.removeAllRanges(),ce.is.mobile!==!0&&t.addRange(document.createRange()))}else document.selection!==void 0&&document.selection.empty()}function A(t,o,r){const n=Y(t);let e,i=n.left-o.event.x,s=n.top-o.event.y,a=Math.abs(i),u=Math.abs(s);const l=o.direction;l.horizontal===!0&&l.vertical!==!0?e=i<0?"left":"right":l.horizontal!==!0&&l.vertical===!0?e=s<0?"up":"down":l.up===!0&&s<0?(e="up",a>u&&(l.left===!0&&i<0?e="left":l.right===!0&&i>0&&(e="right"))):l.down===!0&&s>0?(e="down",a>u&&(l.left===!0&&i<0?e="left":l.right===!0&&i>0&&(e="right"))):l.left===!0&&i<0?(e="left",a<u&&(l.up===!0&&s<0?e="up":l.down===!0&&s>0&&(e="down"))):l.right===!0&&i>0&&(e="right",a<u&&(l.up===!0&&s<0?e="up":l.down===!0&&s>0&&(e="down")));let c=!1;if(e===void 0&&r===!1){if(o.event.isFirst===!0||o.event.lastDir===void 0)return{};e=o.event.lastDir,c=!0,e==="left"||e==="right"?(n.left-=i,a=0,i=0):(n.top-=s,u=0,s=0)}return{synthetic:c,payload:{evt:t,touch:o.event.mouse!==!0,mouse:o.event.mouse===!0,position:n,direction:e,isFirst:o.event.isFirst,isFinal:r===!0,duration:Date.now()-o.event.time,distance:{x:a,y:u},offset:{x:i,y:s},delta:{x:n.left-o.event.lastX,y:n.top-o.event.lastY}}}}let qe=0;var Ye=fe({name:"touch-pan",beforeMount(t,{value:o,modifiers:r}){if(r.mouse!==!0&&p.has.touch!==!0)return;function n(i,s){r.mouse===!0&&s===!0?ee(i):(r.stop===!0&&V(i),r.prevent===!0&&B(i))}const e={uid:"qvtp_"+qe++,handler:o,modifiers:r,direction:Z(r),noop:J,mouseStart(i){G(i,e)&&ve(i)&&(T(e,"temp",[[document,"mousemove","move","notPassiveCapture"],[document,"mouseup","end","passiveCapture"]]),e.start(i,!0))},touchStart(i){if(G(i,e)){const s=i.target;T(e,"temp",[[s,"touchmove","move","notPassiveCapture"],[s,"touchcancel","end","passiveCapture"],[s,"touchend","end","passiveCapture"]]),e.start(i)}},start(i,s){if(p.is.firefox===!0&&z(t,!0),e.lastEvt=i,s===!0||r.stop===!0){if(e.direction.all!==!0&&(s!==!0||e.modifiers.mouseAllDir!==!0&&e.modifiers.mousealldir!==!0)){const l=i.type.indexOf("mouse")!==-1?new MouseEvent(i.type,i):new TouchEvent(i.type,i);i.defaultPrevented===!0&&B(l),i.cancelBubble===!0&&V(l),Object.assign(l,{qKeyEvent:i.qKeyEvent,qClickOutside:i.qClickOutside,qAnchorHandled:i.qAnchorHandled,qClonedBy:i.qClonedBy===void 0?[e.uid]:i.qClonedBy.concat(e.uid)}),e.initialEvent={target:i.target,event:l}}V(i)}const{left:a,top:u}=Y(i);e.event={x:a,y:u,time:Date.now(),mouse:s===!0,detected:!1,isFirst:!0,isFinal:!1,lastX:a,lastY:u}},move(i){if(e.event===void 0)return;const s=Y(i),a=s.left-e.event.x,u=s.top-e.event.y;if(a===0&&u===0)return;e.lastEvt=i;const l=e.event.mouse===!0,c=()=>{n(i,l);let v;r.preserveCursor!==!0&&r.preservecursor!==!0&&(v=document.documentElement.style.cursor||"",document.documentElement.style.cursor="grabbing"),l===!0&&document.body.classList.add("no-pointer-events--children"),document.body.classList.add("non-selectable"),Le(),e.styleCleanup=h=>{if(e.styleCleanup=void 0,v!==void 0&&(document.documentElement.style.cursor=v),document.body.classList.remove("non-selectable"),l===!0){const b=()=>{document.body.classList.remove("no-pointer-events--children")};h!==void 0?setTimeout(()=>{b(),h()},50):b()}else h!==void 0&&h()}};if(e.event.detected===!0){e.event.isFirst!==!0&&n(i,e.event.mouse);const{payload:v,synthetic:h}=A(i,e,!1);v!==void 0&&(e.handler(v)===!1?e.end(i):(e.styleCleanup===void 0&&e.event.isFirst===!0&&c(),e.event.lastX=v.position.left,e.event.lastY=v.position.top,e.event.lastDir=h===!0?void 0:v.direction,e.event.isFirst=!1));return}if(e.direction.all===!0||l===!0&&(e.modifiers.mouseAllDir===!0||e.modifiers.mousealldir===!0)){c(),e.event.detected=!0,e.move(i);return}const f=Math.abs(a),m=Math.abs(u);f!==m&&(e.direction.horizontal===!0&&f>m||e.direction.vertical===!0&&f<m||e.direction.up===!0&&f<m&&u<0||e.direction.down===!0&&f<m&&u>0||e.direction.left===!0&&f>m&&a<0||e.direction.right===!0&&f>m&&a>0?(e.event.detected=!0,e.move(i)):e.end(i,!0))},end(i,s){if(e.event!==void 0){if(M(e,"temp"),p.is.firefox===!0&&z(t,!1),s===!0)e.styleCleanup!==void 0&&e.styleCleanup(),e.event.detected!==!0&&e.initialEvent!==void 0&&e.initialEvent.target.dispatchEvent(e.initialEvent.event);else if(e.event.detected===!0){e.event.isFirst===!0&&e.handler(A(i===void 0?e.lastEvt:i,e).payload);const{payload:a}=A(i===void 0?e.lastEvt:i,e,!0),u=()=>{e.handler(a)};e.styleCleanup!==void 0?e.styleCleanup(u):u()}e.event=void 0,e.initialEvent=void 0,e.lastEvt=void 0}}};if(t.__qtouchpan=e,r.mouse===!0){const i=r.mouseCapture===!0||r.mousecapture===!0?"Capture":"";T(e,"main",[[t,"mousedown","mouseStart",`passive${i}`]])}p.has.touch===!0&&T(e,"main",[[t,"touchstart","touchStart",`passive${r.capture===!0?"Capture":""}`],[t,"touchmove","noop","notPassiveCapture"]])},updated(t,o){const r=t.__qtouchpan;r!==void 0&&(o.oldValue!==o.value&&(typeof value!="function"&&r.end(),r.handler=o.value),r.direction=Z(o.modifiers))},beforeUnmount(t){const o=t.__qtouchpan;o!==void 0&&(o.event!==void 0&&o.end(),M(o,"main"),M(o,"temp"),p.is.firefox===!0&&z(t,!1),o.styleCleanup!==void 0&&o.styleCleanup(),delete t.__qtouchpan)}});function De(t,o,r){return r<=o?o:Math.min(r,Math.max(o,t))}export{He as Q,Ye as T,Ve as a,Ae as b,Me as c,Pe as d,Xe as e,De as f,xe as g,he as h,we as i,Oe as j,Le as k,Z as l,G as s,ze as u};