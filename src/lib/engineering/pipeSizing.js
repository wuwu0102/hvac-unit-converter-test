(function (globalScope) {
  const { PIPE_SIZE_OPTIONS, getPipeSizeById } = (globalScope && globalScope.PipeSizes) || require('../../data/pipeSizes');

  const calculatePipeMetrics = (flowLpm, pipeSizeId) => {
    const pipe = getPipeSizeById(pipeSizeId);
    if (!pipe || !Number.isFinite(flowLpm) || flowLpm <= 0) return null;
    const diameterM = pipe.innerDiameterMm / 1000;
    const area = Math.PI * Math.pow(diameterM / 2, 2);
    const flowM3s = flowLpm / 1000 / 60;
    const velocity = flowM3s / area;
    const maxRecommendedFlowLpmAt3ms = area * 3 * 60000;
    return {
      pipe,
      area,
      flowM3s,
      velocity,
      maxRecommendedFlowLpmAt3ms
    };
  };

  const classifyVelocity = (velocity) => {
    if (!Number.isFinite(velocity) || velocity <= 0) return '請選擇有效管徑';
    if (velocity <= 1.5) return '流速合理';
    if (velocity <= 3.0) return '流速偏高，請確認噪音、壓損與泵浦揚程';
    return '流速過高，建議放大管徑或重新確認設計條件';
  };

  const api = { PIPE_SIZE_OPTIONS, calculatePipeMetrics, classifyVelocity };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (globalScope) globalScope.EngineeringPipeSizing = api;
})(typeof window !== 'undefined' ? window : globalThis);
