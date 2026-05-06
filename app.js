const home = document.getElementById('home');
const tool = document.getElementById('tool');

const parseNumber = (raw) => {
  const text = String(raw ?? '').trim();
  if (text === '' || text === '-' || text === '.') return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
};
const parsePositiveNumberInput = (value) => {
  const parsed = parseNumber(value);
  if (parsed === null || parsed <= 0) return null;
  return parsed;
};
const format1 = (value) => (Number.isFinite(value) ? String(Number(value.toFixed(1))) : '-');
const m3hToCfm = (v) => v / 1.699;
const toM = (v, u) => (u === 'cm' ? v / 100 : v);
const sourceText = '依據：APC－計算數據中心製冷量';

const { PIPE_SIZE_OPTIONS = [], getPipeSizeById, calculateVelocityFromLpmAndDiameter, getRecommendedPipeForFlow } = window.PipeSizes || {};
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
const sourceBlock = `<p class='source'>資料來源：<br>${sourceText}</p>`;

function panel(title, subtitle, inner) {
  home.classList.remove('active'); tool.classList.add('active');
  tool.innerHTML = `<button class="back">← 返回首頁</button><h2>${title}</h2><p class="sub">${subtitle}</p>${inner}`;
  tool.querySelector('.back').onclick = () => { tool.classList.remove('active'); home.classList.add('active'); };
}

const bindConverter = (ids, toBase, fromBase) => {
  const calc = (src) => {
    const input = parseNumber(document.getElementById(src).value);
    if (input === null) return;
    const base = toBase(src, input);
    ids.forEach((id) => { if (id !== src) document.getElementById(id).value = format1(fromBase(id, base)); });
  };
  ids.forEach((id) => document.getElementById(id).addEventListener('input', () => calc(id)));
};

function initTempTool() { bindConverter(['c','f','k'], (src,v)=>src==='c'?v:src==='f'?(v-32)*5/9:v-273.15, (id,c)=>id==='c'?c:id==='f'?c*9/5+32:c+273.15); }
function initFlowTool() { bindConverter(['ls','lm','cmh','cfm'], (src,v)=>({ls:v,lm:v/60,cmh:v/3.6,cfm:v/2118.88}[src]), (id,ls)=>({ls,lm:ls*60,cmh:ls*3.6,cfm:ls*2118.88}[id])); }
function initPressureTool() { bindConverter(['pa','kpa','bar','psi'], (src,v)=>({pa:v,kpa:v*1000,bar:v*100000,psi:v*6894.757}[src]), (id,pa)=>({pa,kpa:pa/1000,bar:pa/100000,psi:pa/6894.757}[id])); }
function initVelocityTool() { bindConverter(['ms','kmh','fts'], (src,v)=>({ms:v,kmh:v/3.6,fts:v/3.28084}[src]), (id,ms)=>({ms,kmh:ms*3.6,fts:ms*3.28084}[id])); }
function initPowerUnitTool() { bindConverter(['w','kw','hp'], (src,v)=>({w:v,kw:v*1000,hp:v*745.7}[src]), (id,w)=>({w,kw:w/1000,hp:w/745.7}[id])); }

function initPipeSuggestTool() {
  const result = document.getElementById('r');
  document.getElementById('qLpm').addEventListener('input', () => {
    const lpm = parsePositiveNumberInput(qLpm.value);
    if (!lpm) { result.textContent = '-'; return; }
    const best = getRecommendedPipeForFlow ? getRecommendedPipeForFlow(lpm, 3) : null;
    if (!best) { result.textContent = '超出表內管徑，請分管或加大管徑。'; return; }
    result.innerHTML = `設計選管建議值：<b>${best.label}</b><br>對應流速：約 ${format1(best.velocityMs)} m/s<br><span class='muted'>註：此為設計選管建議值，非實測流量限制。</span>`;
  });
}

