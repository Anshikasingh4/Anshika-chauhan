// Shared, slowly varying wind strength (roughly 0.1 - 1.3) used by petals and branches.
export const wind = (t) =>
  0.7 + 0.35 * Math.sin(t * 0.23) + 0.25 * Math.sin(t * 0.61 + 1.3)
