const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { pressureToPa } = require('../src/lib/engineering/unitConversion');
const { getPipeSizeById } = require('../src/lib/engineering/pipeSizing');
const { estimateBasicPressureFlow } = require('../src/lib/engineering/basicPressureFlow');
const { calculateEquipmentCorrection } = require('../src/lib/engineering/equipmentCurveCorrection');

test('initial page title and version', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.ok(html.includes('Web V0.26'));
  const app = fs.readFileSync('app.js', 'utf8');
  assert.ok(app.includes("panel('壓差估算流量'"));
  assert.ok(!app.includes('壓差估算流量（設備修正）'));
});

test('主流程不含進階欄位文字', () => {
  const app = fs.readFileSync('app.js', 'utf8');
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
