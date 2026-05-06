const test = require('node:test');
const assert = require('node:assert/strict');
const { pressureToPa } = require('../src/lib/engineering/unitConversion');
const { analyzePressureFlowInput } = require('../src/lib/engineering/pressureFlow');
const { getPipeSizeById, calculateVelocityFromLpmAndDiameter, getRecommendedPipeForFlow } = require('../src/lib/engineering/pipeSizing');

test('unit conversion', () => {
  assert.equal(pressureToPa(0.5, 'bar'), 50000);
  assert.equal(pressureToPa(30, 'kPa'), 30000);
  assert.equal(pressureToPa(30, 'Pa'), 30);
});

test('formula and dn25 velocity', () => {
  const flow = 300 * Math.sqrt(50000 / 30000);
  assert.ok(Math.abs(flow - 387.3) < 0.2);
  const dn25 = getPipeSizeById('DN25');
  const v = calculateVelocityFromLpmAndDiameter(flow, dn25.innerDiameterMm);
  assert.ok(Math.abs(v - 11.3) < 0.3);
  assert.ok(Math.abs(dn25.maxFlowAt3MsLpm - 103) < 2);
});

test('auto correction and advanced mode', () => {
  const base = { measuredDpValue: 0.5, measuredDpUnit: 'bar', referenceDpValue: 30, referenceDpUnit: 'Pa', referenceFlowLpm: 300, pipeId: 'DN25' };
  const corrected = analyzePressureFlowInput(base);
  assert.equal(corrected.wasAutoCorrected, true);
  assert.equal(corrected.displayReferenceDpUnit, 'kPa');
  assert.equal(corrected.normalizedReferenceDpPa, 30000);
  assert.ok(Math.abs(corrected.estimatedFlowLpm - 387.3) < 0.2);
  assert.ok(corrected.warnings.join(' ').includes('自動判定'));

  const adv = analyzePressureFlowInput({ ...base, disableAutoCorrection: true });
  assert.equal(adv.wasAutoCorrected, false);
  assert.equal(adv.normalizedReferenceDpPa, 30);
  assert.ok(Math.abs(adv.estimatedFlowLpm - 12247.4) < 0.3);
  assert.ok((adv.warnings.join(' ') + adv.errors.join(' ')).includes('極不合理'));
});

test('recommended pipe', () => {
  const rec = getRecommendedPipeForFlow(300, 3);
  assert.notEqual(rec.id, 'DN25');
  assert.ok(['DN40','DN50','DN65','DN80','DN100','DN125','DN150'].includes(rec.id));
});
