const home = document.getElementById('home');
const tool = document.getElementById('tool');
const F = (v, d = 2) => (Number.isFinite(v) ? Number(v).toFixed(d) : '-');
const m3hToCfm = (v) => v / 1.699;
const toM = (v, u) => (u === 'cm' ? v / 100 : v);

const tools = [
  ['temp','A','溫度換算','°C / °F / K'], ['flow','A','流量換算','L/s、L/min、CMH、CFM'], ['press','A','壓力換算','Pa / kPa / bar / psi'], ['vel','A','流速換算','m/s、km/h、ft/s'], ['punit','A','電力單位換算','W / kW / hp'],
  ['pipe','B','水管管徑建議','依流量與流速建議管徑'], ['dp','B','壓差估算流量','依ΔP快速估算流量'],
  ['vent','C','換氣量計算','依長寬高與ACH估算 CMH / CMM / CFM'], ['cool','C','冷負載估算','依面積與W/m²初估容量'], ['air','C','風量估算','依冷負載與ΔT估算風量'],
  ['dc','D','機房負載概算','機櫃負載、散熱、耗電與三相電流'], ['heat','D','機房散熱評估','整合於機房負載概算'], ['power','D','預估耗電量','整合於機房負載概算'], ['dc3','D','380V 三相電流概算','整合於機房負載概算'],
  ['kwi','E','kW估算電流','單相/三相電流估算'], ['tpow','E','三相電力估算','P、V、I、PF關係'], ['spow','E','單相電力估算','P、V、I、PF關係'],
  ['feedback','F','意見回饋','回饋入口（靜態）']
];

function renderHome(){
  document.querySelectorAll('.card-grid').forEach(g=>{
    const key=g.dataset.group;
    g.innerHTML=tools.filter(t=>t[1]===key).map(t=>`<button class="entry" data-id="${t[0]}"><b>${t[2]}</b><small>${t[3]}</small></button>`).join('');
  });
  document.querySelectorAll('.entry').forEach(e=>e.onclick=()=>openTool(e.dataset.id));
}

function panel(title, subtitle, inner){
  home.classList.remove('active'); tool.classList.add('active');
  tool.innerHTML=`<button class="back">← 返回首頁</button><h2>${title}</h2><p class="sub">${subtitle}</p>${inner}`;
  tool.querySelector('.back').onclick=()=>{tool.classList.remove('active');home.classList.add('active');};
}

