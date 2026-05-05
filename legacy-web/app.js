const tabs=[...document.querySelectorAll('.tool-tab')],cards=[...document.querySelectorAll('.tool-card')];
const f=(v)=>Number.isFinite(v)?v.toFixed(2):'-';
const toM=(v,u)=>u==='cm'?v/100:v;
function act(id){tabs.forEach(t=>t.classList.toggle('active',t.dataset.tab===id));cards.forEach(c=>c.classList.toggle('active',c.dataset.panel===id));}
tabs.forEach(t=>t.onclick=()=>act(t.dataset.tab));
const ve=['v-l','v-w','v-h','v-ach','v-lu','v-wu','v-hu'].map(id=>document.getElementById(id));
function uv(){const [l,w,h,ach,lu,wu,hu]=ve;const lm=toM(+l.value,lu.value),wm=toM(+w.value,wu.value),hm=toM(+h.value,hu.value),a=+ach.value; if(![lm,wm,hm,a].every(Number.isFinite)){document.getElementById('v-result').textContent='-';return;}const vol=lm*wm*hm,cmh=vol*a;document.getElementById('v-result').textContent=`Volume ${f(vol)} m³ | CMH ${f(cmh)} | CMM ${f(cmh/60)} | CFM ${f(cmh/1.699)}`;}
ve.forEach(e=>e&&e.addEventListener('input',uv));ve.forEach(e=>e&&e.addEventListener('change',uv));
const de=['d-r','d-rpr','d-k','d-l','d-w','d-h','d-p','d-u','d-df','d-ld','d-o','d-v','d-pf'].map(id=>document.getElementById(id));
function ud(){const [r,rpr,k,l,w,h,p,u,df,ld,o,v,pf]=de.map(e=>+e.value); if(![r,rpr,k,l,w,h,p,u,df,ld,o,v,pf].every(Number.isFinite)){document.getElementById('d-result').textContent='-';return;} const tr=r*rpr,it=tr*k,ups=it*u,dist=it*df,light=l*w*ld/1000,people=p*0.1,total=it+ups+dist+light+people,hvac=total*0.4,other=it*o,tp=it+hvac+other,cur=(kw)=>kw*1000/(Math.sqrt(3)*v*pf);document.getElementById('d-result').innerHTML=`Racks ${f(tr)} | Area ${f(l*w)} m² | Volume ${f(l*w*h)} m³<br>Heat Total ${f(total)} kW / ${f(total/3.5168525)} RT / ${f(total*3412.142)} BTU/h<br>UPS ${f(it)}kW ${f(cur(it))}A | HVAC ${f(hvac)}kW ${f(cur(hvac))}A | Other ${f(other)}kW ${f(cur(other))}A | Total ${f(tp)}kW ${f(cur(tp))}A<br>Based on 380V three-phase power, PF 0.95`;}
de.forEach(e=>e&&e.addEventListener('input',ud));
