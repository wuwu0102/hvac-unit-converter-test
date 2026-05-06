const PIPE_TABLE = [
  ['DN15', '15A', 16],
  ['DN20', '20A', 21],
  ['DN25', '25A', 27],
  ['DN32', '32A', 35],
  ['DN40', '40A', 41],
  ['DN50', '50A', 52],
  ['DN65', '65A', 67],
  ['DN80', '80A', 78],
  ['DN100', '100A', 102],
  ['DN125', '125A', 128],
  ['DN150', '150A', 154],
];

const PIPE_SIZE_OPTIONS = PIPE_TABLE.map(([id, nominalA, innerDiameterMm]) => ({ id, nominalA, label: nominalA, innerDiameterMm, displayName: `${nominalA}（${id}）` }));

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
