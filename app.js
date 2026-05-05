const home = document.getElementById('home');
const tool = document.getElementById('tool');
const F = (v, d = 2) => (Number.isFinite(v) ? Number(v).toFixed(d) : '-');
const m3hToCfm = (v) => v / 1.699;
const toM = (v, u) => (u === 'cm' ? v / 100 : v);
const sourceText = '依據：APC－計算數據中心製冷量';

const tools = [
  ['temp','A','溫度換算','°C / °F / K'], ['flow','A','流量換算','L/s、L/min、CMH、CFM'], ['press','A','壓力換算','Pa / kPa / bar / psi'], ['vel','A','流速換算','m/s、km/h、ft/s'], ['punit','A','電力單位換算','W / kW / hp'],
  ['pipe','B','水管管徑建議','依流量與流速建議管徑'], ['dp','B','壓差估算流量','依ΔP快速估算流量'],
  ['vent','C','換氣量計算','依長寬高與ACH估算 CMH / CMM / CFM'], ['cool','C','冷負載估算','依面積與W/m²初估容量'], ['air','C','風量估算','依冷負載與ΔT估算風量'],
  ['dc','D','機房負載概算','機櫃負載、散熱、耗電與三相電流'], ['heat','D','機房散熱評估','顯示散熱分項與來源'], ['power','D','預估耗電量','顯示耗電分項與來源'], ['dc3','D','380V 三相電流概算','依kW、V、PF估算電流'],
  ['kwi','E','kW估算電流','單相/三相電流估算'], ['tpow','E','三相電力估算','P、V、I、PF關係'], ['spow','E','單相電力估算','P、V、I、PF關係'],
  ['feedback','F','意見回饋','回饋建議與需求']
];

function renderHome(){
  document.querySelectorAll('.card-grid').forEach(g=>{
    const key=g.dataset.group;
    g.innerHTML=tools.filter(t=>t[1]===key).map(t=>`<button class="entry" data-id="${t[0]}"><b>${t[2]}</b><small>${t[3]}</small></button>`).join('');
  });
  document.querySelectorAll('.entry').forEach(e=>e.onclick=()=>openTool(e.dataset.id));
}

const field = (id, label, p='', v='', help='') => `<label for='${id}'>${label}</label><input id='${id}' placeholder='${p}' value='${v}' />${help?`<small class='help'>${help}</small>`:''}`;
const sourceBlock = `<p class='source'>資料來源：<br>${sourceText}</p>`;

function panel(title, subtitle, inner){
  home.classList.remove('active'); tool.classList.add('active');
  tool.innerHTML=`<button class="back">← 返回首頁</button><h2>${title}</h2><p class="sub">${subtitle}</p>${inner}`;
  tool.querySelector('.back').onclick=()=>{tool.classList.remove('active');home.classList.add('active');};
}

