import{y as x,r as m,A as I,B as w,C as t,a1 as B,D as e,G as l,E as a,F as s,Q as g}from"./index.b769df83.js";import{u as O,Q,a as A,b as h,c as N,d as k,e as S}from"./use-quasar.a58b9986.js";import{Q as C,b as p,c as o,d as u}from"./QList.4713488d.js";const R=l("div",{class:"text-uppercase text-h6"}," About ",-1),E=l("div",{class:"text-body2"}," Factorio Analytics is a tool for analyzing all of the data produced by running a Blueprint in Factorio. All of the statistical data that you see in-game can be recorded and analyzed here; with some limits and caveats of course. ",-1),V={class:"text-body2"},q=l("div",{class:"text-body2"},[a(" There are some requirements you should know before submitting blueprints. These are important to keep in mind so that you can receive accurate data about what you want "),l("ol",null,[l("li",null,[a("Blueprints submitted must be in the latest Blueprint version "),l("b",null,[l("i",null,"(AKA EXTREMELY OLD BLUEPRINTS NOT SUPPORTED)")])]),l("li",null,[a("Blueprints must contain "),l("b",null,"AT LEAST 1 INFINITY CHEST OR 1 COMBINATOR"),a(" to produce any real amount of data. The benchmark world will be completely barren, so plan accordingly ")]),l("li",null,"Blueprints submitted must contain ONLY Vanilla items. Yes, you CAN submit modded blueprints; but the functionality to download and use those mods is not done yet "),l("br"),l("b",null,"One last tip: Try making smaller sub-factory pieces, with infinity-chests and infinity-pipes as inputs/outputs. These kinds of blueprints run very quick. Design different parts of your factory, benchmark them here, then decide on final factory designs in-game. ")])],-1),z=l("span",{class:"text-body1"},"For more information, follow a link below",-1),D=l("br",null,null,-1),L=l("div",{class:"text-uppercase text-h6"}," ACTIONS ",-1),Y=x({__name:"IndexPage",setup(P){const f=O(),b=B(),y=A(),d=m(""),c=m(""),_=m(!1);function v(r){d.value=r,f.checkSource(r).then(n=>{_.value=!0,b.push(`/source/${r}`)}).catch(n=>{_.value=!1})}function T(){f.submitQuickSource(c.value).then(r=>{let n=r.trialId;f.queryTrial(n).then(i=>{b.push(`/source/${i.source}`)}).catch(i=>{y.notify({color:"negative",message:"Error opening blueprint",position:"top",timeout:2500}),console.log(i)})}).catch(r=>{y.notify({color:"negative",message:"Error submitting blueprint",position:"top",timeout:2500}),console.log(r)})}return(r,n)=>(I(),w(Q,{padding:""},{default:t(()=>[e(S,null,{default:t(()=>[e(h,null,{default:t(()=>[R,E,l("div",V,[a(" Some things this tool can and can't do... "),l("ul",null,[l("li",null,[e(s,{name:"check",color:"green"}),a(" Record and analyze production and consumption rates of item output ")]),l("li",null,[e(s,{name:"check",color:"green"}),a(" Record and analyze electric network data ")]),l("li",null,[e(s,{name:"check",color:"green"}),a(" Record and analyze the state of the circuit network ")]),l("li",null,[e(s,{name:"check",color:"green"}),a(" Record and analyze pollution data ")]),l("li",null,[e(s,{name:"check",color:"green"}),a(" Record and analyze system performance data ")]),l("li",null,[e(s,{name:"cancel",color:"red"}),a(" CANNOT Record screenshots of your blueprint as it runs ")]),l("li",null,[e(s,{name:"cancel",color:"red"}),a(" CANNOT Use mods (use the local factorio-analytics package yourself if anything) ")])])]),q,e(N),z,D,e(C,null,{default:t(()=>[e(p,{clickable:"",href:"https://github.com/CharacterOverflow/factorio-analytics"},{default:t(()=>[e(o,{side:"",avatar:""},{default:t(()=>[e(s,{name:"code"})]),_:1}),e(o,null,{default:t(()=>[e(u,null,{default:t(()=>[a("Factorio Analytics Github")]),_:1})]),_:1})]),_:1}),e(p,{clickable:"",to:"/example"},{default:t(()=>[e(o,{side:"",avatar:""},{default:t(()=>[e(s,{name:"help"})]),_:1}),e(o,null,{default:t(()=>[e(u,null,{default:t(()=>[a("Example Page")]),_:1}),e(u,{caption:""},{default:t(()=>[a("If you don't have a blueprint but want to check this site out, click this")]),_:1})]),_:1})]),_:1})]),_:1})]),_:1}),e(h,null,{default:t(()=>[L]),_:1}),e(h,null,{default:t(()=>[e(p,null,{default:t(()=>[e(o,{style:{"max-width":"30%"}},{default:t(()=>[e(u,null,{default:t(()=>[a("Open Blueprint")]),_:1}),e(u,{caption:""},{default:t(()=>[a("Opens a specific blueprint by ID")]),_:1})]),_:1}),e(o,null,{default:t(()=>[e(u,null,{default:t(()=>[e(k,{debounce:1e3,modelValue:d.value,"onUpdate:modelValue":n[0]||(n[0]=i=>d.value=i),label:"Blueprint ID",filled:""},null,8,["modelValue"])]),_:1})]),_:1}),e(o,{side:""},{default:t(()=>[e(u,null,{default:t(()=>[e(g,{color:"primary",onClick:n[1]||(n[1]=i=>v(d.value))},{default:t(()=>[a("Open")]),_:1})]),_:1})]),_:1})]),_:1}),e(p,null,{default:t(()=>[e(o,{style:{"max-width":"30%"}},{default:t(()=>[e(u,null,{default:t(()=>[a("Submit Blueprint and Trial")]),_:1}),e(u,{caption:""},{default:t(()=>[a("Submit a blueprint with a default trial")]),_:1})]),_:1}),e(o,null,{default:t(()=>[e(u,null,{default:t(()=>[e(k,{type:"textarea",modelValue:c.value,"onUpdate:modelValue":n[2]||(n[2]=i=>c.value=i),label:"Blueprint String",filled:""},null,8,["modelValue"])]),_:1})]),_:1}),e(o,{side:""},{default:t(()=>[e(g,{class:"full-height q-ml-xl q-mt-lg q-mb-lg",color:"primary",disable:!c.value,onClick:n[3]||(n[3]=i=>T())},{default:t(()=>[a("Submit and Open ")]),_:1},8,["disable"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1}))}});export{Y as default};