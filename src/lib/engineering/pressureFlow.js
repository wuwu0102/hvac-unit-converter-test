const { pressureToPa } = require('./unitConversion');
const { getPipeSizeById, calculateVelocityFromLpmAndDiameter, getRecommendedPipeForFlow } = require('./pipeSizing');
const { classifyVelocity } = require('./engineeringValidation');

function analyzePressureFlowInput(input) {
  const { measuredDpValue, measuredDpUnit, referenceDpValue, referenceDpUnit, referenceFlowLpm, pipeId, disableAutoCorrection = false } = input;
  const warnings = [];
  const errors = [];
  const autoCorrections = [];
  const selectedPipe = getPipeSizeById(pipeId);
  const normalizedMeasuredDpPa = pressureToPa(measuredDpValue, measuredDpUnit);
  let normalizedReferenceDpPa = pressureToPa(referenceDpValue, referenceDpUnit);
  let displayReferenceDpUnit = referenceDpUnit;
  let displayReferenceDpValue = referenceDpValue;
  let wasAutoCorrected = false;

  if (referenceDpUnit === 'Pa' && referenceDpValue < 1000) warnings.push('參考壓損低於 1 kPa，對 HVAC 水側設備通常偏低，請確認是否應為 kPa');

  if (!disableAutoCorrection && referenceDpUnit === 'Pa' && referenceDpValue >= 5 && referenceDpValue <= 300 && selectedPipe) {
    const candidateAVelocity = calculateVelocityFromLpmAndDiameter(referenceFlowLpm * Math.sqrt(normalizedMeasuredDpPa / normalizedReferenceDpPa), selectedPipe.innerDiameterMm);
    const candidateBPa = pressureToPa(referenceDpValue, 'kPa');
    const candidateBFlow = referenceFlowLpm * Math.sqrt(normalizedMeasuredDpPa / candidateBPa);
    const candidateBVelocity = calculateVelocityFromLpmAndDiameter(candidateBFlow, selectedPipe.innerDiameterMm);
    if (candidateAVelocity > 10 && candidateBVelocity < candidateAVelocity) {
      normalizedReferenceDpPa = candidateBPa;
      displayReferenceDpUnit = 'kPa';
      displayReferenceDpValue = referenceDpValue;
      wasAutoCorrected = true;
      const msg = `偵測到參考壓損 ${referenceDpValue} Pa 過低，已依工程常見輸入自動判定為 ${referenceDpValue} kPa`;
      autoCorrections.push(msg);
      warnings.push(msg);
    }
  }

  const estimatedFlowLpm = referenceFlowLpm * Math.sqrt(normalizedMeasuredDpPa / normalizedReferenceDpPa);
  const velocityMs = selectedPipe ? calculateVelocityFromLpmAndDiameter(estimatedFlowLpm, selectedPipe.innerDiameterMm) : null;
  const pipeMaxFlowAt3MsLpm = selectedPipe ? selectedPipe.maxFlowAt3MsLpm : null;
  const recommendedPipe = getRecommendedPipeForFlow(referenceFlowLpm, 3);

  if (selectedPipe && referenceFlowLpm > selectedPipe.maxFlowAt3MsLpm) warnings.push(`參考流量本身已超過此管徑建議上限，因此即使壓差單位修正，${selectedPipe.label} 仍不適合 ${referenceFlowLpm} LPM`);
  if (selectedPipe && estimatedFlowLpm > selectedPipe.maxFlowAt3MsLpm * 3) errors.push('目前結果極不合理，可能是壓差單位錯誤');
  if (velocityMs > 10) errors.push('目前結果極不合理，可能是壓差單位錯誤');

  return {
    normalizedMeasuredDpPa, normalizedReferenceDpPa, estimatedFlowLpm, velocityMs, pipeMaxFlowAt3MsLpm,
    selectedPipe, recommendedPipe, warnings, errors, autoCorrections, confidenceLevel: classifyVelocity(velocityMs || 0),
    displayReferenceDpUnit, displayReferenceDpValue, wasAutoCorrected,
  };
}

module.exports = { analyzePressureFlowInput };
