import { describe, it, expect } from 'vitest';
import { createBuilderStore, ARRAY_PRESETS } from './builder.svelte';

describe('createBuilderStore', () => {
  it('initializes with DEFAULT_SCENARIO options and derived steps', () => {
    const builder = createBuilderStore();
    expect(builder.options.array).toEqual([2, 5, 1, 4, 9, 3, 7, 6]);
    expect(builder.steps.length).toBeGreaterThan(0);
    expect(builder.layout.length).toBeGreaterThan(0);
    expect(builder.isValid).toBe(true);
  });

  it('applies presets and bounds query parameters automatically', () => {
    const builder = createBuilderStore();
    builder.applyPreset(ARRAY_PRESETS[1].array); // [5, 5, 5, 5] (N=4)
    expect(builder.options.array).toEqual([5, 5, 5, 5]);
    if (builder.options.operation === 'query') {
      expect(builder.options.range.r).toBeLessThanOrEqual(3);
    }
    expect(builder.isValid).toBe(true);
  });
});
