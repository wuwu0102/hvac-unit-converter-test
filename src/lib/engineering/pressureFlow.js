(function (globalScope) {
  const DP_UNIT_FACTORS_TO_PA = Object.freeze({
    Pa: 1,
    kPa: 1000,
    bar: 100000,
    mbar: 100
  });

  const toPa = (value, unit) => {
    if (!Number.isFinite(value) || value <= 0) return null;
    const factor = DP_UNIT_FACTORS_TO_PA[unit];
    if (!Number.isFinite(factor)) return null;
    return value * factor;
  };

  const paToKpa = (pa) => (Number.isFinite(pa) ? pa / 1000 : null);

  const estimateFlowLpm = ({ referenceFlowLpm, measuredDpPa, referenceDpPa }) => {
    if (![referenceFlowLpm, measuredDpPa, referenceDpPa].every((v) => Number.isFinite(v) && v > 0)) return null;
    const flow = referenceFlowLpm * Math.sqrt(measuredDpPa / referenceDpPa);
    return Number.isFinite(flow) && flow > 0 ? flow : null;
  };

  const buildReferenceDpWarnings = ({ referenceDpInput, referenceDpUnit }) => {
    const warnings = [];
    if (referenceDpUnit === 'Pa' && Number.isFinite(referenceDpInput) && referenceDpInput > 0 && referenceDpInput <= 100) {
      warnings.push('30 Pa 非常小，若原意是 30 kPa，請將壓損單位改為 kPa');
    }
    return warnings;
  };

  const api = { DP_UNIT_FACTORS_TO_PA, toPa, paToKpa, estimateFlowLpm, buildReferenceDpWarnings };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (globalScope) globalScope.EngineeringPressureFlow = api;
})(typeof window !== 'undefined' ? window : globalThis);
