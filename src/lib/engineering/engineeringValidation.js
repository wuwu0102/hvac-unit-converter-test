function classifyVelocity(velocityMs) {
  if (velocityMs <= 1.5) return '合理';
  if (velocityMs <= 3.0) return '偏高';
  if (velocityMs <= 10.0) return '過高';
  return '極不合理';
}

module.exports = { classifyVelocity };
