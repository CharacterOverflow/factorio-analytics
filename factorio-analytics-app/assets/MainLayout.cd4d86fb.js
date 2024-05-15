import{c as W,a as n,h as x,b as J,e as O,r as T,w as h,o as se,d as We,i as ce,l as Y,g as N,f as qe,n as me,j as Ae,k as ge,p as Te,m as Fe,q as Re,s as Ie,t as Ne,u as U,v as Ee,x as je,y as Ue,z as Ke,A as Xe,B as Ge,C as q,D as w,Q as Je,E as K,F as be}from"./index.44f017ac.js";import{Q as ue,T as ie,b as X}from"./format.623babcb.js";import{u as Ye,a as Ze,b as et,c as tt,d as at,e as lt,g as ot,f as nt,h as it,i as re,Q as ye,j as G,k as we}from"./use-timeout.3233f37d.js";import{Q as rt}from"./selection.6e4f22c5.js";import{u as ut,a as st}from"./use-prevent-scroll.cd94f801.js";var xe=W({name:"QToolbarTitle",props:{shrink:Boolean},setup(e,{slots:m}){const i=n(()=>"q-toolbar__title ellipsis"+(e.shrink===!0?" col-shrink":""));return()=>x("div",{class:i.value},J(m.default))}}),ct=W({name:"QToolbar",props:{inset:Boolean},setup(e,{slots:m}){const i=n(()=>"q-toolbar row no-wrap items-center"+(e.inset===!0?" q-toolbar--inset":""));return()=>x("div",{class:i.value,role:"toolbar"},J(m.default))}}),dt=W({name:"QHeader",props:{modelValue:{type:Boolean,default:!0},reveal:Boolean,revealOffset:{type:Number,default:250},bordered:Boolean,elevated:Boolean,heightHint:{type:[String,Number],default:50}},emits:["reveal","focusin"],setup(e,{slots:m,emit:i}){const{proxy:{$q:r}}=N(),l=ce(Y,O);if(l===O)return console.error("QHeader needs to be child of QLayout"),O;const c=T(parseInt(e.heightHint,10)),g=T(!0),_=n(()=>e.reveal===!0||l.view.value.indexOf("H")!==-1||r.platform.is.ios&&l.isContainer.value===!0),z=n(()=>{if(e.modelValue!==!0)return 0;if(_.value===!0)return g.value===!0?c.value:0;const o=c.value-l.scroll.value.position;return o>0?o:0}),b=n(()=>e.modelValue!==!0||_.value===!0&&g.value!==!0),a=n(()=>e.modelValue===!0&&b.value===!0&&e.reveal===!0),L=n(()=>"q-header q-layout__section--marginal "+(_.value===!0?"fixed":"absolute")+"-top"+(e.bordered===!0?" q-header--bordered":"")+(b.value===!0?" q-header--hidden":"")+(e.modelValue!==!0?" q-layout--prevent-focus":"")),S=n(()=>{const o=l.rows.value.top,k={};return o[0]==="l"&&l.left.space===!0&&(k[r.lang.rtl===!0?"right":"left"]=`${l.left.size}px`),o[2]==="r"&&l.right.space===!0&&(k[r.lang.rtl===!0?"left":"right"]=`${l.right.size}px`),k});function d(o,k){l.update("header",o,k)}function f(o,k){o.value!==k&&(o.value=k)}function Q({height:o}){f(c,o),d("size",o)}function p(o){a.value===!0&&f(g,!0),i("focusin",o)}h(()=>e.modelValue,o=>{d("space",o),f(g,!0),l.animate()}),h(z,o=>{d("offset",o)}),h(()=>e.reveal,o=>{o===!1&&f(g,e.modelValue)}),h(g,o=>{l.animate(),i("reveal",o)}),h(l.scroll,o=>{e.reveal===!0&&f(g,o.direction==="up"||o.position<=e.revealOffset||o.position-o.inflectionPoint<100)});const v={};return l.instances.header=v,e.modelValue===!0&&d("size",c.value),d("space",e.modelValue),d("offset",z.value),se(()=>{l.instances.header===v&&(l.instances.header=void 0,d("size",0),d("offset",0),d("space",!1))}),()=>{const o=We(m.default,[]);return e.elevated===!0&&o.push(x("div",{class:"q-layout__shadow absolute-full overflow-hidden no-pointer-events"})),o.push(x(ue,{debounce:0,onResize:Q})),x("header",{class:L.value,style:S.value,onFocusin:p},o)}}});const Se=150;var ft=W({name:"QDrawer",inheritAttrs:!1,props:{...Ye,...Ze,side:{type:String,default:"left",validator:e=>["left","right"].includes(e)},width:{type:Number,default:300},mini:Boolean,miniToOverlay:Boolean,miniWidth:{type:Number,default:57},noMiniAnimation:Boolean,breakpoint:{type:Number,default:1023},showIfAbove:Boolean,behavior:{type:String,validator:e=>["default","desktop","mobile"].includes(e),default:"default"},bordered:Boolean,elevated:Boolean,overlay:Boolean,persistent:Boolean,noSwipeOpen:Boolean,noSwipeClose:Boolean,noSwipeBackdrop:Boolean},emits:[...et,"onLayout","miniState"],setup(e,{slots:m,emit:i,attrs:r}){const l=N(),{proxy:{$q:c}}=l,g=tt(e,c),{preventBodyScroll:_}=st(),{registerTimeout:z,removeTimeout:b}=at(),a=ce(Y,O);if(a===O)return console.error("QDrawer needs to be child of QLayout"),O;let L,S=null,d;const f=T(e.behavior==="mobile"||e.behavior!=="desktop"&&a.totalWidth.value<=e.breakpoint),Q=n(()=>e.mini===!0&&f.value!==!0),p=n(()=>Q.value===!0?e.miniWidth:e.width),v=T(e.showIfAbove===!0&&f.value===!1?!0:e.modelValue===!0),o=n(()=>e.persistent!==!0&&(f.value===!0||ke.value===!0));function k(t,u){if(M(),t!==!1&&a.animate(),B(0),f.value===!0){const C=a.instances[E.value];C!==void 0&&C.belowBreakpoint===!0&&C.hide(!1),H(1),a.isContainer.value!==!0&&_(!0)}else H(0),t!==!1&&le(!1);z(()=>{t!==!1&&le(!0),u!==!0&&i("show",t)},Se)}function s(t,u){R(),t!==!1&&a.animate(),H(0),B(A.value*p.value),oe(),u!==!0?z(()=>{i("hide",t)},Se):b()}const{show:y,hide:$}=lt({showing:v,hideOnRouteChange:o,handleShow:k,handleHide:s}),{addToHistory:M,removeFromHistory:R}=ut(v,$,o),D={belowBreakpoint:f,hide:$},P=n(()=>e.side==="right"),A=n(()=>(c.lang.rtl===!0?-1:1)*(P.value===!0?1:-1)),de=T(0),F=T(!1),Z=T(!1),fe=T(p.value*A.value),E=n(()=>P.value===!0?"left":"right"),ee=n(()=>v.value===!0&&f.value===!1&&e.overlay===!1?e.miniToOverlay===!0?e.miniWidth:p.value:0),te=n(()=>e.overlay===!0||e.miniToOverlay===!0||a.view.value.indexOf(P.value?"R":"L")!==-1||c.platform.is.ios===!0&&a.isContainer.value===!0),I=n(()=>e.overlay===!1&&v.value===!0&&f.value===!1),ke=n(()=>e.overlay===!0&&v.value===!0&&f.value===!1),Ce=n(()=>"fullscreen q-drawer__backdrop"+(v.value===!1&&F.value===!1?" hidden":"")),_e=n(()=>({backgroundColor:`rgba(0,0,0,${de.value*.4})`})),ve=n(()=>P.value===!0?a.rows.value.top[2]==="r":a.rows.value.top[0]==="l"),ze=n(()=>P.value===!0?a.rows.value.bottom[2]==="r":a.rows.value.bottom[0]==="l"),$e=n(()=>{const t={};return a.header.space===!0&&ve.value===!1&&(te.value===!0?t.top=`${a.header.offset}px`:a.header.space===!0&&(t.top=`${a.header.size}px`)),a.footer.space===!0&&ze.value===!1&&(te.value===!0?t.bottom=`${a.footer.offset}px`:a.footer.space===!0&&(t.bottom=`${a.footer.size}px`)),t}),Le=n(()=>{const t={width:`${p.value}px`,transform:`translateX(${fe.value}px)`};return f.value===!0?t:Object.assign(t,$e.value)}),Be=n(()=>"q-drawer__content fit "+(a.isContainer.value!==!0?"scroll":"overflow-auto")),Qe=n(()=>`q-drawer q-drawer--${e.side}`+(Z.value===!0?" q-drawer--mini-animate":"")+(e.bordered===!0?" q-drawer--bordered":"")+(g.value===!0?" q-drawer--dark q-dark":"")+(F.value===!0?" no-transition":v.value===!0?"":" q-layout--prevent-focus")+(f.value===!0?" fixed q-drawer--on-top q-drawer--mobile q-drawer--top-padding":` q-drawer--${Q.value===!0?"mini":"standard"}`+(te.value===!0||I.value!==!0?" fixed":"")+(e.overlay===!0||e.miniToOverlay===!0?" q-drawer--on-top":"")+(ve.value===!0?" q-drawer--top-padding":""))),Pe=n(()=>{const t=c.lang.rtl===!0?e.side:E.value;return[[ie,Me,void 0,{[t]:!0,mouse:!0}]]}),Oe=n(()=>{const t=c.lang.rtl===!0?E.value:e.side;return[[ie,he,void 0,{[t]:!0,mouse:!0}]]}),He=n(()=>{const t=c.lang.rtl===!0?E.value:e.side;return[[ie,he,void 0,{[t]:!0,mouse:!0,mouseAllDir:!0}]]});function ae(){De(f,e.behavior==="mobile"||e.behavior!=="desktop"&&a.totalWidth.value<=e.breakpoint)}h(f,t=>{t===!0?(L=v.value,v.value===!0&&$(!1)):e.overlay===!1&&e.behavior!=="mobile"&&L!==!1&&(v.value===!0?(B(0),H(0),oe()):y(!1))}),h(()=>e.side,(t,u)=>{a.instances[u]===D&&(a.instances[u]=void 0,a[u].space=!1,a[u].offset=0),a.instances[t]=D,a[t].size=p.value,a[t].space=I.value,a[t].offset=ee.value}),h(a.totalWidth,()=>{(a.isContainer.value===!0||document.qScrollPrevented!==!0)&&ae()}),h(()=>e.behavior+e.breakpoint,ae),h(a.isContainer,t=>{v.value===!0&&_(t!==!0),t===!0&&ae()}),h(a.scrollbarWidth,()=>{B(v.value===!0?0:void 0)}),h(ee,t=>{V("offset",t)}),h(I,t=>{i("onLayout",t),V("space",t)}),h(P,()=>{B()}),h(p,t=>{B(),ne(e.miniToOverlay,t)}),h(()=>e.miniToOverlay,t=>{ne(t,p.value)}),h(()=>c.lang.rtl,()=>{B()}),h(()=>e.mini,()=>{e.noMiniAnimation||e.modelValue===!0&&(Ve(),a.animate())}),h(Q,t=>{i("miniState",t)});function B(t){t===void 0?me(()=>{t=v.value===!0?0:p.value,B(A.value*t)}):(a.isContainer.value===!0&&P.value===!0&&(f.value===!0||Math.abs(t)===p.value)&&(t+=A.value*a.scrollbarWidth.value),fe.value=t)}function H(t){de.value=t}function le(t){const u=t===!0?"remove":a.isContainer.value!==!0?"add":"";u!==""&&document.body.classList[u]("q-body--drawer-toggle")}function Ve(){S!==null&&clearTimeout(S),l.proxy&&l.proxy.$el&&l.proxy.$el.classList.add("q-drawer--mini-animate"),Z.value=!0,S=setTimeout(()=>{S=null,Z.value=!1,l&&l.proxy&&l.proxy.$el&&l.proxy.$el.classList.remove("q-drawer--mini-animate")},150)}function Me(t){if(v.value!==!1)return;const u=p.value,C=X(t.distance.x,0,u);if(t.isFinal===!0){C>=Math.min(75,u)===!0?y():(a.animate(),H(0),B(A.value*u)),F.value=!1;return}B((c.lang.rtl===!0?P.value!==!0:P.value)?Math.max(u-C,0):Math.min(0,C-u)),H(X(C/u,0,1)),t.isFirst===!0&&(F.value=!0)}function he(t){if(v.value!==!0)return;const u=p.value,C=t.direction===e.side,j=(c.lang.rtl===!0?C!==!0:C)?X(t.distance.x,0,u):0;if(t.isFinal===!0){Math.abs(j)<Math.min(75,u)===!0?(a.animate(),H(1),B(0)):$(),F.value=!1;return}B(A.value*j),H(X(1-j/u,0,1)),t.isFirst===!0&&(F.value=!0)}function oe(){_(!1),le(!0)}function V(t,u){a.update(e.side,t,u)}function De(t,u){t.value!==u&&(t.value=u)}function ne(t,u){V("size",t===!0?e.miniWidth:u)}return a.instances[e.side]=D,ne(e.miniToOverlay,p.value),V("space",I.value),V("offset",ee.value),e.showIfAbove===!0&&e.modelValue!==!0&&v.value===!0&&e["onUpdate:modelValue"]!==void 0&&i("update:modelValue",!0),qe(()=>{i("onLayout",I.value),i("miniState",Q.value),L=e.showIfAbove===!0;const t=()=>{(v.value===!0?k:s)(!1,!0)};if(a.totalWidth.value!==0){me(t);return}d=h(a.totalWidth,()=>{d(),d=void 0,v.value===!1&&e.showIfAbove===!0&&f.value===!1?y(!1):t()})}),se(()=>{d!==void 0&&d(),S!==null&&(clearTimeout(S),S=null),v.value===!0&&oe(),a.instances[e.side]===D&&(a.instances[e.side]=void 0,V("size",0),V("offset",0),V("space",!1))}),()=>{const t=[];f.value===!0&&(e.noSwipeOpen===!1&&t.push(Ae(x("div",{key:"open",class:`q-drawer__opener fixed-${e.side}`,"aria-hidden":"true"}),Pe.value)),t.push(ge("div",{ref:"backdrop",class:Ce.value,style:_e.value,"aria-hidden":"true",onClick:$},void 0,"backdrop",e.noSwipeBackdrop!==!0&&v.value===!0,()=>He.value)));const u=Q.value===!0&&m.mini!==void 0,C=[x("div",{...r,key:""+u,class:[Be.value,r.class]},u===!0?m.mini():J(m.default))];return e.elevated===!0&&v.value===!0&&C.push(x("div",{class:"q-layout__shadow absolute-full overflow-hidden no-pointer-events"})),t.push(ge("aside",{ref:"content",class:Qe.value,style:Le.value},C,"contentclose",e.noSwipeClose!==!0&&f.value===!0,()=>Oe.value)),x("div",{class:"q-drawer-container"},t)}}}),vt=W({name:"QPageContainer",setup(e,{slots:m}){const{proxy:{$q:i}}=N(),r=ce(Y,O);if(r===O)return console.error("QPageContainer needs to be child of QLayout"),O;Te(Fe,!0);const l=n(()=>{const c={};return r.header.space===!0&&(c.paddingTop=`${r.header.size}px`),r.right.space===!0&&(c[`padding${i.lang.rtl===!0?"Left":"Right"}`]=`${r.right.size}px`),r.footer.space===!0&&(c.paddingBottom=`${r.footer.size}px`),r.left.space===!0&&(c[`padding${i.lang.rtl===!0?"Right":"Left"}`]=`${r.left.size}px`),c});return()=>x("div",{class:"q-page-container",style:l.value},J(m.default))}});const{passive:pe}=Ie,ht=["both","horizontal","vertical"];var mt=W({name:"QScrollObserver",props:{axis:{type:String,validator:e=>ht.includes(e),default:"vertical"},debounce:[String,Number],scrollTarget:{default:void 0}},emits:["scroll"],setup(e,{emit:m}){const i={position:{top:0,left:0},direction:"down",directionChanged:!1,delta:{top:0,left:0},inflectionPoint:{top:0,left:0}};let r=null,l,c;h(()=>e.scrollTarget,()=>{z(),_()});function g(){r!==null&&r();const L=Math.max(0,nt(l)),S=it(l),d={top:L-i.position.top,left:S-i.position.left};if(e.axis==="vertical"&&d.top===0||e.axis==="horizontal"&&d.left===0)return;const f=Math.abs(d.top)>=Math.abs(d.left)?d.top<0?"up":"down":d.left<0?"left":"right";i.position={top:L,left:S},i.directionChanged=i.direction!==f,i.delta=d,i.directionChanged===!0&&(i.direction=f,i.inflectionPoint=i.position),m("scroll",{...i})}function _(){l=ot(c,e.scrollTarget),l.addEventListener("scroll",b,pe),b(!0)}function z(){l!==void 0&&(l.removeEventListener("scroll",b,pe),l=void 0)}function b(L){if(L===!0||e.debounce===0||e.debounce==="0")g();else if(r===null){const[S,d]=e.debounce?[setTimeout(g,e.debounce),clearTimeout]:[requestAnimationFrame(g),cancelAnimationFrame];r=()=>{d(S),r=null}}}const{proxy:a}=N();return h(()=>a.$q.lang.rtl,g),qe(()=>{c=a.$el.parentNode,_()}),se(()=>{r!==null&&r(),z()}),Object.assign(a,{trigger:b,getPosition:()=>i}),Re}}),gt=W({name:"QLayout",props:{container:Boolean,view:{type:String,default:"hhh lpr fff",validator:e=>/^(h|l)h(h|r) lpr (f|l)f(f|r)$/.test(e.toLowerCase())},onScroll:Function,onScrollHeight:Function,onResize:Function},setup(e,{slots:m,emit:i}){const{proxy:{$q:r}}=N(),l=T(null),c=T(r.screen.height),g=T(e.container===!0?0:r.screen.width),_=T({position:0,direction:"down",inflectionPoint:0}),z=T(0),b=T(Ne.value===!0?0:re()),a=n(()=>"q-layout q-layout--"+(e.container===!0?"containerized":"standard")),L=n(()=>e.container===!1?{minHeight:r.screen.height+"px"}:null),S=n(()=>b.value!==0?{[r.lang.rtl===!0?"left":"right"]:`${b.value}px`}:null),d=n(()=>b.value!==0?{[r.lang.rtl===!0?"right":"left"]:0,[r.lang.rtl===!0?"left":"right"]:`-${b.value}px`,width:`calc(100% + ${b.value}px)`}:null);function f(s){if(e.container===!0||document.qScrollPrevented!==!0){const y={position:s.position.top,direction:s.direction,directionChanged:s.directionChanged,inflectionPoint:s.inflectionPoint.top,delta:s.delta.top};_.value=y,e.onScroll!==void 0&&i("scroll",y)}}function Q(s){const{height:y,width:$}=s;let M=!1;c.value!==y&&(M=!0,c.value=y,e.onScrollHeight!==void 0&&i("scrollHeight",y),v()),g.value!==$&&(M=!0,g.value=$),M===!0&&e.onResize!==void 0&&i("resize",s)}function p({height:s}){z.value!==s&&(z.value=s,v())}function v(){if(e.container===!0){const s=c.value>z.value?re():0;b.value!==s&&(b.value=s)}}let o=null;const k={instances:{},view:n(()=>e.view),isContainer:n(()=>e.container),rootRef:l,height:c,containerHeight:z,scrollbarWidth:b,totalWidth:n(()=>g.value+b.value),rows:n(()=>{const s=e.view.toLowerCase().split(" ");return{top:s[0].split(""),middle:s[1].split(""),bottom:s[2].split("")}}),header:U({size:0,offset:0,space:!1}),right:U({size:300,offset:0,space:!1}),footer:U({size:0,offset:0,space:!1}),left:U({size:300,offset:0,space:!1}),scroll:_,animate(){o!==null?clearTimeout(o):document.body.classList.add("q-body--layout-animate"),o=setTimeout(()=>{o=null,document.body.classList.remove("q-body--layout-animate")},155)},update(s,y,$){k[s][y]=$}};if(Te(Y,k),re()>0){let $=function(){s=null,y.classList.remove("hide-scrollbar")},M=function(){if(s===null){if(y.scrollHeight>r.screen.height)return;y.classList.add("hide-scrollbar")}else clearTimeout(s);s=setTimeout($,300)},R=function(D){s!==null&&D==="remove"&&(clearTimeout(s),$()),window[`${D}EventListener`]("resize",M)},s=null;const y=document.body;h(()=>e.container!==!0?"add":"remove",R),e.container!==!0&&R("add"),Ee(()=>{R("remove")})}return()=>{const s=je(m.default,[x(mt,{onScroll:f}),x(ue,{onResize:Q})]),y=x("div",{class:a.value,style:L.value,ref:e.container===!0?void 0:l,tabindex:-1},s);return e.container===!0?x("div",{class:"q-layout-container overflow-hidden",ref:l},[x(ue,{onResize:p}),x("div",{class:"absolute-full",style:S.value},[x("div",{class:"scroll",style:d.value},[y])])]):y}}});const qt=Ue({__name:"MainLayout",setup(e){const m=T(!1);function i(){m.value=!m.value}return(r,l)=>{const c=Ke("router-view");return Xe(),Ge(gt,{view:"hHh LpR lFf"},{default:q(()=>[w(dt,{bordered:"",class:"bg-secondary text-white"},{default:q(()=>[w(ct,null,{default:q(()=>[w(Je,{dense:"",flat:"",round:"",icon:"menu",onClick:i}),w(xe,null,{default:q(()=>[K(" Factorio Analytics ")]),_:1}),w(xe,{class:"text-subtitle2",shrink:""},{default:q(()=>[K("V1.0 ALPHA")]),_:1})]),_:1})]),_:1}),w(ft,{modelValue:m.value,"onUpdate:modelValue":l[0]||(l[0]=g=>m.value=g),side:"left",overlay:"",bordered:""},{default:q(()=>[w(rt,{padding:"",separator:"",class:"q-pa-sm"},{default:q(()=>[w(ye,{clickable:"",to:{path:"/"},class:"rounded-borders"},{default:q(()=>[w(G,{side:"",avatar:""},{default:q(()=>[w(be,{name:"home"})]),_:1}),w(G,null,{default:q(()=>[w(we,null,{default:q(()=>[K("Home")]),_:1})]),_:1})]),_:1}),w(ye,{clickable:"",to:{path:"/about"},class:"rounded-borders"},{default:q(()=>[w(G,{side:"",avatar:""},{default:q(()=>[w(be,{name:"help"})]),_:1}),w(G,null,{default:q(()=>[w(we,null,{default:q(()=>[K("About")]),_:1})]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"]),w(vt,null,{default:q(()=>[w(c)]),_:1})]),_:1})}}});export{qt as default};
