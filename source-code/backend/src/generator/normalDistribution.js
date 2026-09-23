export function standardNormal(random) {
  let u1 = random();
  let u2 = random();

  // Avoid log(0)
  if (u1 === 0) {
    u1 = Number.EPSILON;
  }

  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}