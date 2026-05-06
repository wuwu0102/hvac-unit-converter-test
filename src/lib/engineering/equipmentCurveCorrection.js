const { pressureToPa } = require('./unitConversion');
const { calculateVelocityFromLpmAndDiameter } = require('./pipeSizing');

function calculateEquipmentCorrection(input) {
  const { measuredDpPa, referenceFlowLpm, referenceDpValue, referenceDpUnit, selectedPipe, disableAutoCorrection = false } = input;
  if (![measuredDpPa, referenceFlowLpm, referenceDpValue].every(Number.isFinite)) return null;
  if (measuredDpPa <= 0 || referenceFlowLpm <= 0 || referenceDpValue <= 0 || !selectedPipe) return null;

  let normalizedReferenceDpPa = pressureToPa(referenceDpValue, referenceDpUnit);
  let displayReferenceDpUnit = referenceDpUnit;
  const warnings = [];
  const autoCorrections = [];
  let wasAutoCorrected = false;

  if (referenceDpUnit === 'Pa' && referenceDpValue < 1000) warnings.push('參考壓損低於 1 kPa，對 HVAC 水側設備通常偏低，請確認是否應為 kPa');

  if (!disableAutoCorrection && referenceDpUnit === 'Pa' && referenceDpValue >= 5 && referenceDpValue <= 300) {
    const candidateAFlow = referenceFlowLpm * Math.sqrt(measuredDpPa / normalizedReferenceDpPa);
    const candidateAV = calculateVelocityFromLpmAndDiameter(candidateAFlow, selectedPipe.innerDiameterMm);
    const candidateBPa = pressureToPa(referenceDpValue, 'kPa');
    const candidateBFlow = referenceFlowLpm * Math.sqrt(measuredDpPa / candidateBPa);
    const candidateBV = calculateVelocityFromLpmAndDiameter(candidateBFlow, selectedPipe.innerDiameterMm);
    if (candidateAV > 10 && candidateBV < candidateAV) {
      normalizedReferenceDpPa = candidateBPa;
      displayReferenceDpUnit = 'kPa';
      wasAutoCorrected = true;
      const msg = `偵測到參考壓損 ${referenceDpValue} Pa 過低，已依工程常見輸入自動判定為 ${referenceDpValue} kPa`;
      warnings.push(msg); autoCorrections.push(msg);
    }
  }

  const correctedFlowLpm = referenceFlowLpm * Math.sqrt(measuredDpPa / normalizedReferenceDpPa);
  const correctedVelocityMs = calculateVelocityFromLpmAndDiameter(correctedFlowLpm, selectedPipe.innerDiameterMm);
  const strongWarning = disableAutoCorrection && correctedVelocityMs > 10;
  return { correctedFlowLpm, correctedVelocityMs, normalizedReferenceDpPa, displayReferenceDpUnit, warnings, autoCorrections, wasAutoCorrected, strongWarning };
}

module.exports = { calculateEquipmentCorrection };