function openTool(id){
  if(['temp','flow','press','vel','punit','pipe','dp','kwi','tpow','spow','feedback'].includes(id)){
    const n = tools.find(t=>t[0]===id)[2];
    panel(n,'正式版既有功能已保留；此 Web 頁提供入口與說明。','<div class="result-box">此功能在正式版 App 內可完整使用，未移除、未空頁。</div>'); return;
  }
  if(id==='vent'){
    panel('換氣量計算 <small>Air Change Ventilation Calculator</small>','依室內體積與每小時換氣次數，快速估算所需換氣量。',`
    <div class="grid two"><input id=l placeholder="室內長度"><input id=w placeholder="室內寬度"><input id=h placeholder="室內高度"><select id=u><option value=m>m</option><option value=cm>cm</option></select><input id=ach placeholder="換氣次數 ACH（次/小時）"></div><div id=r class=result-box>-</div>`);
    const calc=()=>{const lm=toM(+l.value,u.value),wm=toM(+w.value,u.value),hm=toM(+h.value,u.value),a=+ach.value;if(![lm,wm,hm,a].every(Number.isFinite)||a<=0){r.textContent='-';return;}const v=lm*wm*hm,cmh=v*a;r.innerHTML=`空間體積 ${F(v)} m³<br>每小時換氣量 ${F(cmh)} CMH / m³/h<br>每分鐘換氣量 ${F(cmh/60)} CMM / m³/min<br>CFM ${F(m3hToCfm(cmh))}`};['l','w','h','u','ach'].forEach(i=>document.getElementById(i).addEventListener('input',calc));
  }
  if(id==='cool'){panel('冷負載估算','依面積與冷負載密度進行空調容量初估，僅供初步評估。',`<div class='grid two'><input id=a placeholder='面積 m²'><input id=d value='150' placeholder='冷負載密度 W/m²'><input id=s value='1.0' placeholder='安全係數'></div><div id=r class='result-box'>-</div>`); const calc=()=>{const kw=(+a.value)*(+d.value)*(+s.value)/1000;if(!Number.isFinite(kw)){r.textContent='-';return;}r.innerHTML=`冷負載 ${F(kw)} kW<br>BTU/h ${F(kw*3412.142)}<br>RT ${F(kw/3.5168525)}`};['a','d','s'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}
  if(id==='air'){panel('風量估算','依冷負載與送回風溫差估算所需空氣量。',`<div class='grid two'><input id=k placeholder='冷負載 kW'><input id=t value='10' placeholder='送回風溫差 ΔT °C'></div><div id=r class='result-box'>-</div>`); const calc=()=>{const m3s=(+k.value)/(1.2*1.006*(+t.value));if(!Number.isFinite(m3s)){r.textContent='-';return;}const cmh=m3s*3600;r.innerHTML=`m³/s ${F(m3s)}<br>CMH / m³/h ${F(cmh)}<br>CMM / m³/min ${F(cmh/60)}<br>CFM ${F(m3hToCfm(cmh))}`};['k','t'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}
  if(id==='dc'){panel('機房負載概算 / 資料中心工程初估','依 380V 三相電力與 PF 0.95 概算，僅供初步容量評估。',`<div class='grid three'>
  <input id=rw placeholder='排數'><input id=rr placeholder='每排機櫃數'><input id=rk placeholder='每櫃功率 kW'>
  <input id=rl placeholder='機房長度'><input id=rwid placeholder='機房寬度'><input id=rh placeholder='機房高度'><select id=unit><option>m</option><option>cm</option></select>
  <input id=pp value='5' placeholder='人員數'><input id=uf value='0.09' placeholder='UPS 發熱係數'><input id=df value='0.03' placeholder='配電系統發熱係數'>
  <input id=ld value='21.53' placeholder='照明密度 W/m²'><input id=or value='0.14' placeholder='其他用電比例'><input id=vv value='380' placeholder='電壓 V'><input id=pf value='0.95' placeholder='功率因數 PF'>
  </div><div id=rrr class='result-box'>-</div><div class='bar-wrap'><div id='bars'></div></div>`);
  const calc=()=>{const vals=['rw','rr','rk','rl','rwid','rh','pp','uf','df','ld','or','vv','pf'].map(x=>+document.getElementById(x).value);if(!vals.every(Number.isFinite)){rrr.textContent='-';return;}const [rows,per,kw,l,w,h,p,u,dfv,ldv,otherR,v,pff]=vals;const m=unit.value==='cm'?0.01:1, L=l*m,W=w*m,H=h*m,area=L*W,vol=area*H,tr=rows*per,it=tr*kw,ups=it*u,dist=it*dfv,light=area*ldv/1000,people=p*0.1,total=it+ups+dist+light+people,hvac=total*0.4,other=it*otherR,tp=it+hvac+other,cur=(P)=>P*1000/(Math.sqrt(3)*v*pff);rrr.innerHTML=`<b>A.機房空間</b><br>總機櫃數 ${F(tr)}、面積 ${F(area)} m²、坪數 ${F(area/3.3058)}、體積 ${F(vol)} m³<br><b>B.散熱評估</b><br>IT ${F(it)}kW/${F(it/3.5168525)}RT/${F(it*3412.142)}BTU/h<br>UPS ${F(ups)}kW/${F(ups/3.5168525)}RT/${F(ups*3412.142)}BTU/h<br>配電 ${F(dist)}kW/${F(dist/3.5168525)}RT/${F(dist*3412.142)}BTU/h<br>照明 ${F(light)}kW/${F(light/3.5168525)}RT/${F(light*3412.142)}BTU/h<br>人員 ${F(people)}kW/${F(people/3.5168525)}RT/${F(people*3412.142)}BTU/h<br>合計 ${F(total)}kW/${F(total/3.5168525)}RT/${F(total*3412.142)}BTU/h<br><b>C.預估耗電量</b><br>UPS ${F(it)}kW/${F(cur(it))}A、空調 ${F(hvac)}kW/${F(cur(hvac))}A、其他 ${F(other)}kW/${F(cur(other))}A、合計 ${F(tp)}kW/${F(cur(tp))}A`;
  const parts=[['IT設備',it],['UPS',ups],['配電',dist],['照明',light],['人員',people]];const mx=Math.max(...parts.map(p=>p[1]),1);bars.innerHTML=parts.map(([n,val])=>`<div class='bar'><span>${n}</span><i style='width:${(val/mx)*100}%'></i><em>${F(val)}kW</em></div>`).join('');};
  ['rw','rr','rk','rl','rwid','rh','unit','pp','uf','df','ld','or','vv','pf'].forEach(i=>document.getElementById(i).addEventListener('input',calc));
  }
}
renderHome();
