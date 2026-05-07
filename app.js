const home = document.getElementById('home');
const tool = document.getElementById('tool');

const { PIPE_SIZE_OPTIONS, getPipeSizeById, calculateVelocityFromLpmAndDiameter, getRecommendedPipeForFlow } = window.PipeSizes || {};
const sourceText = '依據：APC－計算數據中心製冷量';

const parseNumber = (raw) => {
  const text = String(raw ?? '').trim();
  if (text === '' || text === '-' || text === '.') return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
};
const parsePositiveNumberInput = (value) => {
  const parsed = parseNumber(value);
  return parsed !== null && parsed > 0 ? parsed : null;
};
const format1 = (value) => (Number.isFinite(value) ? String(Number(value.toFixed(1))) : '-');
const m3hToCfm = (v) => v / 1.699;
const toM = (v, u) => (u === 'cm' ? v / 100 : v);
const dpToPa = (v, u) => ({ Pa: v, kPa: v * 1000, mH2O: v * 9806.65, bar: v * 100000 }[u]);

const tools = [
  ['temp','A','溫度換算','°C / °F / K'], ['flow','A','流量換算','L/s、L/min、CMH、CFM'], ['press','A','壓力換算','Pa / kPa / bar / psi'], ['vel','A','流速換算','m/s、km/h、ft/s'], ['punit','A','電力單位換算','W / kW / hp'],
  ['pipe','B','水管管徑建議','依流量與流速建議管徑'], ['dp','B','壓差估算流量','依ΔP快速估算流量'],
  ['vent','C','換氣量計算','依長寬高與ACH估算 CMH / CMM / CFM'], ['cool','C','冷負載估算','依面積與W/m²初估容量'], ['air','C','風量估算','依冷負載與ΔT估算風量'],
  ['dc','D','機房負載概算','機櫃負載、散熱、耗電與三相電流'], ['heat','D','機房散熱評估','顯示散熱分項與來源'], ['power','D','預估耗電量','顯示耗電分項與來源'], ['dc3','D','380V 三相電流概算','依kW、V、PF估算電流'],
  ['kwi','E','kW估算電流','單相/三相電流估算'], ['tpow','E','三相電力估算','P、V、I、PF關係'], ['spow','E','單相電力估算','P、V、I、PF關係'],
  ['feedback','F','意見回饋','回饋建議與需求']
];

const field = (id, label, p='', v='', help='') => `<div class='field'><label for='${id}'>${label}</label><input id='${id}' type='text' inputmode='decimal' autocomplete='off' placeholder='${p}' value='${v}' />${help?`<small class='help'>${help}</small>`:''}</div>`;
const selectField = (id, label, options, help='') => `<div class='field'><label for='${id}'>${label}</label><select id='${id}'>${options}</select>${help?`<small class='help'>${help}</small>`:''}</div>`;

function renderHome(){
  document.querySelectorAll('.card-grid').forEach(g=>{
    g.innerHTML=tools.filter(t=>t[1]===g.dataset.group).map(t=>`<button class="entry" data-id="${t[0]}"><b>${t[2]}</b><small>${t[3]}</small></button>`).join('');
  });
  document.querySelectorAll('.entry').forEach(e=>e.onclick=()=>openTool(e.dataset.id));
}

function panel(title, subtitle, inner){
  home.classList.remove('active'); tool.classList.add('active');
  tool.innerHTML=`<button class="back">← 返回首頁</button><h2>${title}</h2><p class="sub">${subtitle}</p>${inner}`;
  tool.querySelector('.back').onclick=()=>{tool.classList.remove('active');home.classList.add('active');};
}

function bindConverter(ids, fromBase, toBase){
  const calc=(src)=>{const raw=parseNumber(document.getElementById(src).value); if(raw===null)return; const base=fromBase(src, raw); ids.forEach((id)=>{if(id!==src) document.getElementById(id).value=format1(toBase(id, base));});};
  ids.forEach(i=>document.getElementById(i).addEventListener('input',()=>calc(i)));
}

