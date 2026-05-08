const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const appJs = fs.readFileSync('app.js','utf8');
const pipeSizes = require('../src/data/pipeSizes.js');

test('app.js 功能完整性',()=>{
  assert.ok(!appJs.includes('omitted for brevity'));
  assert.ok(!appJs.includes('保留入口'));
  assert.match(appJs,/function initDcSharedTool\(\)\{const calc=/);
  assert.ok(appJs.includes('kwi:{title'));
  assert.ok(appJs.includes('電源型式')); assert.ok(appJs.includes('估算電流：約'));
});

test('kW估算電流包含完整輸入與輸出',()=>{
  ['pk','vk','pfk','powerTypeK'].forEach((id)=>assert.ok(appJs.includes(`'${id}'`)));
  assert.ok(appJs.includes("field('vk','電壓 V','例如 380','380')"));
  assert.ok(appJs.includes("field('pfk','功率因數 PF','','0.95')"));
  assert.ok(appJs.includes("<option value='three' selected>三相</option><option value='single'>單相</option>"));
  assert.ok(appJs.includes("I = P × 1000 / (√3 × V × PF)"));
  assert.ok(appJs.includes("I = P × 1000 / (V × PF)"));
});





test('kW估算電流三相與單相計算值正確且切換可更新',()=>{
  const kw = 20;
  const pf = 0.95;
  const threePhaseCurrent = kw * 1000 / (Math.sqrt(3) * 380 * pf);
  const singlePhaseCurrent = kw * 1000 / (220 * pf);

  assert.ok(Math.abs(threePhaseCurrent - 32) < 0.2);
  assert.ok(Math.abs(singlePhaseCurrent - 95.7) < 0.2);
  assert.notEqual(format1(threePhaseCurrent), format1(singlePhaseCurrent));

  assert.ok(appJs.includes("powerType=powerTypeK.value"));
  assert.ok(appJs.includes("powerType==='three'?p/(Math.sqrt(3)*v*pf):p/(v*pf)"));
});
test('首頁分類調整：A~F 順序正確且電力僅保留 kW估算電流',()=>{
  assert.ok(appJs.includes("['dc','A','機房 / 資料中心整合估算','負載、散熱、用電容量、建議配置與 PUE']"));
  assert.ok(appJs.includes("['vent','B','換氣量計算','依長寬高與ACH估算 CMH / CMM / CFM']"));
  assert.ok(appJs.includes("['cool','B','冷負載估算','依長寬與模式初估容量']"));
  assert.ok(appJs.includes("['pipe','C','水管管徑建議','依流量與流速建議管徑']"));
  assert.ok(appJs.includes("['dp','C','壓差估算流量','依ΔP快速估算流量']"));
  assert.ok(appJs.includes("['kwi','D','kW估算電流','單相/三相電流估算']"));
  assert.ok(appJs.includes("['temp','E','溫度換算','°C / °F / K']"));
  assert.ok(appJs.includes("['feedback','F','意見回饋','回饋建議與需求']"));
  assert.ok(!appJs.includes("['heat','D','機房散熱評估'"));
  assert.ok(!appJs.includes("['power','D','預估用電容量 / NFB 估算'"));
  assert.ok(!appJs.includes("['dc3','D','380V 三相電流概算'"));
  assert.ok(!appJs.includes("['tpow','E','三相電力估算','P、V、I、PF關係']"));
  assert.ok(!appJs.includes("['spow','E','單相電力估算','P、V、I、PF關係']"));
  assert.ok(!appJs.includes('風量估算'));
  assert.ok(!appJs.includes('依冷負載與ΔT估算風量'));
});

test('機房工具輸出完整四段',()=>{
  ['A. 機房空間','B. 散熱評估','C. 預估用電容量 / NFB 估算','D. 建議配置','E. 散熱比例圖','F. 總用電比例圖','G. 理論 PUE'].forEach((k)=>assert.ok(appJs.includes(k)));
  assert.ok(appJs.includes("dc:{title:'機房 / 資料中心整合估算'"));
  ['heat:{title','power:{title','dc3:{title'].forEach((k)=>assert.ok(!appJs.includes(k)));
});



test('機房負載概算供電與建議級距邏輯正確',()=>{
  const rows = 5;
  const per = 4;
  const rackKw = 10;
  const upsFactor = 0.09;
  const distFactor = 0.03;
  const area = 200;
  const lightDensity = 21.53;
  const people = 5;
  const voltage = 380;
  const pf = 0.95;

  const itLoadKw = rows * per * rackKw;
  const upsLossKw = itLoadKw * upsFactor;
  const distKw = itLoadKw * distFactor;
  const lightKw = area * lightDensity / 1000;
  const peopleKw = people * 0.1;
  const totalHeatKw = itLoadKw + upsLossKw + distKw + lightKw + peopleKw;
  const totalHeatRt = totalHeatKw / 3.5168525;
  const itUpsSupplyKw = itLoadKw + upsLossKw;
  const chillerKw = totalHeatRt * 0.65;
  const coolingTowerKw = totalHeatRt * 0.03;
  const chwPumpKw = totalHeatRt * 0.05;
  const cwPumpKw = totalHeatRt * 0.05;
  const ahuFanKw = totalHeatRt * 0.08;
  const hvacPowerKw = chillerKw + coolingTowerKw + chwPumpKw + cwPumpKw + ahuFanKw;
  const totalCurrentA = (itUpsSupplyKw + hvacPowerKw + itLoadKw * 0.14) * 1000 / (Math.sqrt(3) * voltage * pf);

  assert.equal(format1(totalHeatKw), '228.8');
  assert.equal(format1(totalHeatRt), '65.1');
  assert.equal(Math.ceil(totalHeatRt / 5) * 5, 70);
  assert.ok(Math.abs(totalCurrentA - 482.9) < 5);

  assert.ok(appJs.includes('空調總用電'));
  assert.ok(appJs.includes('空調冷卻容量'));
  assert.ok(appJs.includes('${format1(totalHeatKw)} kW / ${format1(totalHeatRt)} RT'));
  assert.ok(appJs.includes('recommendedCoolingRt=roundUpToMultiple(totalHeatRt,5)'));
  ['冰水主機','冷卻水塔','冰水泵','冷卻水泵','空調箱 / 風機'].forEach((text)=>assert.ok(appJs.includes(text)));
  assert.ok(appJs.includes('空調總用電組成'));
  assert.ok(appJs.includes('facilityTotalKw/it'));
  assert.ok(appJs.includes('理論 PUE'));
  assert.ok(!appJs.includes('recommendedCoolingRt=roundUpToMultiple(coolingRt,5)'));
  assert.ok(appJs.includes("[['IT + UPS 損耗',itUpsSupply],['空調總用電',totalCoolingPowerKw],['其他基礎設施用電',otherInfrastructureKw],['合計',tp]]"));
  assert.ok(appJs.includes('散熱比例圓餅圖'));
  assert.ok(appJs.includes('pie-legend'));
  ['IT 設備','UPS 損耗','配電系統','照明設施','人員'].forEach((text)=>assert.ok(appJs.includes(text)));
});

test('壓差估算主結果僅顯示現場初估三項資訊且不含工程細節',()=>{
  assert.ok(appJs.includes('A. 現場初估'));
  assert.ok(appJs.includes('壓差推估流量：約 ${format1(displayFlowLpm)} LPM'));
    assert.ok(appJs.includes('性質：依目前壓差與管徑推估，非流量計實測值。'));
  assert.ok(appJs.includes('提醒：實際流量請以流量計、TAB 平衡報告或設備量測資料為準。'));
  ['理論粗估流速','建議流速 1.0','建議流速 2.5','警戒流速 3.0','管徑內徑','換算過程','查看工程細節'].forEach((text)=>{
    assert.ok(!appJs.includes(text));
  });
});

test('設備參考點修正顯示結果與判讀且不顯示公式',()=>{
  assert.ok(appJs.includes('設備參考點修正'));
  assert.ok(appJs.includes('修正推估流量：約 ${format1(correctedFlowLpm)} LPM'));
  assert.ok(appJs.includes('性質：依參考流量與參考壓損修正之推估值'));
  assert.ok(appJs.includes('提醒：仍需以流量計或 TAB 資料確認'));
  assert.ok(!appJs.includes('correctedFlowLpm = referenceFlowLpm × √(measuredDpPa / referenceDpPa)'));
  assert.ok(!appJs.includes('請先輸入參考流量'));
});

test('管徑表包含 15A 到 400A 且 5000 LPM 可回傳建議',()=>{
  const labels = pipeSizes.PIPE_SIZE_OPTIONS.map((item) => item.label);
  ['15A','20A','25A','32A','40A','50A','65A','80A','100A','125A','150A','200A','250A','300A','350A','400A'].forEach((label)=>assert.ok(labels.includes(label)));
  assert.equal(pipeSizes.getPipeSizeById('DN32').innerDiameterMm,35.1);
  assert.equal(pipeSizes.getPipeSizeById('DN100').innerDiameterMm,102.3);
  const recommend = pipeSizes.getRecommendedPipeForFlow(5000, 3);
  assert.ok(recommend);
  assert.ok(labels.includes(recommend.label));
  assert.ok(!appJs.includes('請分管'));
  assert.ok(!appJs.includes('超出表內管徑'));
  assert.ok(appJs.includes('超出表內最大管徑（400A）'));
});

test('壓差估算管徑下拉包含 400A',()=>{
  const hasDn400 = pipeSizes.PIPE_SIZE_OPTIONS.some((item) => item.id === 'DN400');
  assert.ok(hasDn400);
  assert.ok(appJs.includes('使用管徑'));
});

test('25A + 0.5 bar 會限幅並顯示輸入條件複核提醒',()=>{
  const pipe = pipeSizes.getPipeSizeById('DN25');
  const area = Math.PI * Math.pow(pipe.innerDiameterMm / 1000, 2) / 4;
  const flowAt25 = area * 2.5 * 60000;
  const measuredPa = 0.5 * 100000;
  const v = Math.sqrt((2 * measuredPa / 1000)) * 0.60;
  const rawFlowLpm = area * v * 60000;
  const rawVelocity = pipeSizes.calculateVelocityFromLpmAndDiameter(rawFlowLpm, pipe.innerDiameterMm);

  assert.equal(format1(flowAt25), '83.4');
  assert.equal(format1(rawFlowLpm), '200.1');
  assert.equal(format1(rawVelocity), '6');
  assert.ok(rawVelocity > 3);
  assert.ok(appJs.includes('提醒：此推估值對輸入條件較敏感，請確認壓差單位、量測點與管徑是否正確。'));
  assert.ok(!appJs.includes('建議流速 1.0 m/s 對應流量'));
});



test('壓差估算結果不得包含合理與偏高偏低判讀字眼',()=>{
  ['合理流量','合理水量','正常空調水系統通常不會','不宜直接視為合理水量','判讀：合理','判讀：偏高','判讀：異常'].forEach((text)=>{
    assert.ok(!appJs.includes(text));
  });
});
function format1(value){
  return Number.isFinite(value) ? String(Number(value.toFixed(1))) : '-';
}

test('TAV 型錄案例流速應落在約 1～2 m/s 區間（允許約略誤差）',()=>{
  const cases = [
    { lpm: 50, pipeId: 'DN32' },
    { lpm: 100, pipeId: 'DN40' },
    { lpm: 300, pipeId: 'DN65' },
  ];
  cases.forEach(({ lpm, pipeId }) => {
    const pipe = pipeSizes.getPipeSizeById(pipeId);
    const velocity = pipeSizes.calculateVelocityFromLpmAndDiameter(lpm, pipe.innerDiameterMm);
    assert.ok(velocity >= 0.8 && velocity <= 2.2, `${pipe.label} @ ${lpm}LPM velocity=${velocity}`);
  });
});


test('冷負載估算改為長寬與模式切換，且不得有安全係數欄位',()=>{
  assert.ok(appJs.includes("field('cl','長度'"));
  assert.ok(appJs.includes("field('cw','寬度'"));
  assert.ok(appJs.includes("<option value='ft'>ft</option>"));
  assert.ok(appJs.includes("冷負載估算方式"));
  assert.ok(appJs.includes('使用估算方式'));
  assert.ok(!appJs.includes("field('s','安全係數'"));
});

test('冷負載估算 10m x 10m @ 150W/m² 計算正確',()=>{
  const areaM2 = 10 * 10;
  const ping = areaM2 / 3.3058;
  const kw = areaM2 * 150 / 1000;
  const rt = kw / 3.5168525;
  assert.equal(format1(areaM2), '100');
  assert.equal(format1(ping), '30.2');
  assert.equal(format1(kw), '15');
  assert.equal(format1(rt), '4.3');
});

test('冷負載估算 10m x 10m @ 4坪/RT 計算正確',()=>{
  const ping = (10 * 10) / 3.3058;
  const rt = ping / 4;
  assert.equal(format1(ping), '30.2');
  assert.equal(format1(rt), '7.6');
});

test('冷負載估算 ft 單位可正確換算面積 m²',()=>{
  const m = 0.3048;
  const areaM2 = (10 * m) * (10 * m);
  assert.equal(format1(areaM2), '9.3');
});


test('NFB recommendation applies 1.2 safety factor before selecting step',()=>{
  const roundUpToStep=(value,steps)=>steps.find((s)=>s>=value)??steps[steps.length-1];
  const totalCurrentA=539.8;
  const nfbDesignCurrentA=totalCurrentA*1.2;
  const steps=[50,75,100,125,150,175,200,225,250,300,350,400,500,600,700,800,1000,1200];
  assert.equal(nfbDesignCurrentA.toFixed(1),'647.8');
  assert.equal(roundUpToStep(nfbDesignCurrentA,steps),700);
  assert.ok(appJs.includes('nfbDesignCurrentA=totalCurrentA*1.2'));
  assert.ok(appJs.includes('NFB 建議值已先乘 1.2 安全係數後再向上取常用級距。'));
});

test('F and G use otherInfrastructureKw consistently and no 其他輔助用電 label',()=>{
  assert.ok(appJs.includes("powerParts=[['IT + UPS 損耗',itUpsSupply],['空調總用電',totalCoolingPowerKw],['其他基礎設施用電',otherInfrastructureKw]]"));
  assert.ok(appJs.includes('facilityTotalKw=itUpsSupply+totalCoolingPowerKw+otherInfrastructureKw'));
  assert.ok(appJs.includes("['其他基礎設施用電',`${format1(otherInfrastructureKw)} kW`]"));
  assert.ok(!appJs.includes('其他輔助用電'));
  assert.ok(appJs.includes('pue=it>0?facilityTotalKw/it:null'));
});
