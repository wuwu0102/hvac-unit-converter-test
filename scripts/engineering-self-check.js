const assert = require('assert');
const { calculateVelocityFromLpmAndDiameter } = require('../src/data/pipeSizes');

const dpToPa = (v, u) => ({ Pa: v, kPa: v * 1000, mH2O: v * 9806.65, bar: v * 100000 }[u]);
const estimateFlow = (refFlow, measuredPa, refDpPa) => refFlow * Math.sqrt(measuredPa / refDpPa);

const v = calculateVelocityFromLpmAndDiameter(100, 53);
assert(Number.isFinite(v) && v > 0, 'DN50 + 100 LPM must return finite velocity');
assert.strictEqual(calculateVelocityFromLpmAndDiameter('x', 53), null);
assert.strictEqual(calculateVelocityFromLpmAndDiameter(100, 0), null);
assert.strictEqual(calculateVelocityFromLpmAndDiameter(-1, 53), null);

assert.strictEqual(dpToPa(1, 'bar'), 100000);
assert.strictEqual(dpToPa(1, 'kPa'), 1000);
assert.strictEqual(dpToPa(1, 'Pa'), 1);
assert.strictEqual(dpToPa(1, 'mH2O'), 9806.65);

const f = estimateFlow(300, 25000, 30000);
assert(Number.isFinite(f) && f > 0, 'estimated flow formula should return finite value');
console.log('Engineering self-check passed.');
