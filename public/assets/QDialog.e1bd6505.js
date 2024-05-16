import{I as le,S as ae,c as se,r as _,a as r,w as L,o as ue,h as g,aa as O,b as re,g as ce,ai as de}from"./index.9609a1db.js";import{u as fe,a as me}from"./use-prevent-scroll.299c9723.js";import{u as ge,b as ve,d as he,e as ye}from"./use-timeout.42355262.js";import{e as be,f as ke,g as xe,h as we,i as qe,r as $,j as Be}from"./use-quasar.ab327ef7.js";const a=[];let c;function Se(e){c=e.keyCode===27}function Ee(){c===!0&&(c=!1)}function Te(e){c===!0&&(c=!1,le(e,27)===!0&&a[a.length-1](e))}function A(e){window[e]("keydown",Se),window[e]("blur",Ee),window[e]("keyup",Te),c=!1}function _e(e){ae.is.desktop===!0&&(a.push(e),a.length===1&&A("addEventListener"))}function I(e){const v=a.indexOf(e);v!==-1&&(a.splice(v,1),a.length===0&&A("removeEventListener"))}let k=0;const Ce={standard:"fixed-full flex-center",top:"fixed-top justify-center",bottom:"fixed-bottom justify-center",right:"fixed-right items-center",left:"fixed-left items-center"},j={standard:["scale","scale"],top:["slide-down","slide-up"],bottom:["slide-up","slide-down"],right:["slide-left","slide-right"],left:["slide-right","slide-left"]};var He=se({name:"QDialog",inheritAttrs:!1,props:{...ge,...be,transitionShow:String,transitionHide:String,persistent:Boolean,autoClose:Boolean,allowFocusOutside:Boolean,noEscDismiss:Boolean,noBackdropDismiss:Boolean,noRouteDismiss:Boolean,noRefocus:Boolean,noFocus:Boolean,noShake:Boolean,seamless:Boolean,maximized:Boolean,fullWidth:Boolean,fullHeight:Boolean,square:Boolean,backdropFilter:String,position:{type:String,default:"standard",validator:e=>e==="standard"||["top","bottom","left","right"].includes(e)}},emits:[...ve,"shake","click","escapeKey"],setup(e,{slots:v,emit:d,attrs:C}){const x=ce(),i=_(null),s=_(!1),f=_(!1);let n=null,l=null,h,w;const F=r(()=>e.persistent!==!0&&e.noRouteDismiss!==!0&&e.seamless!==!0),{preventBodyScroll:D}=me(),{registerTimeout:p}=he(),{registerTick:Q,removeTick:z}=ke(),{transitionProps:V,transitionStyle:H}=xe(e,()=>j[e.position][0],()=>j[e.position][1]),W=r(()=>H.value+(e.backdropFilter!==void 0?`;backdrop-filter:${e.backdropFilter};-webkit-backdrop-filter:${e.backdropFilter}`:"")),{showPortal:M,hidePortal:P,portalIsAccessible:U,renderPortal:G}=we(x,i,ne,"dialog"),{hide:y}=ye({showing:s,hideOnRouteChange:F,handleShow:ee,handleHide:te,processOnMount:!0}),{addToHistory:J,removeFromHistory:N}=fe(s,y,F),X=r(()=>`q-dialog__inner flex no-pointer-events q-dialog__inner--${e.maximized===!0?"maximized":"minimized"} q-dialog__inner--${e.position} ${Ce[e.position]}`+(f.value===!0?" q-dialog__inner--animating":"")+(e.fullWidth===!0?" q-dialog__inner--fullwidth":"")+(e.fullHeight===!0?" q-dialog__inner--fullheight":"")+(e.square===!0?" q-dialog__inner--square":"")),b=r(()=>s.value===!0&&e.seamless!==!0),Y=r(()=>e.autoClose===!0?{onClick:oe}:{}),Z=r(()=>[`q-dialog fullscreen no-pointer-events q-dialog--${b.value===!0?"modal":"seamless"}`,C.class]);L(()=>e.maximized,t=>{s.value===!0&&S(t)}),L(b,t=>{D(t),t===!0?(Be(E),_e(B)):($(E),I(B))});function ee(t){J(),l=e.noRefocus===!1&&document.activeElement!==null?document.activeElement:null,S(e.maximized),M(),f.value=!0,e.noFocus!==!0?(document.activeElement!==null&&document.activeElement.blur(),Q(m)):z(),p(()=>{if(x.proxy.$q.platform.is.ios===!0){if(e.seamless!==!0&&document.activeElement){const{top:o,bottom:u}=document.activeElement.getBoundingClientRect(),{innerHeight:R}=window,T=window.visualViewport!==void 0?window.visualViewport.height:R;o>0&&u>T/2&&(document.scrollingElement.scrollTop=Math.min(document.scrollingElement.scrollHeight-T,u>=R?1/0:Math.ceil(document.scrollingElement.scrollTop+u-T/2))),document.activeElement.scrollIntoView()}w=!0,i.value.click(),w=!1}M(!0),f.value=!1,d("show",t)},e.transitionDuration)}function te(t){z(),N(),K(!0),f.value=!0,P(),l!==null&&(((t&&t.type.indexOf("key")===0?l.closest('[tabindex]:not([tabindex^="-"])'):void 0)||l).focus(),l=null),p(()=>{P(!0),f.value=!1,d("hide",t)},e.transitionDuration)}function m(t){qe(()=>{let o=i.value;if(o!==null){if(t!==void 0){const u=o.querySelector(t);if(u!==null){u.focus({preventScroll:!0});return}}o.contains(document.activeElement)!==!0&&(o=o.querySelector("[autofocus][tabindex], [data-autofocus][tabindex]")||o.querySelector("[autofocus] [tabindex], [data-autofocus] [tabindex]")||o.querySelector("[autofocus], [data-autofocus]")||o,o.focus({preventScroll:!0}))}})}function q(t){t&&typeof t.focus=="function"?t.focus({preventScroll:!0}):m(),d("shake");const o=i.value;o!==null&&(o.classList.remove("q-animate--scale"),o.classList.add("q-animate--scale"),n!==null&&clearTimeout(n),n=setTimeout(()=>{n=null,i.value!==null&&(o.classList.remove("q-animate--scale"),m())},170))}function B(){e.seamless!==!0&&(e.persistent===!0||e.noEscDismiss===!0?e.maximized!==!0&&e.noShake!==!0&&q():(d("escapeKey"),y()))}function K(t){n!==null&&(clearTimeout(n),n=null),(t===!0||s.value===!0)&&(S(!1),e.seamless!==!0&&(D(!1),$(E),I(B))),t!==!0&&(l=null)}function S(t){t===!0?h!==!0&&(k<1&&document.body.classList.add("q-body--dialog"),k++,h=!0):h===!0&&(k<2&&document.body.classList.remove("q-body--dialog"),k--,h=!1)}function oe(t){w!==!0&&(y(t),d("click",t))}function ie(t){e.persistent!==!0&&e.noBackdropDismiss!==!0?y(t):e.noShake!==!0&&q()}function E(t){e.allowFocusOutside!==!0&&U.value===!0&&de(i.value,t.target)!==!0&&m('[tabindex]:not([tabindex="-1"])')}Object.assign(x.proxy,{focus:m,shake:q,__updateRefocusTarget(t){l=t||null}}),ue(K);function ne(){return g("div",{role:"dialog","aria-modal":b.value===!0?"true":"false",...C,class:Z.value},[g(O,{name:"q-transition--fade",appear:!0},()=>b.value===!0?g("div",{class:"q-dialog__backdrop fixed-full",style:W.value,"aria-hidden":"true",tabindex:-1,onClick:ie}):null),g(O,V.value,()=>s.value===!0?g("div",{ref:i,class:X.value,style:H.value,tabindex:-1,...Y.value},re(v.default)):null)])}return G}});export{He as Q,_e as a,I as r};
