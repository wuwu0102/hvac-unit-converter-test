(function (globalScope) {
  const PIPE_SIZE_OPTIONS = [
    { id: 'DN15', label: '15A', nominalA: '15A', nominalMm: 15, innerDiameterMm: 15.8 },
    { id: 'DN20', label: '20A', nominalA: '20A', nominalMm: 20, innerDiameterMm: 20.9 },
    { id: 'DN25', label: '25A', nominalA: '25A', nominalMm: 25, innerDiameterMm: 26.6 },
    { id: 'DN32', label: '32A', nominalA: '32A', nominalMm: 32, innerDiameterMm: 35 },
    { id: 'DN40', label: '40A', nominalA: '40A', nominalMm: 40, innerDiameterMm: 40.9 },
    { id: 'DN50', label: '50A', nominalA: '50A', nominalMm: 50, innerDiameterMm: 52.5 },
    { id: 'DN65', label: '65A', nominalA: '65A', nominalMm: 65, innerDiameterMm: 62.7 },
    { id: 'DN80', label: '80A', nominalA: '80A', nominalMm: 80, innerDiameterMm: 77.9 },
    { id: 'DN100', label: '100A', nominalA: '100A', nominalMm: 100, innerDiameterMm: 102 },
    { id: 'DN125', label: '125A', nominalA: '125A', nominalMm: 125, innerDiameterMm: 128.2 },
    { id: 'DN150', label: '150A', nominalA: '150A', nominalMm: 150, innerDiameterMm: 154.1 },
    { id: 'DN200', label: '200A', nominalA: '200A', nominalMm: 200, innerDiameterMm: 202.7 },
    { id: 'DN250', label: '250A', nominalA: '250A', nominalMm: 250, innerDiameterMm: 254.5 },
    { id: 'DN300', label: '300A', nominalA: '300A', nominalMm: 300, innerDiameterMm: 303.2 },
    { id: 'DN350', label: '350A', nominalA: '350A', nominalMm: 350, innerDiameterMm: 333.4 },
    { id: 'DN400', label: '400A', nominalA: '400A', nominalMm: 400, innerDiameterMm: 381.0 }
  ];

  const getPipeSizeById = (id) => PIPE_SIZE_OPTIONS.find((item) => item.id === id) || null;
  const calculateVelocityFromLpmAndDiameter = (lpm, innerDiameterMm) => {
    if (!Number.isFinite(lpm) || !Number.isFinite(innerDiameterMm) || lpm <= 0 || innerDiameterMm <= 0) return null;
    const flowM3s = lpm / 1000 / 60;
    const areaM2 = Math.PI * Math.pow(innerDiameterMm / 1000, 2) / 4;
    const velocityMs = flowM3s / areaM2;
    return Number.isFinite(velocityMs) && velocityMs > 0 ? velocityMs : null;
  };
  const getRecommendedPipeForFlow = (flowLpm, maxVelocityMs = 3) => PIPE_SIZE_OPTIONS.map((item) => ({ ...item, velocityMs: calculateVelocityFromLpmAndDiameter(flowLpm, item.innerDiameterMm) })).find((item) => Number.isFinite(item.velocityMs) && item.velocityMs <= maxVelocityMs) || null;

  const api = { PIPE_SIZE_OPTIONS, getPipeSizeById, calculateVelocityFromLpmAndDiameter, getRecommendedPipeForFlow };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (globalScope) globalScope.PipeSizes = api;
})(typeof window !== 'undefined' ? window : globalThis);