function initTempTool(){ bindConverter(['c','f','k'], (s,v)=>s==='c'?v:s==='f'?(v-32)*5/9:v-273.15, (id,b)=>id==='c'?b:id==='f'?b*9/5+32:b+273.15); }
function initFlowTool(){ bindConverter(['ls','lm','cmh','cfm'], (s,v)=>({ls:v,lm:v/60,cmh:v/3.6,cfm:v/2118.88}[s]), (id,b)=>({ls:b,lm:b*60,cmh:b*3.6,cfm:b*2118.88}[id])); }
function initPressureTool(){ bindConverter(['pa','kpa','bar','psi'], (s,v)=>({pa:v,kpa:v*1000,bar:v*100000,psi:v*6894.757}[s]), (id,b)=>({pa:b,kpa:b/1000,bar:b/100000,psi:b/6894.757}[id])); }
function initVelocityTool(){ bindConverter(['ms','kmh','fts'], (s,v)=>({ms:v,kmh:v/3.6,fts:v/3.28084}[s]), (id,b)=>({ms:b,kmh:b*3.6,fts:b*3.28084}[id])); }
function initPowerUnitTool(){ bindConverter(['w','kw','hp'], (s,v)=>({w:v,kw:v*1000,hp:v*745.7}[s]), (id,b)=>({w:b,kw:b/1000,hp:b/745.7}[id])); }

