export const spring = {
  default: { dampingRatio: 1, duration: 400 },

  snappy: { dampingRatio: 1, duration: 250 },

  momentum: { dampingRatio: 0.8, duration: 400 },

  sheet: { dampingRatio: 0.8, duration: 300 },
} as const;

export const duration = {
  instant: 100,
  fast: 150,
  default: 250,
  slow: 350,

  listItemExit: 200,
} as const;

export const pressScale = 0.97;
