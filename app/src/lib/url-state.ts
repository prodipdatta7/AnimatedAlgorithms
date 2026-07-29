import type { ScenarioOptions } from './algorithm-step.types';

export const DEFAULT_SCENARIO: ScenarioOptions = {
  array: [2, 5, 1, 4, 9, 3, 7, 6],
  operation: 'query',
  range: { l: 1, r: 5 },
  aggregate: 'sum',
  indexing: '0-based',
  lazy: false,
};

export interface SerializedScenarioState {
  a: number[]; // array
  op: 'query' | 'pointUpdate' | 'rangeUpdate';
  r?: [number, number]; // range [l, r]
  idx?: number; // update index
  val?: number; // new value or delta
  agg: 'sum' | 'min' | 'max';
  idxMode: '0-based' | '1-based';
  lazy: boolean;
  quiz?: boolean;
}

export function encodeScenarioToUrl(options: ScenarioOptions, baseUrl?: string): string {
  const state: SerializedScenarioState = {
    a: options.array,
    op: options.operation,
    agg: options.aggregate,
    idxMode: options.indexing,
    lazy: options.lazy,
    quiz: options.quizMode ?? false,
  };

  if (options.operation === 'query') {
    state.r = [options.range.l, options.range.r];
  } else if (options.operation === 'pointUpdate') {
    state.idx = options.index;
    state.val = options.newValue;
  } else if (options.operation === 'rangeUpdate') {
    state.r = [options.range.l, options.range.r];
    state.val = options.delta;
  }

  const json = JSON.stringify(state);
  const base64 = btoa(encodeURIComponent(json));
  const href = baseUrl || (typeof window !== 'undefined' ? window.location.href : 'http://localhost:4300/');
  const url = new URL(href);
  url.searchParams.set('s', base64);
  return url.toString();
}

export interface ParseUrlStateResult {
  options: ScenarioOptions;
  isMalformed: boolean;
}

export function decodeScenarioFromUrl(searchQuery: string): ParseUrlStateResult {
  const params = new URLSearchParams(searchQuery);
  const rawParam = params.get('s');

  if (!rawParam) {
    return { options: DEFAULT_SCENARIO, isMalformed: false };
  }

  try {
    const json = decodeURIComponent(atob(rawParam));
    const parsed = JSON.parse(json) as SerializedScenarioState;

    if (!Array.isArray(parsed.a) || parsed.a.length < 2 || parsed.a.length > 16) {
      return { options: DEFAULT_SCENARIO, isMalformed: true };
    }
    if (parsed.a.some((val) => typeof val !== 'number' || isNaN(val))) {
      return { options: DEFAULT_SCENARIO, isMalformed: true };
    }
    if (!['sum', 'min', 'max'].includes(parsed.agg)) {
      return { options: DEFAULT_SCENARIO, isMalformed: true };
    }
    if (!['0-based', '1-based'].includes(parsed.idxMode)) {
      return { options: DEFAULT_SCENARIO, isMalformed: true };
    }

    const n = parsed.a.length;

    if (parsed.op === 'query') {
      if (!Array.isArray(parsed.r) || parsed.r.length !== 2) {
        return { options: DEFAULT_SCENARIO, isMalformed: true };
      }
      const [l, r] = parsed.r;
      if (l < 0 || r >= n || l > r) {
        return { options: DEFAULT_SCENARIO, isMalformed: true };
      }
      return {
        options: {
          array: parsed.a,
          operation: 'query',
          range: { l, r },
          aggregate: parsed.agg,
          indexing: parsed.idxMode,
          lazy: parsed.lazy ?? false,
          quizMode: parsed.quiz ?? false,
        },
        isMalformed: false,
      };
    }

    if (parsed.op === 'pointUpdate') {
      if (typeof parsed.idx !== 'number' || parsed.idx < 0 || parsed.idx >= n) {
        return { options: DEFAULT_SCENARIO, isMalformed: true };
      }
      if (typeof parsed.val !== 'number' || isNaN(parsed.val)) {
        return { options: DEFAULT_SCENARIO, isMalformed: true };
      }
      return {
        options: {
          array: parsed.a,
          operation: 'pointUpdate',
          index: parsed.idx,
          newValue: parsed.val,
          aggregate: parsed.agg,
          indexing: parsed.idxMode,
          lazy: parsed.lazy ?? false,
          quizMode: parsed.quiz ?? false,
        },
        isMalformed: false,
      };
    }

    if (parsed.op === 'rangeUpdate') {
      if (!Array.isArray(parsed.r) || parsed.r.length !== 2) {
        return { options: DEFAULT_SCENARIO, isMalformed: true };
      }
      const [l, r] = parsed.r;
      if (l < 0 || r >= n || l > r) {
        return { options: DEFAULT_SCENARIO, isMalformed: true };
      }
      if (typeof parsed.val !== 'number' || isNaN(parsed.val)) {
        return { options: DEFAULT_SCENARIO, isMalformed: true };
      }
      return {
        options: {
          array: parsed.a,
          operation: 'rangeUpdate',
          range: { l, r },
          delta: parsed.val,
          aggregate: parsed.agg,
          indexing: parsed.idxMode,
          lazy: parsed.lazy ?? false,
          quizMode: parsed.quiz ?? false,
        },
        isMalformed: false,
      };
    }

    return { options: DEFAULT_SCENARIO, isMalformed: true };
  } catch {
    return { options: DEFAULT_SCENARIO, isMalformed: true };
  }
}
