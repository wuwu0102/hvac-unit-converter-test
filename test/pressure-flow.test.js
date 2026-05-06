const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const appJs = fs.readFileSync('app.js','utf8');

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
