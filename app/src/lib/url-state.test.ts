import { describe, it, expect } from 'vitest';
import { encodeScenarioToUrl, decodeScenarioFromUrl, DEFAULT_SCENARIO } from './url-state';
import type { ScenarioOptions } from './algorithm-step.types';

describe('url-state', () => {
  it('serializes and deserializes a scenario accurately', () => {
    const original: ScenarioOptions = {
      array: [5, 5, 5, 5],
      operation: 'query',
      range: { l: 0, r: 3 },
      aggregate: 'max',
      indexing: '0-based',
      lazy: false,
      quizMode: false,
    };

    const urlString = encodeScenarioToUrl(original);
    const searchParams = new URL(urlString).search;
    const { options, isMalformed } = decodeScenarioFromUrl(searchParams);

    expect(isMalformed).toBe(false);
    expect(options).toEqual(original);
  });

  it('falls back to DEFAULT_SCENARIO on malformed Base64 string', () => {
    const { options, isMalformed } = decodeScenarioFromUrl('?s=invalid-base64');
    expect(isMalformed).toBe(true);
    expect(options).toEqual(DEFAULT_SCENARIO);
  });
});
