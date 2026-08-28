export function cameraMotion(normalizedX = 0.5, normalizedY = 0.5, mobile = false) {
  const x = Math.min(1, Math.max(0, Number(normalizedX) || 0.5));
  const y = Math.min(1, Math.max(0, Number(normalizedY) || 0.5));
  const range = mobile ? 5 : 10;
  return {
    x: Number(((0.5 - y) * range).toFixed(3)),
    y: Number(((x - 0.5) * range).toFixed(3))
  };
}

export function qualityProfile(width, prefersReducedMotion = false) {
  const mobile = width <= 700;
  return {
    mobile,
    pixelRatio: mobile ? 1 : 1.5,
    satellites: mobile ? 5 : 9,
    animate: !prefersReducedMotion
  };
}

export function academicNode(index, total = 9) {
  const count = Math.max(1, Number(total) || 1);
  const i = Math.max(0, Number(index) || 0) % count;
  const angle = i / count * Math.PI * 2;
  const radius = i % 2 ? 2.35 : 1.75;
  return {
    x: Number((Math.cos(angle) * radius).toFixed(3)),
    y: Number((Math.sin(angle * 1.35) * 0.7).toFixed(3)),
    z: Number((Math.sin(angle) * radius).toFixed(3))
  };
}
