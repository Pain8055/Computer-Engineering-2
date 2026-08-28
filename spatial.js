const numeric = (value, fallback = 0.5) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function spatialTransform(normalizedX = 0.5, normalizedY = 0.5) {
  const x = clamp(numeric(normalizedX), 0, 1);
  const y = clamp(numeric(normalizedY), 0, 1);
  return {
    rotateX: Number((7 - y * 14).toFixed(2)),
    rotateY: Number((-11 + x * 22).toFixed(2)),
    translateX: Number((-10 + x * 20).toFixed(1)),
    translateY: Number((-8 + y * 16).toFixed(1))
  };
}

export function spatialDepth(index, total) {
  const count = Math.max(1, numeric(total, 1));
  const i = Math.max(0, numeric(index, 0));
  const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
  return {
    x: Number((Math.cos(angle) * 42).toFixed(2)),
    y: Number((Math.sin(angle) * 34).toFixed(2)),
    z: Number((Math.sin(angle * 1.7) * 70).toFixed(2))
  };
}