function openTool(id){
  if(id==='temp'){panel('溫度換算','C、F、K 即時換算。',`<div class='grid two'>${field('c','攝氏 °C','例如 25')}${field('f','華氏 °F','例如 77')}${field('k','絕對溫度 K','例如 298.15')}</div>`); const calc=(src)=>{const C=+c.value,FV=+f.value,K=+k.value;let cc;if(src==='c')cc=C; if(src==='f')cc=(FV-32)*5/9; if(src==='k')cc=K-273.15; if(!Number.isFinite(cc)) return; c.value=F(cc); f.value=F(cc*9/5+32); k.value=F(cc+273.15);}; ['c','f','k'].forEach(i=>document.getElementById(i).addEventListener('input',()=>calc(i)));}
  if(id==='flow'){panel('流量換算','L/s、L/min、CMH、CFM。',`<div class='grid two'>${field('ls','L/s')}${field('lm','L/min')}${field('cmh','CMH / m³/h')}${field('cfm','CFM')}</div>`); const calc=(src)=>{const raw=+document.getElementById(src).value;if(!Number.isFinite(raw))return;const lsV={ls:raw,lm:raw/60,cmh:raw/3.6,cfm:raw/2118.88}[src];ls.value=F(lsV);lm.value=F(lsV*60);cmh.value=F(lsV*3.6);cfm.value=F(lsV*2118.88)};['ls','lm','cmh','cfm'].forEach(i=>document.getElementById(i).addEventListener('input',()=>calc(i)));}
  if(id==='press'){panel('壓力換算','Pa、kPa、bar、psi。',`<div class='grid two'>${field('pa','Pa')}${field('kpa','kPa')}${field('bar','bar')}${field('psi','psi')}</div>`); const calc=(src)=>{const raw=+document.getElementById(src).value;if(!Number.isFinite(raw))return;const paV={pa:raw,kpa:raw*1000,bar:raw*100000,psi:raw*6894.757}[src];pa.value=F(paV);kpa.value=F(paV/1000);bar.value=F(paV/100000,4);psi.value=F(paV/6894.757)};['pa','kpa','bar','psi'].forEach(i=>document.getElementById(i).addEventListener('input',()=>calc(i)));}
  if(id==='vel'){panel('流速換算','m/s、km/h、ft/s。',`<div class='grid two'>${field('ms','m/s')}${field('kmh','km/h')}${field('fts','ft/s')}</div>`); const calc=(src)=>{const raw=+document.getElementById(src).value;if(!Number.isFinite(raw))return;const msV={ms:raw,kmh:raw/3.6,fts:raw/3.28084}[src];ms.value=F(msV);kmh.value=F(msV*3.6);fts.value=F(msV*3.28084)};['ms','kmh','fts'].forEach(i=>document.getElementById(i).addEventListener('input',()=>calc(i)));}
  if(id==='punit'){panel('電力單位換算','W、kW、hp。',`<div class='grid two'>${field('w','W')}${field('kw','kW')}${field('hp','hp')}</div>`); const calc=(src)=>{const raw=+document.getElementById(src).value;if(!Number.isFinite(raw))return;const wv={w:raw,kw:raw*1000,hp:raw*745.7}[src];w.value=F(wv);kw.value=F(wv/1000);hp.value=F(wv/745.7)};['w','kw','hp'].forEach(i=>document.getElementById(i).addEventListener('input',()=>calc(i)));}
  if(id==='pipe'){panel('水管管徑建議','依流量與設計流速計算建議內徑。',`<div class='grid two'>${field('q','流量 m³/h','例如 12')}${field('vs','設計流速 m/s','例如 1.5')}</div><div id='r' class='result-box'>-</div>`); const calc=()=>{const qm3s=(+q.value)/3600,v=+vs.value;if(!Number.isFinite(qm3s)||!Number.isFinite(v)||v<=0){r.textContent='-';return;}const d=Math.sqrt((4*qm3s)/(Math.PI*v));r.innerHTML=`建議內徑：約 ${F(d*1000)} mm（${F(d)} m）`;};['q','vs'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}
  if(id==='dp'){panel('壓差估算流量','以孔板近似 Q = K√ΔP。',`<div class='grid two'>${field('kcoef','係數 K','例如 2.5')}${field('dpv','壓差 ΔP','例如 16')}</div><div id='r' class='result-box'>-</div>`); const calc=()=>{const q=+kcoef.value*Math.sqrt(+dpv.value);r.innerHTML=Number.isFinite(q)?`估算流量：${F(q)}（依現場係數單位）`:'-';};['kcoef','dpv'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}
  if(id==='vent'){
    panel('換氣量計算','依室內長、寬、高與每小時換氣次數 ACH，估算所需換氣量。',`<div class='grid two'>${field('l','室內長度','例如 13.2')}<label>長度單位</label><select id='ul'><option value='m'>m</option><option value='cm'>cm</option></select>${field('w','室內寬度','例如 10.2')}<label>寬度單位</label><select id='uw'><option value='m'>m</option><option value='cm'>cm</option></select>${field('h','室內高度','例如 3.0')}<label>高度單位</label><select id='uh'><option value='m'>m</option><option value='cm'>cm</option></select>${field('ach','換氣次數 ACH（次/小時）','例如 6','','ACH = Air Changes per Hour，每小時換氣次數')}</div><div id='r' class='result-box'>-</div>`);
    const calc=()=>{const lm=toM(+l.value,ul.value),wm=toM(+w.value,uw.value),hm=toM(+h.value,uh.value),a=+ach.value;if(![lm,wm,hm,a].every(Number.isFinite)||a<=0){r.textContent='-';return;}const v=lm*wm*hm,cmh=v*a;r.innerHTML=`空間體積 ${F(v)} m³<br>每小時換氣量 ${F(cmh)} CMH / m³/h<br>每分鐘換氣量 ${F(cmh/60)} CMM / m³/min<br>CFM ${F(m3hToCfm(cmh))}`};['l','w','h','ul','uw','uh','ach'].forEach(i=>document.getElementById(i).addEventListener('input',calc));
  }
  if(id==='cool'){panel('冷負載估算','依面積與冷負載密度進行空調容量初估，僅供初步評估。',`<div class='grid two'>${field('a','面積 m²','例如 135','','請輸入機房或空調區域面積')}${field('d','冷負載密度 W/m²','','150','一般初估可用 150 W/m²，實際需依設備與用途修正')}${field('s','安全係數','','1.0','一般可用 1.0，需要保守估算可填 1.1～1.3')}</div><div id='r' class='result-box'>-</div>`); const calc=()=>{const kw=(+a.value)*(+d.value)*(+s.value)/1000;if(!Number.isFinite(kw)){r.textContent='-';return;}r.innerHTML=`冷負載 kW：${F(kw)}<br>BTU/h：${F(kw*3412.142)}<br>RT：${F(kw/3.5168525)}`};['a','d','s'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}
  if(id==='air'){panel('風量估算','依冷負載與送回風溫差估算所需空氣量。',`<div class='grid two'>${field('k','冷負載 kW','例如 100','','請輸入空調負載或設備發熱量')}${field('t','送回風溫差 ΔT °C','','10','常用估算可先用 10°C')}</div><div id='r' class='result-box'>-</div>`); const calc=()=>{const m3s=(+k.value)/(1.2*1.006*(+t.value));if(!Number.isFinite(m3s)){r.textContent='-';return;}const cmh=m3s*3600;r.innerHTML=`m³/s：${F(m3s)}<br>CMH / m³/h：${F(cmh)}<br>CMM / m³/min：${F(cmh/60)}<br>CFM：${F(m3hToCfm(cmh))}`};['k','t'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}
  if(['dc','heat','power'].includes(id)){
    const titleMap = { dc: '機房負載概算', heat: '機房散熱評估', power: '預估耗電量' };
    panel(titleMap[id],'依機櫃數量、單櫃功率、機房面積與 380V 三相電力進行容量初步估算。',`<div class='grid three'>${field('rw','排數','例如 5','','機櫃排列的排數')}${field('rr','每排機櫃數','例如 10')}${field('rk','每櫃功率 kW','例如 2','','每一櫃 IT 設備功率')}${field('rl','機房長度','例如 13.2')}${field('rwid','機房寬度','例如 10.2')}${field('rh','機房高度','例如 3.0')}<label>長寬高單位</label><select id='unit'><option value='m'>m</option><option value='cm'>cm</option></select>${field('pp','人員數','','5')}${field('uf','UPS 發熱係數','','0.09','UPS 發熱估算比例')}${field('df','配電系統發熱係數','','0.03','配電盤、線路與相關設備發熱估算比例')}${field('ld','照明密度 W/m²','','21.53','依面積估算照明發熱')}${field('or','其他用電比例','','0.14','其他輔助用電估算比例')}${field('vv','電壓 V','','380')}${field('pf','功率因數 PF','','0.95')}</div><div id='rrr' class='result-box'>-</div><div class='table-wrap'><div id='bars'></div></div>${sourceBlock}`);
  const calc=()=>{const vals=['rw','rr','rk','rl','rwid','rh','pp','uf','df','ld','or','vv','pf'].map(x=>+document.getElementById(x).value);if(!vals.every(Number.isFinite)){rrr.textContent='-';return;}const [rows,per,kw,l,w,h,p,u,dfv,ldv,otherR,v,pff]=vals;const m=unit.value==='cm'?0.01:1, L=l*m,W=w*m,H=h*m,area=L*W,vol=area*H,tr=rows*per,it=tr*kw,ups=it*u,dist=it*dfv,light=area*ldv/1000,people=p*0.1,total=it+ups+dist+light+people,hvac=total*0.4,other=it*otherR,tp=ups+hvac+other,cur=(P)=>P*1000/(Math.sqrt(3)*v*pff);
  rrr.innerHTML=`<h3>A. 機房空間</h3><table><tr><td>排數</td><td>${F(rows)}</td></tr><tr><td>每排機櫃數</td><td>${F(per)}</td></tr><tr><td>總機櫃數</td><td>${F(tr)}</td></tr><tr><td>每櫃 kW</td><td>${F(kw)}</td></tr><tr><td>面積 m²</td><td>${F(area)}</td></tr><tr><td>坪數</td><td>${F(area/3.3058)}</td></tr><tr><td>體積 m³</td><td>${F(vol)}</td></tr></table><h3>B. 散熱評估</h3><table><tr><th>項目</th><th>kW</th><th>RT</th><th>BTU/h</th></tr>${[['IT設備',it],['UPS',ups],['配電系統',dist],['照明設施',light],['人員',people],['合計',total]].map(([n,vv])=>`<tr><td>${n}</td><td>${F(vv)}</td><td>${F(vv/3.5168525)}</td><td>${F(vv*3412.142)}</td></tr>`).join('')}</table><h3>C. 預估耗電量</h3><table><tr><th>項目</th><th>kW</th><th>A</th></tr>${[['UPS',ups],['空調',hvac],['其他',other],['合計',tp]].map(([n,vv])=>`<tr><td>${n}</td><td>${F(vv)}</td><td>${F(cur(vv))}</td></tr>`).join('')}</table>`;
  const parts=[['IT設備',it],['UPS',ups],['配電',dist],['照明',light],['人員',people]];const mx=Math.max(...parts.map(p=>p[1]),1);bars.innerHTML=`<h3>D. 比例圖</h3>${parts.map(([n,val])=>`<div class='bar'><span>${n}</span><i style='width:${(val/mx)*100}%'></i><em>${F(val)}kW</em></div>`).join('')}`;};
  ['rw','rr','rk','rl','rwid','rh','unit','pp','uf','df','ld','or','vv','pf'].forEach(i=>document.getElementById(i).addEventListener('input',calc));
  }
  if(id==='dc3'){panel('380V 三相電流概算','依 kW、電壓、PF 計算電流。',`<div class='grid two'>${field('p','功率 kW','例如 120')}${field('v','電壓 V','','380')}${field('pf3','功率因數 PF','','0.95')}</div><div id='r' class='result-box'>-</div>`); const calc=()=>{const a=(+p.value*1000)/(Math.sqrt(3)*(+v.value)*(+pf3.value));r.innerHTML=Number.isFinite(a)?`三相電流：約 ${F(a)} A`:'-';};['p','v','pf3'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}
  if(id==='kwi'){panel('kW估算電流','提供單相與三相電流估算。',`<div class='grid two'>${field('pk','功率 kW','例如 20')}${field('vk','電壓 V','例如 220')}${field('pfk','功率因數 PF','','0.95')}</div><div id='r' class='result-box'>-</div>`); const calc=()=>{const p=+pk.value*1000,v=+vk.value,pf=+pfk.value;r.innerHTML=Number.isFinite(p/v/pf)?`單相：${F(p/(v*pf))} A<br>三相：${F(p/(Math.sqrt(3)*v*pf))} A`:'-';};['pk','vk','pfk'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}
  if(id==='tpow'){panel('三相電力估算','三相 P = √3 × V × I × PF。',`<div class='grid two'>${field('vt','電壓 V','例如 380')}${field('it','電流 A','例如 120')}${field('pft','功率因數 PF','','0.95')}</div><div id='r' class='result-box'>-</div>`); const calc=()=>{const kw=Math.sqrt(3)*(+vt.value)*(+it.value)*(+pft.value)/1000;r.innerHTML=Number.isFinite(kw)?`有功功率：${F(kw)} kW`:'-';};['vt','it','pft'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}
  if(id==='spow'){panel('單相電力估算','單相 P = V × I × PF。',`<div class='grid two'>${field('vs1','電壓 V','例如 220')}${field('is1','電流 A','例如 40')}${field('pfs','功率因數 PF','','0.95')}</div><div id='r' class='result-box'>-</div>`); const calc=()=>{const kw=(+vs1.value)*(+is1.value)*(+pfs.value)/1000;r.innerHTML=Number.isFinite(kw)?`有功功率：${F(kw)} kW`:'-';};['vs1','is1','pfs'].forEach(i=>document.getElementById(i).addEventListener('input',calc));}
  if(id==='feedback'){panel('意見回饋','回報問題與建議。',`<div class='result-box'>請將使用問題、錯誤畫面與需求寄送至維護窗口：<br><b>hvac-tools-feedback@example.com</b><br>（測試版先以 Email 收集，後續補上表單）</div>`);}
}
renderHome();
