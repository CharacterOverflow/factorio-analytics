import{y as B,r as m,A as I,B as O,C as l,a1 as w,D as e,G as t,E as a,F as u,Q as _}from"./index.f04fa542.js";import{u as x,Q as N,a as A,b as f,c as g,d as S}from"./use-quasar.63a5cd35.js";import{Q as v,b as r,c as s}from"./QItem.33fef6d3.js";const C=t("div",{class:"text-uppercase text-h6"}," About ",-1),Q=t("div",{class:"text-body2"}," Factorio Analytics is a tool for analyzing all of the data produced by running a Blueprint in Factorio. All of the statistical data that you see in-game can be recorded and analyzed here; with some limits and caveats of course. ",-1),R={class:"text-body2"},V=t("div",{class:"text-body2"},[a(" There are some requirements you should know before submitting blueprints. These are important to keep in mind so that you can receive accurate data about what you want "),t("ol",null,[t("li",null,[a("Blueprints submitted must be in the latest Blueprint version "),t("b",null,[t("i",null,"(AKA EXTREMELY OLD BLUEPRINTS NOT SUPPORTED)")])]),t("li",null,[a("Blueprints must contain "),t("b",null,"AT LEAST 1 INFINITY CHEST OR 1 COMBINATOR"),a(" to produce any real amount of data. The benchmark world will be completely barren, so plan accordingly ")]),t("li",null,"Blueprints submitted must contain ONLY Vanilla items. Yes, you CAN submit modded blueprints; but the functionality to download and use those mods is not done yet "),t("br"),t("b",null,"One last tip: Try making smaller sub-factory pieces, with infinity-chests and infinity-pipes as inputs/outputs. These kinds of blueprints run very quick. Design different parts of your factory, benchmark them here, then decide on final factory designs in-game. ")])],-1),E=t("br",null,null,-1),q=t("div",{class:"text-body2"}," See my Github page in the top right for more information on how this tool works, and how you can use it locally! ",-1),z=t("div",{class:"text-uppercase text-h6"}," ACTIONS ",-1),$=B({__name:"IndexPage",setup(D){const p=x(),h=w(),b=A(),d=m(""),c=m(""),y=m(!1);function k(i){d.value=i,p.checkSource(i).then(n=>{y.value=!0,h.push(`/source/${i}`)}).catch(n=>{y.value=!1})}function T(){p.submitQuickSource(c.value).then(i=>{let n=i.trialId;p.queryTrial(n).then(o=>{h.push(`/source/${o.source}`)}).catch(o=>{b.notify({color:"negative",message:"Error opening blueprint",position:"top",timeout:2500}),console.log(o)})}).catch(i=>{b.notify({color:"negative",message:"Error submitting blueprint",position:"top",timeout:2500}),console.log(i)})}return(i,n)=>(I(),O(N,{padding:""},{default:l(()=>[e(S,null,{default:l(()=>[e(f,null,{default:l(()=>[C,Q,t("div",R,[a(" Some things this tool can and can't do... "),t("ul",null,[t("li",null,[e(u,{name:"check",color:"green"}),a(" Record and analyze production and consumption rates of item output ")]),t("li",null,[e(u,{name:"check",color:"green"}),a(" Record and analyze the state of the circuit network ")]),t("li",null,[e(u,{name:"check",color:"green"}),a(" Record and analyze pollution data ")]),t("li",null,[e(u,{name:"check",color:"green"}),a(" Record and analyze system performance data ")]),t("li",null,[e(u,{name:"cancel",color:"red"}),a(" CANNOT Record and analyze the electric networks (yet; more testing needed) ")]),t("li",null,[e(u,{name:"cancel",color:"red"}),a(" CANNOT Record screenshots of your blueprint as it runs ")]),t("li",null,[e(u,{name:"cancel",color:"red"}),a(" CANNOT Use mods (use the local factorio-analytics package yourself if anything) ")])])]),V,E,q]),_:1}),e(f,null,{default:l(()=>[z]),_:1}),e(f,null,{default:l(()=>[e(v,null,{default:l(()=>[e(r,{style:{"max-width":"30%"}},{default:l(()=>[e(s,null,{default:l(()=>[a("Open Blueprint")]),_:1}),e(s,{caption:""},{default:l(()=>[a("Opens a specific blueprint by ID")]),_:1})]),_:1}),e(r,null,{default:l(()=>[e(s,null,{default:l(()=>[e(g,{debounce:1e3,modelValue:d.value,"onUpdate:modelValue":n[0]||(n[0]=o=>d.value=o),label:"Blueprint ID",filled:""},null,8,["modelValue"])]),_:1})]),_:1}),e(r,{side:""},{default:l(()=>[e(s,null,{default:l(()=>[e(_,{color:"primary",onClick:n[1]||(n[1]=o=>k(d.value))},{default:l(()=>[a("Open")]),_:1})]),_:1})]),_:1})]),_:1}),e(v,null,{default:l(()=>[e(r,{style:{"max-width":"30%"}},{default:l(()=>[e(s,null,{default:l(()=>[a("Submit Blueprint and Trial")]),_:1}),e(s,{caption:""},{default:l(()=>[a("Submit a blueprint with a default trial")]),_:1})]),_:1}),e(r,null,{default:l(()=>[e(s,null,{default:l(()=>[e(g,{type:"textarea",modelValue:c.value,"onUpdate:modelValue":n[2]||(n[2]=o=>c.value=o),label:"Blueprint String",filled:""},null,8,["modelValue"])]),_:1})]),_:1}),e(r,{side:""},{default:l(()=>[e(_,{class:"full-height q-ml-xl q-mt-lg q-mb-lg",color:"primary",disable:!c.value,onClick:n[3]||(n[3]=o=>T())},{default:l(()=>[a("Submit and Open ")]),_:1},8,["disable"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1}))}});export{$ as default};
