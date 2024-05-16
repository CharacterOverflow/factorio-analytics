import{c as _,a as r,h as q,b as C,G as V,H as I,r as E,I as M,J as H,d as W,g as x,w as B,K as N,f as P,n as S,L as Q,M as T,N as A,o as D,O as K}from"./index.9609a1db.js";var $=_({name:"QItemSection",props:{avatar:Boolean,thumbnail:Boolean,side:Boolean,top:Boolean,noWrap:Boolean},setup(e,{slots:o}){const n=r(()=>`q-item__section column q-item__section--${e.avatar===!0||e.side===!0||e.thumbnail===!0?"side":"main"}`+(e.top===!0?" q-item__section--top justify-start":" justify-center")+(e.avatar===!0?" q-item__section--avatar":"")+(e.thumbnail===!0?" q-item__section--thumbnail":"")+(e.noWrap===!0?" q-item__section--nowrap":""));return()=>q("div",{class:n.value},C(o.default))}}),F=_({name:"QItemLabel",props:{overline:Boolean,caption:Boolean,header:Boolean,lines:[Number,String]},setup(e,{slots:o}){const n=r(()=>parseInt(e.lines,10)),a=r(()=>"q-item__label"+(e.overline===!0?" q-item__label--overline text-overline":"")+(e.caption===!0?" q-item__label--caption text-caption":"")+(e.header===!0?" q-item__label--header":"")+(n.value===1?" ellipsis":"")),c=r(()=>e.lines!==void 0&&n.value>1?{overflow:"hidden",display:"-webkit-box","-webkit-box-orient":"vertical","-webkit-line-clamp":n.value}:null);return()=>q("div",{style:c.value,class:a.value},C(o.default))}});const O={dark:{type:Boolean,default:null}};function U(e,o){return r(()=>e.dark===null?o.dark.isActive:e.dark)}var z=_({name:"QItem",props:{...O,...V,tag:{type:String,default:"div"},active:{type:Boolean,default:null},clickable:Boolean,dense:Boolean,insetLevel:Number,tabindex:[String,Number],focused:Boolean,manualFocus:Boolean},emits:["click","keyup"],setup(e,{slots:o,emit:n}){const{proxy:{$q:a}}=x(),c=U(e,a),{hasLink:b,linkAttrs:h,linkClass:i,linkTag:s,navigateOnClick:w}=I(),u=E(null),f=E(null),m=r(()=>e.clickable===!0||b.value===!0||e.tag==="label"),d=r(()=>e.disable!==!0&&m.value===!0),v=r(()=>"q-item q-item-type row no-wrap"+(e.dense===!0?" q-item--dense":"")+(c.value===!0?" q-item--dark":"")+(b.value===!0&&e.active===null?i.value:e.active===!0?` q-item--active${e.activeClass!==void 0?` ${e.activeClass}`:""}`:"")+(e.disable===!0?" disabled":"")+(d.value===!0?" q-item--clickable q-link cursor-pointer "+(e.manualFocus===!0?"q-manual-focusable":"q-focusable q-hoverable")+(e.focused===!0?" q-manual-focusable--focused":""):"")),g=r(()=>{if(e.insetLevel===void 0)return null;const l=a.lang.rtl===!0?"Right":"Left";return{["padding"+l]:16+e.insetLevel*56+"px"}});function y(l){d.value===!0&&(f.value!==null&&(l.qKeyEvent!==!0&&document.activeElement===u.value?f.value.focus():document.activeElement===f.value&&u.value.focus()),w(l))}function p(l){if(d.value===!0&&M(l,[13,32])===!0){H(l),l.qKeyEvent=!0;const L=new MouseEvent("click",l);L.qKeyEvent=!0,u.value.dispatchEvent(L)}n("keyup",l)}function t(){const l=W(o.default,[]);return d.value===!0&&l.unshift(q("div",{class:"q-focus-helper",tabindex:-1,ref:f})),l}return()=>{const l={ref:u,class:v.value,style:g.value,role:"listitem",onClick:y,onKeyup:p};return d.value===!0?(l.tabindex=e.tabindex||"0",Object.assign(l,h.value)):m.value===!0&&(l["aria-disabled"]="true"),q(s.value,l,t())}}});const X={modelValue:{type:Boolean,default:null},"onUpdate:modelValue":[Function,Array]},Y=["beforeShow","show","beforeHide","hide"];function G({showing:e,canShow:o,hideOnRouteChange:n,handleShow:a,handleHide:c,processOnMount:b}){const h=x(),{props:i,emit:s,proxy:w}=h;let u;function f(t){e.value===!0?v(t):m(t)}function m(t){if(i.disable===!0||t!==void 0&&t.qAnchorHandled===!0||o!==void 0&&o(t)!==!0)return;const l=i["onUpdate:modelValue"]!==void 0;l===!0&&(s("update:modelValue",!0),u=t,S(()=>{u===t&&(u=void 0)})),(i.modelValue===null||l===!1)&&d(t)}function d(t){e.value!==!0&&(e.value=!0,s("beforeShow",t),a!==void 0?a(t):s("show",t))}function v(t){if(i.disable===!0)return;const l=i["onUpdate:modelValue"]!==void 0;l===!0&&(s("update:modelValue",!1),u=t,S(()=>{u===t&&(u=void 0)})),(i.modelValue===null||l===!1)&&g(t)}function g(t){e.value!==!1&&(e.value=!1,s("beforeHide",t),c!==void 0?c(t):s("hide",t))}function y(t){i.disable===!0&&t===!0?i["onUpdate:modelValue"]!==void 0&&s("update:modelValue",!1):t===!0!==e.value&&(t===!0?d:g)(u)}B(()=>i.modelValue,y),n!==void 0&&N(h)===!0&&B(()=>w.$route.fullPath,()=>{n.value===!0&&e.value===!0&&v()}),b===!0&&P(()=>{y(i.modelValue)});const p={show:m,hide:v,toggle:f};return Object.assign(w,p),p}const j=[null,document,document.body,document.scrollingElement,document.documentElement];function J(e,o){let n=Q(o);if(n===void 0){if(e==null)return window;n=e.closest(".scroll,.scroll-y,.overflow-auto")}return j.includes(n)?window:n}function Z(e){return e===window?window.pageYOffset||window.scrollY||document.body.scrollTop||0:e.scrollTop}function ee(e){return e===window?window.pageXOffset||window.scrollX||document.body.scrollLeft||0:e.scrollLeft}let k;function te(){if(k!==void 0)return k;const e=document.createElement("p"),o=document.createElement("div");T(e,{width:"100%",height:"200px"}),T(o,{position:"absolute",top:"0px",left:"0px",visibility:"hidden",width:"200px",height:"150px",overflow:"hidden"}),o.appendChild(e),document.body.appendChild(o);const n=e.offsetWidth;o.style.overflow="scroll";let a=e.offsetWidth;return n===a&&(a=o.clientWidth),o.remove(),k=n-a,k}function le(e,o=!0){return!e||e.nodeType!==Node.ELEMENT_NODE?!1:o?e.scrollHeight>e.clientHeight&&(e.classList.contains("scroll")||e.classList.contains("overflow-auto")||["auto","scroll"].includes(window.getComputedStyle(e)["overflow-y"])):e.scrollWidth>e.clientWidth&&(e.classList.contains("scroll")||e.classList.contains("overflow-auto")||["auto","scroll"].includes(window.getComputedStyle(e)["overflow-x"]))}function oe(){let e=null;const o=x();function n(){e!==null&&(clearTimeout(e),e=null)}return A(n),D(n),{removeTimeout:n,registerTimeout(a,c){n(),K(o)===!1&&(e=setTimeout(()=>{e=null,a()},c))}}}export{z as Q,O as a,Y as b,U as c,oe as d,G as e,Z as f,J as g,ee as h,te as i,$ as j,F as k,le as l,X as u};