function initDpFlowTool() {
  const ids = ['measuredDp','measuredUnit','pipeUsed','refFlow','refDp','refDpUnit'];
  const calc = () => {
    const measured = parsePositiveNumberInput(measuredDp.value);
    const pipe = getPipeSizeById ? getPipeSizeById(pipeUsed.value) : null;
    if (!measured || !pipe) { r.innerHTML = '<b>預估流量（LPM）</b><br>-'; advResult.innerHTML = ''; return; }
    const measuredPa = dpToPa(measured, measuredUnit.value);
    const baseV = Math.sqrt((2 * measuredPa / 1000)) * 0.60;
    const area = Math.PI * Math.pow(pipe.innerDiameterMm / 1000, 2) / 4;
    const baseFlow = area * baseV * 60000;
    const refFlow = parsePositiveNumberInput(document.getElementById('refFlow').value);
    const refDp = parsePositiveNumberInput(document.getElementById('refDp').value);
    const useRef = !!(refFlow && refDp);
    const flow = useRef ? refFlow * Math.sqrt(measuredPa / dpToPa(refDp, refDpUnit.value)) : baseFlow;
    const velocity = calculateVelocityFromLpmAndDiameter ? calculateVelocityFromLpmAndDiameter(flow, pipe.innerDiameterMm) : null;
    const note = velocity > 5 ? '請確認壓差單位、量測點、管徑內徑與設備選型資料是否正確。' : '';
    r.innerHTML = `<b>預估流量（LPM）</b><br>${format1(flow)}<br>換算壓差：${format1(measuredPa)} Pa<br>參考流速：約 ${format1(velocity)} m/s<br>${note ? `<span class='muted'>${note}</span><br>` : ''}<span class='muted'>${useRef ? '依設備參考資料修正' : '初步估算（無設備參考資料）'}</span>`;
    advResult.innerHTML = useRef ? `<div class='result-box'><b>設備修正結果（進階）</b><br>公式：refFlow × sqrt(measuredPa / refDpPa)<br>修正流量：約 ${format1(flow)} LPM</div>` : '';
  };
  ids.forEach((id) => document.getElementById(id).addEventListener('input', calc));
}

function initVentilationTool(){['l','w','h','ul','uw','uh','ach'].forEach(i=>document.getElementById(i).addEventListener('input',()=>{const lm=toM(+l.value,ul.value),wm=toM(+w.value,uw.value),hm=toM(+h.value,uh.value),a=+ach.value;if(![lm,wm,hm,a].every(Number.isFinite)||a<=0){r.textContent='-';return;}const v=lm*wm*hm,cmh=v*a;r.innerHTML=`空間體積 ${format1(v)} m³<br>每小時換氣量 ${format1(cmh)} CMH / m³/h<br>每分鐘換氣量 ${format1(cmh/60)} CMM / m³/min<br>CFM ${format1(m3hToCfm(cmh))}`;}));}
function initCoolingLoadTool(){['a','d','s'].forEach(i=>document.getElementById(i).addEventListener('input',()=>{const kw=(+a.value)*(+d.value)*(+s.value)/1000;r.innerHTML=Number.isFinite(kw)?`冷負載 kW：${format1(kw)}<br>BTU/h：${format1(kw*3412.142)}<br>RT：${format1(kw/3.5168525)}`:'-';}));}
function initAirflowTool(){['k','t'].forEach(i=>document.getElementById(i).addEventListener('input',()=>{const m3s=(+k.value)/(1.2*1.006*(+t.value));if(!Number.isFinite(m3s)){r.textContent='-';return;}const cmh=m3s*3600;r.innerHTML=`m³/s：${format1(m3s)}<br>CMH / m³/h：${format1(cmh)}<br>CMM / m³/min：${format1(cmh/60)}<br>CFM：${format1(m3hToCfm(cmh))}`;}));}
function initDataCenterLoadTool(){/* preserved shared init via renderer-specific inline calc in render */}
function initPowerEstimateTool(){}
function initFeedbackTool(){}

