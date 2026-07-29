import { describe, it, expect } from 'vitest';
import { calculateTreeLayout } from './tree-layout';

describe('calculateTreeLayout', () => {
  it('calculates valid (x, y) node coordinates for N = 8', () => {
    const array = [2, 5, 1, 4, 9, 3, 7, 6];
    const layout = calculateTreeLayout(array, 1000, 500);

    expect(layout.length).toBeGreaterThan(0);
    const root = layout.find((n) => n.id === 0);
    expect(root).toBeDefined();
    expect(root?.nodeRange).toEqual({ l: 0, r: 7 });
    expect(root?.depth).toBe(0);

    const leaves = layout.filter((n) => n.isLeaf);
    expect(leaves.length).toBe(8);
  });

  it('returns empty array for empty input', () => {
    const layout = calculateTreeLayout([]);
    expect(layout).toEqual([]);
  });
});
