// Generates guid-like random string
export function guid(len: number = 16): string {
  // eslint-disable-next-line
  return new Array(len).join().replace(/(.|$)/g, () => ((Math.random() * 36) | 0).toString(36)[Math.random() < 0.5 ? 'toString' : 'toUpperCase']());
};