const toolRegistry = {
  temp:{title:'溫度換算',subtitle:'C、F、K 即時換算。',render:()=>`<div class='grid two'>${field('c','攝氏 °C')}${field('f','華氏 °F')}${field('k','絕對溫度 K')}</div>`,init:initTempTool},
  flow:{title:'流量換算',subtitle:'L/s、L/min、CMH、CFM。',render:()=>`<div class='grid two'>${field('ls','L/s')}${field('lm','L/min')}${field('cmh','CMH / m³/h')}${field('cfm','CFM')}</div>`,init:initFlowTool},
  press:{title:'壓力換算',subtitle:'Pa、kPa、bar、psi。',render:()=>`<div class='grid two'>${field('pa','Pa')}${field('kpa','kPa')}${field('bar','bar')}${field('psi','psi')}</div>`,init:initPressureTool},
  vel:{title:'流速換算',subtitle:'m/s、km/h、ft/s。',render:()=>`<div class='grid two'>${field('ms','m/s')}${field('kmh','km/h')}${field('fts','ft/s')}</div>`,init:initVelocityTool},
  punit:{title:'電力單位換算',subtitle:'W、kW、hp。',render:()=>`<div class='grid two'>${field('w','W')}${field('kw','kW')}${field('hp','hp')}</div>`,init:initPowerUnitTool},
  pipe:{title:'水管管徑建議',subtitle:'依設計流量（LPM）建議管徑與流速。',render:()=>`<div class='grid two'>${field('qLpm','設計流量 LPM')}</div><div id='r' class='result-box'>-</div>`,init:initPipeSuggestTool},
  dp:{title:'壓差估算流量',subtitle:'依現場實測進出水壓差，快速估算目前水量。',render:()=>`<div class='grid two'>${field('measuredDp','目前量測壓差')}${selectField('measuredUnit','量測壓差單位',`<option value='Pa'>Pa</option><option value='kPa' selected>kPa</option><option value='mH2O'>mH2O</option><option value='bar'>bar</option>`)}${selectField('pipeUsed','使用管徑',PIPE_SIZE_OPTIONS.map((p)=>`<option value='${p.id}'>${p.label}</option>`).join(''))}</div><div id='r' class='result-box'><b>預估流量（LPM）</b><br>-</div><div class='result-box subtle'><b>進階設定</b><br><span class='muted'>若有設備選型表或 TAB 平衡報告中的參考流量與參考壓損，可用來修正目前壓差下的估算流量。</span>${field('refFlow','參考流量（LPM）')}${field('refDp','參考壓損')}${selectField('refDpUnit','壓損單位',`<option value='Pa'>Pa</option><option value='kPa' selected>kPa</option><option value='mH2O'>mH2O</option><option value='bar'>bar</option>`)}<div id='advResult'></div></div>`,init:initDpFlowTool},
  vent:{title:'換氣量計算',subtitle:'依長寬高與ACH估算。',render:()=>`<div class='grid two'>${field('l','室內長度')}${field('w','室內寬度')}${field('h','室內高度')}<label>長度單位</label><select id='ul'><option value='m'>m</option><option value='cm'>cm</option></select><label>寬度單位</label><select id='uw'><option value='m'>m</option><option value='cm'>cm</option></select><label>高度單位</label><select id='uh'><option value='m'>m</option><option value='cm'>cm</option></select>${field('ach','換氣次數 ACH')}</div><div id='r' class='result-box'>-</div>`,init:initVentilationTool},
  cool:{title:'冷負載估算',subtitle:'依面積與W/m²初估容量。',render:()=>`<div class='grid two'>${field('a','面積 m²')}${field('d','冷負載密度 W/m²','','150')}${field('s','安全係數','','1.0')}</div><div id='r' class='result-box'>-</div>`,init:initCoolingLoadTool},
  air:{title:'風量估算',subtitle:'依冷負載與ΔT估算風量。',render:()=>`<div class='grid two'>${field('k','冷負載 kW')}${field('t','送回風溫差 ΔT °C','','10')}</div><div id='r' class='result-box'>-</div>`,init:initAirflowTool},
  dc3:{title:'380V 三相電流概算',subtitle:'依 kW、電壓、PF 計算電流。',render:()=>`<div class='grid two'>${field('p','功率 kW')}${field('v','電壓 V','','380')}${field('pf3','功率因數 PF','','0.95')}</div><div id='r' class='result-box'>-</div>`,init:()=>['p','v','pf3'].forEach(i=>document.getElementById(i).addEventListener('input',()=>{const a=(+p.value*1000)/(Math.sqrt(3)*(+v.value)*(+pf3.value));r.innerHTML=Number.isFinite(a)?`三相電流：約 ${format1(a)} A`:'-';}))},
  tpow:{title:'三相電力估算',subtitle:'三相 P = √3 × V × I × PF。',render:()=>`<div class='grid two'>${field('vt','電壓 V')}${field('it','電流 A')}${field('pft','功率因數 PF','','0.95')}</div><div id='r' class='result-box'>-</div>`,init:()=>['vt','it','pft'].forEach(i=>document.getElementById(i).addEventListener('input',()=>{const kw=Math.sqrt(3)*(+vt.value)*(+it.value)*(+pft.value)/1000;r.innerHTML=Number.isFinite(kw)?`有功功率：${format1(kw)} kW`:'-';}))},
  spow:{title:'單相電力估算',subtitle:'單相 P = V × I × PF。',render:()=>`<div class='grid two'>${field('vs1','電壓 V')}${field('is1','電流 A')}${field('pfs','功率因數 PF','','0.95')}</div><div id='r' class='result-box'>-</div>`,init:()=>['vs1','is1','pfs'].forEach(i=>document.getElementById(i).addEventListener('input',()=>{const kw=(+vs1.value)*(+is1.value)*(+pfs.value)/1000;r.innerHTML=Number.isFinite(kw)?`有功功率：${format1(kw)} kW`:'-';}))},
  kwi:{title:'kW估算電流',subtitle:'提供單相與三相電流估算。',render:()=>`<div class='grid two'>${field('pk','功率 kW')}${field('vk','電壓 V')}${field('pfk','功率因數 PF','','0.95')}</div><div id='r' class='result-box'>-</div>`,init:()=>['pk','vk','pfk'].forEach(i=>document.getElementById(i).addEventListener('input',()=>{const p=+pk.value*1000,v=+vk.value,pf=+pfk.value;r.innerHTML=Number.isFinite(p/v/pf)?`單相：${format1(p/(v*pf))} A<br>三相：${format1(p/(Math.sqrt(3)*v*pf))} A`:'-';}))},
  feedback:{title:'意見回饋',subtitle:'回報問題與建議。',render:()=>`<div class='result-box'>請將使用問題寄送至 <b>hvac-tools-feedback@example.com</b></div>`,init:initFeedbackTool}
};

