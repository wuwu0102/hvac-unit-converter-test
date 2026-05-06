const PRESSURE_TO_PA = {
  Pa: 1,
  kPa: 1000,
  mH2O: 9806.65,
  bar: 100000,
};

function pressureToPa(value, unit) {
  const factor = PRESSURE_TO_PA[unit];
  if (!Number.isFinite(value) || !factor) return NaN;
  return value * factor;
}

function paToPressure(value, unit) {
  const factor = PRESSURE_TO_PA[unit];
  if (!Number.isFinite(value) || !factor) return NaN;
  return value / factor;
}

module.exports = { pressureToPa, paToPressure };
