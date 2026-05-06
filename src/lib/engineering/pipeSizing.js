const PIPE_TABLE = [
  ['DN15', 'DN15 / 1/2"', 16],
  ['DN20', 'DN20 / 3/4"', 21],
  ['DN25', 'DN25 / 1"', 27],
  ['DN32', 'DN32 / 1-1/4"', 35],
  ['DN40', 'DN40 / 1-1/2"', 41],
  ['DN50', 'DN50 / 2"', 52],
  ['DN65', 'DN65 / 2-1/2"', 67],
  ['DN80', 'DN80 / 3"', 78],
  ['DN100', 'DN100 / 4"', 102],
  ['DN125', 'DN125 / 5"', 128],
  ['DN150', 'DN150 / 6"', 154],
];

const PIPE_SIZE_OPTIONS = PIPE_TABLE.map(([id, label, innerDiameterMm]) => ({ id, label, innerDiameterMm }));

function areaM2FromDiameterMm(innerDiameterMm) {
  const diameterM = innerDiameterMm / 1000;
  return Math.PI * Math.pow(diameterM / 2, 2);
}

function calculateVelocityFromLpmAndDiameter(lpm, innerDiameterMm) {
  const flowM3s = lpm / 60000;
  const areaM2 = areaM2FromDiameterMm(innerDiameterMm);
  return flowM3s / areaM2;
}

function getPipeSizeById(id) {
  const base = PIPE_SIZE_OPTIONS.find((item) => item.id === id) || null;
  if (!base) return null;
  const areaM2 = areaM2FromDiameterMm(base.innerDiameterMm);
  return { ...base, areaM2, maxFlowAt3MsLpm: areaM2 * 3 * 60000 };
}

function getRecommendedPipeForFlow(flowLpm, maxVelocityMs = 3) {
  return PIPE_SIZE_OPTIONS.map((pipe) => ({ ...getPipeSizeById(pipe.id), velocityMs: calculateVelocityFromLpmAndDiameter(flowLpm, pipe.innerDiameterMm) }))
    .find((item) => item.velocityMs <= maxVelocityMs) || null;
}

module.exports = { PIPE_SIZE_OPTIONS, getPipeSizeById, calculateVelocityFromLpmAndDiameter, getRecommendedPipeForFlow };
