const assert = require('assert');
const { getPipeSizeById } = require('../src/data/pipeSizes');
const { toPa, estimateFlowLpm, buildReferenceDpWarnings } = require('../src/lib/engineering/pressureFlow');
const { calculatePipeMetrics } = require('../src/lib/engineering/pipeSizing');

assert.strictEqual(toPa(0.5, 'bar'), 50000, '0.5 bar must be 50000 Pa');
assert.strictEqual(toPa(30, 'kPa'), 30000, '30 kPa must be 30000 Pa');

const estimatedFlow = estimateFlowLpm({ referenceFlowLpm: 300, measuredDpPa: 50000, referenceDpPa: 30000 });
assert(Math.abs(estimatedFlow - 387.3) < 0.2, 'Estimated flow should be about 387.3 LPM');

const dn25 = getPipeSizeById('DN25');
assert(dn25 && dn25.innerDiameterMm === 27, 'DN25 should use 27 mm estimated inner diameter');

const pipeMetrics = calculatePipeMetrics(estimatedFlow, 'DN25');
assert(Math.abs(pipeMetrics.velocity - 11.28) < 0.1, 'DN25 velocity should be about 11.3 m/s');
assert(Math.abs(pipeMetrics.maxRecommendedFlowLpmAt3ms - 103.0) < 0.6, 'DN25 3 m/s max flow should be about 103 LPM');

const suspiciousWarnings = buildReferenceDpWarnings({ referenceDpInput: 30, referenceDpUnit: 'Pa' });
assert(suspiciousWarnings.some((msg) => msg.includes('30 Pa 非常小')), '30 Pa should trigger suspicious warning');

console.log('Engineering self-check passed.');
