const { pressureToPa } = require('./unitConversion');
const { getPipeSizeById, calculateVelocityFromLpmAndDiameter } = require('./pipeSizing');

function estimateBasicPressureFlow(measuredDpValue, measuredDpUnit, pipeId) {
  if (!Number.isFinite(measuredDpValue) || measuredDpValue <= 0) return null;
  const pipe = getPipeSizeById(pipeId);
  if (!pipe) return null;
  const dpPa = pressureToPa(measuredDpValue, measuredDpUnit);
  if (!Number.isFinite(dpPa) || dpPa <= 0) return null;
  const velocityMs = Math.sqrt((2 * dpPa) / 1000) * 0.60;
  const flowLpm = pipe.areaM2 * velocityMs * 60000;
  if (!Number.isFinite(flowLpm) || flowLpm <= 0) return null;
  return { flowLpm, velocityMs, pipe, dpPa, pipeMaxFlowAt3MsLpm: pipe.maxFlowAt3MsLpm };
}

module.exports = { estimateBasicPressureFlow };
