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
  assert.ok(appJs.includes('單相電流')); assert.ok(appJs.includes('三相電流'));
});

test('kW估算電流包含完整輸入與輸出',()=>{
  ['pk','vk','pfk'].forEach((id)=>assert.ok(appJs.includes(`'${id}'`)));
  assert.ok(appJs.includes('p/(v*pf)'));
  assert.ok(appJs.includes('p/(Math.sqrt(3)*v*pf)'));
});

test('機房工具輸出完整四段',()=>{
  ['A. 機房空間','B. 散熱評估','C. 預估耗電量','D. 比例圖'].forEach((k)=>assert.ok(appJs.includes(k)));
  ['dc:{title','heat:{title','power:{title'].forEach((k)=>assert.ok(appJs.includes(k)));
});

test('壓差估算主結果僅顯示現場初估三項資訊且不含工程細節',()=>{
  assert.ok(appJs.includes('A. 現場初估'));
  assert.ok(appJs.includes('壓差推估流量：約 ${format1(displayFlowLpm)} LPM'));
    assert.ok(appJs.includes('性質：依目前壓差與管徑推估，非流量計實測值。'));
  assert.ok(appJs.includes('提醒：實際流量請以流量計、TAB 平衡報告或設備量測資料為準。'));
  ['理論粗估流速','建議流速 1.0','建議流速 2.5','警戒流速 3.0','管徑內徑','換算過程','使用公式','查看工程細節'].forEach((text)=>{
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
  ['合理流量','合理水量','偏高','偏低','異常偏高','正常空調水系統通常不會','不宜直接視為合理水量','判讀：合理','判讀：偏高','判讀：異常'].forEach((text)=>{
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
