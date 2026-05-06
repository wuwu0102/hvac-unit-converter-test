const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const appJs = fs.readFileSync('app.js','utf8');
const indexHtml = fs.readFileSync('index.html','utf8');

test('首頁 smoke: 工具入口與返回首頁存在',()=>{
  ['data-group="A"','data-group="F"'].forEach(t=>assert.ok(indexHtml.includes(t)));
  assert.ok(appJs.includes('toolRegistry'));
  assert.ok(appJs.includes('function openTool(id)'));
  assert.ok(appJs.includes('← 返回首頁'));
});

test('單位換算 regression handlers exist',()=>{
  ['initTempTool','initFlowTool','initPressureTool','initVelocityTool','initPowerUnitTool'].forEach(n=>assert.ok(appJs.includes(`function ${n}(`)));
});

test('水管管徑建議規則',()=>{
  assert.ok(appJs.includes('3 m/s 僅作為設計選管建議值'));
  assert.ok(appJs.includes('超出表內管徑，請分管或加大管徑。'));
  assert.ok(appJs.includes('getRecommendedPipeForFlow(lpm,3)'));
});

test('壓差估算流量規則',()=>{
  assert.ok(appJs.includes('correctedFlowLpm = refFlowLpm × √(measuredPa / refDpPa)') || appJs.includes('refFlowLpm'));
  assert.ok(appJs.includes('參考流速'));
  assert.ok(!appJs.includes('不能算'));
});