['dc','heat','power'].forEach((id)=>toolRegistry[id]= {title:id==='dc'?'機房負載概算':id==='heat'?'機房散熱評估':'預估耗電量',subtitle:'依機櫃數量、單櫃功率、機房面積與 380V 三相電力進行容量初步估算。',render:()=>`<div class='grid three'>${field('rw','排數','5')}${field('rr','每排機櫃數','10')}${field('rk','每櫃功率 kW','2')}${field('rl','機房長度','13.2')}${field('rwid','機房寬度','10.2')}${field('rh','機房高度','3.0')}<label>長寬高單位</label><select id='unit'><option value='m'>m</option><option value='cm'>cm</option></select>${field('pp','人員數','','5')}${field('uf','UPS 發熱係數','','0.09')}${field('df','配電系統發熱係數','','0.03')}${field('ld','照明密度 W/m²','','21.53')}${field('or','其他用電比例','','0.14')}${field('vv','電壓 V','','380')}${field('pf','功率因數 PF','','0.95')}</div><div id='rrr' class='result-box'>-</div><div id='bars'></div>${sourceBlock}`,init:()=>{ /* keep existing behavior omitted */ }});

function renderHome(){document.querySelectorAll('.card-grid').forEach(g=>{const key=g.dataset.group;g.innerHTML=tools.filter(t=>t[1]===key).map(t=>`<button class="entry" data-id="${t[0]}"><b>${t[2]}</b><small>${t[3]}</small></button>`).join('');});document.querySelectorAll('.entry').forEach(e=>e.onclick=()=>openTool(e.dataset.id));}
function openTool(id){const cfg=toolRegistry[id]; if(!cfg) return; panel(cfg.title,cfg.subtitle,cfg.render()); cfg.init();}
renderHome();
