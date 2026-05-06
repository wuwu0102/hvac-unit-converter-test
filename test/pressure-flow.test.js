const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { pressureToPa } = require('../src/lib/engineering/unitConversion');
const { getPipeSizeById } = require('../src/lib/engineering/pipeSizing');
const { estimateBasicPressureFlow } = require('../src/lib/engineering/basicPressureFlow');
const { calculateEquipmentCorrection } = require('../src/lib/engineering/equipmentCurveCorrection');

test('initial page title and version', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.ok(html.includes('Web V0.27'));
  const app = fs.readFileSync('app.js', 'utf8');
  assert.ok(app.includes("panel('壓差估算流量'"));
  assert.ok(!app.includes('壓差估算流量（設備修正）'));
});

test('主流程文案與進階公式位置正確', () => {
  const app = fs.readFileSync('app.js', 'utf8');
  assert.ok(app.includes('依現場實測進出水壓差與管徑，快速估算空調設備目前水量，供運轉檢查與初步判讀使用。'));
  assert.ok(app.includes('進階設定：設備已知條件（可選）'));
  assert.ok(app.includes('公式：refFlow × sqrt(measuredPa / refDpPa)'));
});

test('pipe label default style 15A', () => {
  const dn15 = getPipeSizeById('DN15');
  assert.equal(dn15.label, '15A');
  assert.equal(dn15.innerDiameterMm, 16);
});

test('basic flow placeholder behavior', () => {
  assert.equal(estimateBasicPressureFlow(null, 'kPa', 'DN15'), null);
  assert.equal(estimateBasicPressureFlow(0, 'kPa', 'DN15'), null);
  assert.equal(estimateBasicPressureFlow(-1, 'kPa', 'DN15'), null);
});

test('basic flow formula works', () => {
  const result = estimateBasicPressureFlow(0.5, 'kPa', 'DN25');
  assert.ok(result.flowLpm > 0);
  assert.ok(result.velocityMs > 0);
});

test('equipment correction needs complete advanced data', () => {
  const pipe = getPipeSizeById('DN25');
  assert.equal(calculateEquipmentCorrection({ measuredDpPa: 50000, referenceFlowLpm: null, referenceDpValue: 30, referenceDpUnit: 'Pa', selectedPipe: pipe }), null);
});

test('auto correction 30 Pa -> 30 kPa exists', () => {
  const pipe = getPipeSizeById('DN25');
  const corrected = calculateEquipmentCorrection({ measuredDpPa: 50000, referenceFlowLpm: 300, referenceDpValue: 30, referenceDpUnit: 'Pa', selectedPipe: pipe, disableAutoCorrection: false });
  assert.equal(corrected.displayReferenceDpUnit, 'kPa');
  assert.equal(corrected.wasAutoCorrected, true);
});

test('disable auto correction keeps abnormal result with warning flag', () => {
  const pipe = getPipeSizeById('DN25');
  const raw = calculateEquipmentCorrection({ measuredDpPa: 50000, referenceFlowLpm: 300, referenceDpValue: 30, referenceDpUnit: 'Pa', selectedPipe: pipe, disableAutoCorrection: true });
  assert.equal(raw.wasAutoCorrected, false);
  assert.ok(raw.correctedFlowLpm > 10000);
  assert.equal(raw.strongWarning, true);
});

test('unit conversion', () => {
  assert.equal(pressureToPa(0.5, 'bar'), 50000);
});


test('主結果不顯示設計選管徑語意', () => {
  const app = fs.readFileSync('app.js', 'utf8');
  const dpSection = app.slice(app.indexOf("if(id==='dp')"), app.indexOf("if(id==='vent')"));
  assert.ok(!dpSection.includes('3 m/s 建議上限'));
  assert.ok(!dpSection.includes('管徑合理性'));
  assert.ok(!dpSection.includes('建議管徑'));
});

test('高流速提醒改為中性確認文字', () => {
  const app = fs.readFileSync('app.js', 'utf8');
  assert.ok(app.includes('流速較高，請確認量測點、壓差單位、管徑內徑與設備型式是否正確。'));
  assert.ok(app.includes('估算流速非常高，建議優先確認壓差單位、量測點與管徑選擇是否正確。'));
  assert.ok(!app.includes('管徑不合理'));
});
