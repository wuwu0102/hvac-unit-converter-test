const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { getRecommendedPipeForFlow, calculateVelocityFromLpmAndDiameter } = require('../src/data/pipeSizes.js');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const indexHtml = read('index.html');
const appJs = read('app.js');

const ids = ['temp','flow','press','vel','punit','pipe','dp','vent','cool','air','dc','heat','power','dc3','kwi','tpow','spow','feedback'];

test('首頁 smoke: 入口與初始化存在', () => {
  assert.match(indexHtml, /data-group="A"/);
  assert.match(indexHtml, /data-group="F"/);
  ids.forEach((id) => assert.match(appJs, new RegExp(`\\['${id}'`)));
  assert.match(appJs, /function openTool\(id\)/);
  assert.match(appJs, /const toolRegistry =/);
});

test('單位換算 regression: 核心轉換常數存在', () => {
  ['2118.88', '6894.757', '3.28084', '745.7'].forEach((n) => assert.ok(appJs.includes(n)));
});

test('水管管徑建議: 超大流量不崩潰且有超出提示', () => {
  assert.equal(getRecommendedPipeForFlow(5000, 3), null);
  assert.ok(appJs.includes('超出表內管徑，請分管或加大管徑。'));
  assert.ok(appJs.includes('設計選管建議值'));
});

test('壓差估算流量: 不使用 3m/s 作為阻擋條件，且有平方根修正公式', () => {
  assert.ok(!appJs.includes('超過建議上限'));
  assert.match(appJs, /Math\.sqrt\(measuredPa \/ dpToPa\(refDp/);
  assert.ok(appJs.includes('初步估算（無設備參考資料）'));
});

test('壓差單位換算支援 Pa/kPa/mH2O/bar', () => {
  ['Pa','kPa','mH2O','bar'].forEach((u) => assert.ok(appJs.includes(u)));
});

test('新增功能 smoke: 進入點存在且可初始化', () => {
  ['initVentilationTool','initCoolingLoadTool','initAirflowTool','initDataCenterLoadTool','initPowerEstimateTool'].forEach((fn)=>assert.ok(appJs.includes(`function ${fn}`)));
});

test('管徑資料單一來源', () => {
  assert.ok(appJs.includes('window.PipeSizes'));
  assert.equal((appJs.match(/PIPE_SIZE_OPTIONS/g) || []).length >= 1, true);
  const v = calculateVelocityFromLpmAndDiameter(300, 41);
  assert.ok(v > 0);
});
