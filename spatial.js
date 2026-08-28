const clamp01 = (value) => Math.min(1, Math.max(0, Number(value) || 0));

export function spatialTransform(normalizedX, normalizedY) {
  const x = clamp01(normalizedX);
  const y = clamp01(normalizedY);
  return {
    rotateX: Number((6 - y * 12).toFixed(2)),
    rotateY: Number((-8 + x * 16).toFixed(2)),
    translateX: Number((-5 + x * 10).toFixed(1)),
    translateY: Number((-5 + y * 10).toFixed(1))
  };
}
