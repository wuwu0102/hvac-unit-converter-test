(function (globalScope) {
  const PIPE_SIZE_OPTIONS = [
    { id: 'DN15', label: 'DN15 / 1/2"', nominalMm: 15, innerDiameterMm: 16 },
    { id: 'DN20', label: 'DN20 / 3/4"', nominalMm: 20, innerDiameterMm: 21 },
    { id: 'DN25', label: 'DN25 / 1"', nominalMm: 25, innerDiameterMm: 27 },
    { id: 'DN32', label: 'DN32 / 1-1/4"', nominalMm: 32, innerDiameterMm: 35 },
    { id: 'DN40', label: 'DN40 / 1-1/2"', nominalMm: 40, innerDiameterMm: 41 },
    { id: 'DN50', label: 'DN50 / 2"', nominalMm: 50, innerDiameterMm: 52 },
    { id: 'DN65', label: 'DN65 / 2-1/2"', nominalMm: 65, innerDiameterMm: 67 },
    { id: 'DN80', label: 'DN80 / 3"', nominalMm: 80, innerDiameterMm: 78 },
    { id: 'DN100', label: 'DN100 / 4"', nominalMm: 100, innerDiameterMm: 102 },
    { id: 'DN125', label: 'DN125 / 5"', nominalMm: 125, innerDiameterMm: 128 },
    { id: 'DN150', label: 'DN150 / 6"', nominalMm: 150, innerDiameterMm: 154 },
    { id: 'DN200', label: 'DN200 / 8"', nominalMm: 200, innerDiameterMm: 203 },
    { id: 'DN250', label: 'DN250 / 10"', nominalMm: 250, innerDiameterMm: 254 },
    { id: 'DN300', label: 'DN300 / 12"', nominalMm: 300, innerDiameterMm: 305 }
  ];

  const getPipeSizeById = (id) => PIPE_SIZE_OPTIONS.find((item) => item.id === id) || null;

  const calculateVelocityFromLpmAndDiameter = (lpm, innerDiameterMm) => {
    if (!Number.isFinite(lpm) || !Number.isFinite(innerDiameterMm) || lpm <= 0 || innerDiameterMm <= 0) return null;
    const flowM3s = lpm / 1000 / 60;
    const areaM2 = Math.PI * Math.pow(innerDiameterMm / 1000, 2) / 4;
    if (!Number.isFinite(flowM3s) || !Number.isFinite(areaM2) || areaM2 <= 0) return null;
    const velocityMs = flowM3s / areaM2;
    return Number.isFinite(velocityMs) && velocityMs > 0 ? velocityMs : null;
  };

  const getRecommendedPipeForFlow = (flowLpm, maxVelocityMs = 3) => {
    if (!Number.isFinite(flowLpm) || flowLpm <= 0) return null;
    return PIPE_SIZE_OPTIONS.map((item) => ({ ...item, velocityMs: calculateVelocityFromLpmAndDiameter(flowLpm, item.innerDiameterMm) }))
      .find((item) => Number.isFinite(item.velocityMs) && item.velocityMs <= maxVelocityMs) || null;
  };

  const api = { PIPE_SIZE_OPTIONS, getPipeSizeById, calculateVelocityFromLpmAndDiameter, getRecommendedPipeForFlow };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (globalScope) globalScope.PipeSizes = api;
})(typeof window !== 'undefined' ? window : globalThis);