function initKwiTool(){const calc=()=>{const p=+pk.value*1000,v=+vk.value,pf=+pfk.value;const single=p/(v*pf);const three=p/(Math.sqrt(3)*v*pf);r.innerHTML=Number.isFinite(single)&&Number.isFinite(three)?`單相電流：${format1(single)} A<br>三相電流：${format1(three)} A`:'-';};['pk','vk','pfk'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}
function initPipeSuggestTool(){
  const qLpm = document.getElementById('qLpm'); const r = document.getElementById('r');
  const calc=()=>{const lpm=parsePositiveNumberInput(qLpm.value); if(!lpm){r.textContent='-';return;} const best=getRecommendedPipeForFlow(lpm,3); if(!best){r.innerHTML='超出表內最大管徑（400A），請重新確認流量與系統條件。';return;} r.innerHTML=`建議管徑：<b>${best.label}</b><br>建議流速：約 ${format1(best.velocityMs)} m/s<br><span class='muted'>3 m/s 僅作為設計選管建議值，實際設計仍需依現場條件複核。</span>`;};
  qLpm.addEventListener('input', calc);
}

function initDpFlowTool(){
  const calc=()=>{const measured=parsePositiveNumberInput(measuredDp.value); const pipe=getPipeSizeById(pipeUsed.value); if(!measured||!pipe){r.innerHTML='<b>A. 現場初估</b><br>-'; advResult.innerHTML=''; return;} const measuredPa=dpToPa(measured, measuredUnit.value);
    const v=Math.sqrt((2*measuredPa/1000))*0.60; const area=Math.PI*Math.pow(pipe.innerDiameterMm/1000,2)/4; const rawFlowLpm=area*v*60000; const rawVelocity=calculateVelocityFromLpmAndDiameter(rawFlowLpm,pipe.innerDiameterMm);
    const flowAt25=area*2.5*60000; const flowAt3=area*3*60000;
    let displayFlowLpm=rawFlowLpm;
    let reviewReminder='';
    if(rawVelocity>3){displayFlowLpm=flowAt25; reviewReminder='提醒：此推估值對輸入條件較敏感，請確認壓差單位、量測點與管徑是否正確。';}
    else if(rawVelocity>2.5){displayFlowLpm=Math.min(rawFlowLpm,flowAt3); reviewReminder='提醒：此推估值對輸入條件較敏感，請確認壓差單位、量測點與管徑是否正確。';}
    r.innerHTML=`<b>A. 現場初估</b><br>壓差推估流量：約 ${format1(displayFlowLpm)} LPM<br>性質：依目前壓差與管徑推估，非流量計實測值。<br>提醒：實際流量請以流量計、TAB 平衡報告或設備量測資料為準。${reviewReminder?`<br>${reviewReminder}`:''}`;

    const rf=parsePositiveNumberInput(refFlow.value); const rd=parsePositiveNumberInput(refDp.value);
    if(rf&&rd){const refDpPa=dpToPa(rd, refDpUnit.value); const correctedFlowLpm=rf*Math.sqrt(measuredPa/refDpPa); advResult.innerHTML=`<b>B. 設備參考點修正</b><br>修正推估流量：約 ${format1(correctedFlowLpm)} LPM<br>性質：依參考流量與參考壓損修正之推估值<br>提醒：仍需以流量計或 TAB 資料確認`; } else {advResult.innerHTML='';}
  };
  ['measuredDp','measuredUnit','pipeUsed','refFlow','refDp','refDpUnit'].forEach(i=>document.getElementById(i).addEventListener('input',calc));
}

function initVentilationTool(){const calc=()=>{const lm=toM(+l.value,ul.value),wm=toM(+w.value,uw.value),hm=toM(+h.value,uh.value),a=+ach.value;if(![lm,wm,hm,a].every(Number.isFinite)||a<=0){r.textContent='-';return;}const v=lm*wm*hm,cmh=v*a;r.innerHTML=`空間體積 ${format1(v)} m³<br>每小時換氣量 ${format1(cmh)} CMH / m³/h<br>每分鐘換氣量 ${format1(cmh/60)} CMM / m³/min<br>CFM ${format1(m3hToCfm(cmh))}`};['l','w','h','ul','uw','uh','ach'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}
function initCoolingLoadTool(){const calc=()=>{const kw=(+a.value)*(+d.value)*(+s.value)/1000;r.innerHTML=Number.isFinite(kw)?`冷負載 kW：${format1(kw)}<br>BTU/h：${format1(kw*3412.142)}<br>RT：${format1(kw/3.5168525)}`:'-';};['a','d','s'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}
function initAirflowTool(){const calc=()=>{const m3s=(+k.value)/(1.2*1.006*(+t.value));if(!Number.isFinite(m3s)){r.textContent='-';return;}const cmh=m3s*3600;r.innerHTML=`m³/s：${format1(m3s)}<br>CMH / m³/h：${format1(cmh)}<br>CMM / m³/min：${format1(cmh/60)}<br>CFM：${format1(m3hToCfm(cmh))}`};['k','t'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}
function initDataCenterLoadTool(){ initDcSharedTool();}
function initCurrentEstimateTool(){const calc=()=>{const a=(+p.value*1000)/(Math.sqrt(3)*(+v.value)*(+pf3.value));r.innerHTML=Number.isFinite(a)?`三相電流：約 ${format1(a)} A`:'-';};['p','v','pf3'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}
function initThreePhasePowerTool(){const calc=()=>{const kw=Math.sqrt(3)*(+vt.value)*(+it.value)*(+pft.value)/1000;r.innerHTML=Number.isFinite(kw)?`有功功率：${format1(kw)} kW`:'-';};['vt','it','pft'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}
function initSinglePhasePowerTool(){const calc=()=>{const kw=(+vs1.value)*(+is1.value)*(+pfs.value)/1000;r.innerHTML=Number.isFinite(kw)?`有功功率：${format1(kw)} kW`:'-';};['vs1','is1','pfs'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}
function initFeedbackTool(){}
function initDcSharedTool(){const calc=()=>{const vals=['rw','rr','rk','rl','rwid','rh','pp','uf','df','ld','or','vv','pf'].map(x=>+document.getElementById(x).value);if(!vals.every(Number.isFinite)){rrr.textContent='-';return;}const [rows,per,kw,l,w,h,p,u,dfv,ldv,otherR,v,pff]=vals;const m=unit.value==='cm'?0.01:1,L=l*m,W=w*m,H=h*m,area=L*W,vol=area*H,tr=rows*per,it=tr*kw,ups=it*u,dist=it*dfv,light=area*ldv/1000,people=p*0.1,total=it+ups+dist+light+people,hvac=total*0.4,other=it*otherR,tp=ups+hvac+other,cur=(P)=>P*1000/(Math.sqrt(3)*v*pff);rrr.innerHTML=`<h3>A. 機房空間</h3><table><tr><td>排數</td><td>${format1(rows)}</td></tr><tr><td>每排機櫃數</td><td>${format1(per)}</td></tr><tr><td>總機櫃數</td><td>${format1(tr)}</td></tr><tr><td>每櫃 kW</td><td>${format1(kw)}</td></tr><tr><td>面積 m²</td><td>${format1(area)}</td></tr><tr><td>坪數</td><td>${format1(area/3.3058)}</td></tr><tr><td>體積 m³</td><td>${format1(vol)}</td></tr></table><h3>B. 散熱評估</h3><table><tr><th>項目</th><th>kW</th><th>RT</th><th>BTU/h</th></tr>${[['IT設備',it],['UPS',ups],['配電系統',dist],['照明設施',light],['人員',people],['合計',total]].map(([n,vv])=>`<tr><td>${n}</td><td>${format1(vv)}</td><td>${format1(vv/3.5168525)}</td><td>${format1(vv*3412.142)}</td></tr>`).join('')}</table><h3>C. 預估耗電量</h3><table><tr><th>項目</th><th>kW</th><th>A</th></tr>${[['UPS',ups],['空調',hvac],['其他',other],['合計',tp]].map(([n,vv])=>`<tr><td>${n}</td><td>${format1(vv)}</td><td>${format1(cur(vv))}</td></tr>`).join('')}</table>`;const parts=[['IT設備',it],['UPS',ups],['配電',dist],['照明',light],['人員',people]];const mx=Math.max(...parts.map(pt=>pt[1]),1);bars.innerHTML=`<h3>D. 比例圖</h3>${parts.map(([n,val])=>`<div class='bar'><span>${n}</span><i style='width:${(val/mx)*100}%'></i><em>${format1(val)}kW</em></div>`).join('')}`;};['rw','rr','rk','rl','rwid','rh','unit','pp','uf','df','ld','or','vv','pf'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}

const toolRegistry = {
  temp:{title:'溫度換算',subtitle:'C、F、K 即時換算。',render:()=>`<div class='grid two'>${field('c','攝氏 °C')}${field('f','華氏 °F')}${field('k','絕對溫度 K')}</div>`,init:initTempTool},
  flow:{title:'流量換算',subtitle:'L/s、L/min、CMH、CFM。',render:()=>`<div class='grid two'>${field('ls','L/s')}${field('lm','L/min')}${field('cmh','CMH / m³/h')}${field('cfm','CFM')}</div>`,init:initFlowTool},
  press:{title:'壓力換算',subtitle:'Pa、kPa、bar、psi。',render:()=>`<div class='grid two'>${field('pa','Pa')}${field('kpa','kPa')}${field('bar','bar')}${field('psi','psi')}</div>`,init:initPressureTool},
  vel:{title:'流速換算',subtitle:'m/s、km/h、ft/s。',render:()=>`<div class='grid two'>${field('ms','m/s')}${field('kmh','km/h')}${field('fts','ft/s')}</div>`,init:initVelocityTool},
  punit:{title:'電力單位換算',subtitle:'W、kW、hp。',render:()=>`<div class='grid two'>${field('w','W')}${field('kw','kW')}${field('hp','hp')}</div>`,init:initPowerUnitTool},
  pipe:{title:'水管管徑建議',subtitle:'依設計流量（LPM）建議管徑與流速。',render:()=>`<div class='grid two'>${field('qLpm','設計流量 LPM')}</div><div id='r' class='result-box'>-</div><p class='note'>3 m/s 僅作為設計選管建議值，實際設計仍需依現場條件複核。</p>`,init:initPipeSuggestTool},
  dp:{title:'壓差估算流量',subtitle:'空調設備運轉中，依現場實測進出水壓差，快速估算目前水量。',render:()=>`<div class='grid two'>${field('measuredDp','目前量測壓差')}${selectField('measuredUnit','量測壓差單位',`<option>Pa</option><option selected>kPa</option><option>mH2O</option><option>bar</option>`)}${selectField('pipeUsed','使用管徑',PIPE_SIZE_OPTIONS.map(p=>`<option value='${p.id}'>${p.label}</option>`).join(''))}</div><div id='r' class='result-box'><b>A. 現場初估</b><br>-</div><div class='result-box subtle'><b>進階設定</b><div class='muted'>設備型錄 / TAB 參考點可在最後做進階修正，非必填。</div><div class='grid two'>${field('refFlow','參考流量（LPM）')}${field('refDp','參考壓損')}${selectField('refDpUnit','壓損單位',`<option>Pa</option><option selected>kPa</option><option>mH2O</option><option>bar</option>`)}</div><div id='advResult'></div></div>`,init:initDpFlowTool},
  vent:{title:'換氣量計算',subtitle:'依長寬高與ACH估算',render:()=>`<div class='grid two'>${field('l','室內長度')}${selectField('ul','長度單位',`<option value='m'>m</option><option value='cm'>cm</option>`)}${field('w','室內寬度')}${selectField('uw','寬度單位',`<option value='m'>m</option><option value='cm'>cm</option>`)}${field('h','室內高度')}${selectField('uh','高度單位',`<option value='m'>m</option><option value='cm'>cm</option>`)}${field('ach','換氣次數 ACH')}</div><div id='r' class='result-box'>-</div>`,init:initVentilationTool},
  cool:{title:'冷負載估算',subtitle:'依面積估算',render:()=>`<div class='grid two'>${field('a','面積 m²')}${field('d','冷負載密度 W/m²','','150')}${field('s','安全係數','','1.0')}</div><div id='r' class='result-box'>-</div>`,init:initCoolingLoadTool},
  air:{title:'風量估算',subtitle:'依冷負載與ΔT',render:()=>`<div class='grid two'>${field('k','冷負載 kW')}${field('t','送回風溫差 ΔT °C','','10')}</div><div id='r' class='result-box'>-</div>`,init:initAirflowTool},
  dc:{title:'機房負載概算',subtitle:'依機櫃數量、單櫃功率、機房面積與 380V 三相電力進行容量初步估算。',render:()=>`<div class='grid three'>${field('rw','排數','例如 5','','機櫃排列的排數')}${field('rr','每排機櫃數','例如 10')}${field('rk','每櫃功率 kW','例如 2','','每一櫃 IT 設備功率')}${field('rl','機房長度','例如 13.2')}${field('rwid','機房寬度','例如 10.2')}${field('rh','機房高度','例如 3.0')}${selectField('unit','長寬高單位',`<option value='m'>m</option><option value='cm'>cm</option>`)}${field('pp','人員數','','5')}${field('uf','UPS 發熱係數','','0.09')}${field('df','配電系統發熱係數','','0.03')}${field('ld','照明密度 W/m²','','21.53')}${field('or','其他用電比例','','0.14')}${field('vv','電壓 V','','380')}${field('pf','功率因數 PF','','0.95')}</div><div id='rrr' class='result-box'>-</div><div class='table-wrap'><div id='bars'></div></div><p class='source'>資料來源：<br>${sourceText}</p>`,init:initDataCenterLoadTool}, heat:{title:'機房散熱評估',subtitle:'依機櫃數量、單櫃功率、機房面積與 380V 三相電力進行容量初步估算。',render:()=>`<div class='grid three'>${field('rw','排數','例如 5','','機櫃排列的排數')}${field('rr','每排機櫃數','例如 10')}${field('rk','每櫃功率 kW','例如 2','','每一櫃 IT 設備功率')}${field('rl','機房長度','例如 13.2')}${field('rwid','機房寬度','例如 10.2')}${field('rh','機房高度','例如 3.0')}${selectField('unit','長寬高單位',`<option value='m'>m</option><option value='cm'>cm</option>`)}${field('pp','人員數','','5')}${field('uf','UPS 發熱係數','','0.09')}${field('df','配電系統發熱係數','','0.03')}${field('ld','照明密度 W/m²','','21.53')}${field('or','其他用電比例','','0.14')}${field('vv','電壓 V','','380')}${field('pf','功率因數 PF','','0.95')}</div><div id='rrr' class='result-box'>-</div><div class='table-wrap'><div id='bars'></div></div><p class='source'>資料來源：<br>${sourceText}</p>`,init:initDataCenterLoadTool}, power:{title:'預估耗電量',subtitle:'依機櫃數量、單櫃功率、機房面積與 380V 三相電力進行容量初步估算。',render:()=>`<div class='grid three'>${field('rw','排數','例如 5','','機櫃排列的排數')}${field('rr','每排機櫃數','例如 10')}${field('rk','每櫃功率 kW','例如 2','','每一櫃 IT 設備功率')}${field('rl','機房長度','例如 13.2')}${field('rwid','機房寬度','例如 10.2')}${field('rh','機房高度','例如 3.0')}${selectField('unit','長寬高單位',`<option value='m'>m</option><option value='cm'>cm</option>`)}${field('pp','人員數','','5')}${field('uf','UPS 發熱係數','','0.09')}${field('df','配電系統發熱係數','','0.03')}${field('ld','照明密度 W/m²','','21.53')}${field('or','其他用電比例','','0.14')}${field('vv','電壓 V','','380')}${field('pf','功率因數 PF','','0.95')}</div><div id='rrr' class='result-box'>-</div><div class='table-wrap'><div id='bars'></div></div><p class='source'>資料來源：<br>${sourceText}</p>`,init:initDataCenterLoadTool},
  dc3:{title:'380V 三相電流概算',subtitle:'依 kW、電壓、PF',render:()=>`<div class='grid two'>${field('p','功率 kW')}${field('v','電壓 V','','380')}${field('pf3','功率因數 PF','','0.95')}</div><div id='r' class='result-box'>-</div>`,init:initCurrentEstimateTool},
  kwi:{title:'kW估算電流',subtitle:'提供單相與三相電流估算。',render:()=>`<div class='grid two'>${field('pk','功率 kW','例如 20')}${field('vk','電壓 V','例如 220')}${field('pfk','功率因數 PF','','0.95')}</div><div id='r' class='result-box'>-</div>`,init:initKwiTool},
  tpow:{title:'三相電力估算',subtitle:'P、V、I、PF',render:()=>`<div class='grid two'>${field('vt','電壓 V')}${field('it','電流 A')}${field('pft','功率因數 PF','','0.95')}</div><div id='r' class='result-box'>-</div>`,init:initThreePhasePowerTool},
  spow:{title:'單相電力估算',subtitle:'P、V、I、PF',render:()=>`<div class='grid two'>${field('vs1','電壓 V')}${field('is1','電流 A')}${field('pfs','功率因數 PF','','0.95')}</div><div id='r' class='result-box'>-</div>`,init:initSinglePhasePowerTool},
  feedback:{title:'意見回饋',subtitle:'回報問題與建議。',render:()=>`<div class='result-box'>hvac-tools-feedback@example.com</div>`,init:initFeedbackTool}
};

function openTool(id){ const cfg=toolRegistry[id]; if(!cfg)return; panel(cfg.title,cfg.subtitle,cfg.render()); cfg.init(); }

renderHome();
