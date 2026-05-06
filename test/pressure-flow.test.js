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

test('壓差估算不以 3 m/s 阻擋',()=>{
  assert.ok(appJs.includes('參考流速'));
  assert.ok(appJs.includes('請確認壓差單位、量測點、管徑內徑與設備選型資料是否正確。'));
  assert.ok(!appJs.includes('3 m/s 不可作為壓差估算'));
});

test('管徑表包含 15A 到 400A 且 5000 LPM 可回傳建議',()=>{
  const labels = pipeSizes.PIPE_SIZE_OPTIONS.map((item) => item.label);
  ['15A','20A','25A','32A','40A','50A','65A','80A','100A','125A','150A','200A','250A','300A','350A','400A'].forEach((label)=>assert.ok(labels.includes(label)));
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
