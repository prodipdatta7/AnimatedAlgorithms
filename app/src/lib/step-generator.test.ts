import { describe, it, expect } from 'vitest';
import { generateSteps } from './step-generator';
import type { AlgorithmStep } from './algorithm-step.types';

describe('generateSteps', () => {
  describe('boundary array sizes', () => {
    it('generates a valid, non-empty step sequence for N = 2 (lower bound)', () => {
      const steps: AlgorithmStep[] = generateSteps({
        array: [3, 7],
        operation: 'query',
        range: { l: 0, r: 1 },
        aggregate: 'sum',
        indexing: '0-based',
        lazy: false,
      });

      expect(steps.length).toBeGreaterThan(0);
      steps.forEach((s, i) => expect(s.stepIndex).toBe(i));
    });

    it('generates a valid step sequence for N = 16 (upper bound) without truncation', () => {
      const array = Array.from({ length: 16 }, (_, i) => i + 1);
      const steps = generateSteps({
        array,
        operation: 'query',
        range: { l: 0, r: 15 },
        aggregate: 'sum',
        indexing: '0-based',
        lazy: false,
      });

      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.state).toBe('fullOverlap');
    });
  });

  describe('lazy propagation', () => {
    it('cascades a pending lazy tag across at least 3 tree levels on push()', () => {
      const array = Array.from({ length: 8 }, () => 1);
      const steps = generateSteps({
        array,
        operation: 'rangeUpdate',
        range: { l: 0, r: 7 },
        delta: 5,
        aggregate: 'sum',
        indexing: '0-based',
        lazy: true,
      });

      const pushSteps = steps.filter((s) => s.lazyTag !== null);
      expect(pushSteps.length).toBeGreaterThan(0);

      const touchedNodeIds = new Set(pushSteps.map((s) => s.nodeId));
      const depths = new Set(
        Array.from(touchedNodeIds).map((id) => Math.floor(Math.log2(id + 1)))
      );
      expect(depths.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('overlap state resolution', () => {
    it('visits a partialOverlap node before its child resolves to fullOverlap', () => {
      const array = [4, 2, 6, 8, 1, 9, 3, 5];
      const steps = generateSteps({
        array,
        operation: 'query',
        range: { l: 2, r: 5 },
        aggregate: 'sum',
        indexing: '0-based',
        lazy: false,
      });

      const firstPartialIdx = steps.findIndex((s) => s.state === 'partialOverlap');
      expect(firstPartialIdx).toBeGreaterThanOrEqual(0);

      const partialNodeId = steps[firstPartialIdx].nodeId;
      const childFullOverlap = steps
        .slice(firstPartialIdx + 1)
        .find((s) => s.state === 'fullOverlap' && isDescendant(s.nodeId, partialNodeId));

      expect(childFullOverlap).toBeTruthy();
    });
  });

  describe('shared shape contract (§4.3)', () => {
    it('every generated step matches the AlgorithmStep interface exactly — no module-local fields', () => {
      const steps = generateSteps({
        array: [1, 2, 3, 4],
        operation: 'pointUpdate',
        index: 1,
        newValue: 9,
        aggregate: 'max',
        indexing: '0-based',
        lazy: false,
      });

      const allowedKeys = new Set([
        'stepIndex',
        'operation',
        'nodeId',
        'range',
        'state',
        'value',
        'lazyTag',
        'codeLine',
        'narrative',
        'quizPause',
      ]);
      steps.forEach((step) => {
        Object.keys(step).forEach((key) => expect(allowedKeys.has(key)).toBe(true));
      });
    });
  });
});

function isDescendant(nodeId: number, ancestorId: number): boolean {
  let current = nodeId;
  while (current > ancestorId) {
    current = Math.floor((current - 1) / 2);
    if (current === ancestorId) return true;
  }
  return false;
}
