import type { ScenarioOptions, AlgorithmStep, TreeNodePosition } from '../algorithm-step.types';
import { generateSteps } from '../step-generator';
import { calculateTreeLayout } from '../tree-layout';
import { DEFAULT_SCENARIO, decodeScenarioFromUrl, encodeScenarioToUrl } from '../url-state';

export interface ScenarioValidationError {
  field: 'array' | 'range' | 'index' | 'value';
  message: string;
}

export const ARRAY_PRESETS = [
  { label: 'Classic CP Array', array: [2, 5, 1, 4, 9, 3, 7, 6] },
  { label: 'Uniform Array', array: [5, 5, 5, 5] },
  { label: 'Peaks & Valleys', array: [1, 9, 2, 8, 3, 7, 4, 6] },
  { label: 'Minimal N=2', array: [3, 7] },
];

export function createBuilderStore() {
  let options = $state<ScenarioOptions>({ ...DEFAULT_SCENARIO });
  let isMalformedUrl = $state(false);

  // Derived algorithm steps & layout math
  const steps = $derived<AlgorithmStep[]>(generateSteps(options));
  const layout = $derived<TreeNodePosition[]>(calculateTreeLayout(options.array));

  // Inline field validation
  const validationErrors = $derived.by<ScenarioValidationError[]>(() => {
    const errors: ScenarioValidationError[] = [];
    const n = options.array.length;

    if (n < 2 || n > 16) {
      errors.push({ field: 'array', message: 'Array size N must be between 2 and 16 elements.' });
    }

    if (options.array.some((val) => isNaN(val))) {
      errors.push({ field: 'array', message: 'All array elements must be valid numbers.' });
    }

    if (options.operation === 'query' || options.operation === 'rangeUpdate') {
      const { l, r } = options.range;
      if (l < 0 || l >= n) {
        errors.push({ field: 'range', message: `Left bound qL must be between 0 and ${n - 1}.` });
      }
      if (r < 0 || r >= n) {
        errors.push({ field: 'range', message: `Right bound qR must be between 0 and ${n - 1}.` });
      }
      if (l > r) {
        errors.push({ field: 'range', message: `Left bound qL (${l}) cannot exceed right bound qR (${r}).` });
      }
    }

    if (options.operation === 'pointUpdate') {
      const idx = options.index;
      if (idx < 0 || idx >= n) {
        errors.push({ field: 'index', message: `Target index must be between 0 and ${n - 1}.` });
      }
    }

    return errors;
  });

  const isValid = $derived(validationErrors.length === 0);

  function setScenario(newOptions: ScenarioOptions) {
    options = { ...newOptions };
  }

  function applyPreset(array: number[]) {
    const n = array.length;
    let newOptions = { ...options, array };

    if (newOptions.operation === 'query' || newOptions.operation === 'rangeUpdate') {
      newOptions.range = {
        l: Math.min(newOptions.range.l, n - 1),
        r: Math.min(newOptions.range.r, n - 1),
      };
      if (newOptions.range.l > newOptions.range.r) {
        newOptions.range.l = 0;
      }
    } else if (newOptions.operation === 'pointUpdate') {
      newOptions.index = Math.min(newOptions.index, n - 1);
    }

    options = newOptions;
  }

  function loadFromUrl(queryString: string) {
    const result = decodeScenarioFromUrl(queryString);
    options = result.options;
    isMalformedUrl = result.isMalformed;
  }

  function getShareableUrl(): string {
    return encodeScenarioToUrl(options);
  }

  return {
    get options() {
      return options;
    },
    get steps() {
      return steps;
    },
    get layout() {
      return layout;
    },
    get validationErrors() {
      return validationErrors;
    },
    get isValid() {
      return isValid;
    },
    get isMalformedUrl() {
      return isMalformedUrl;
    },
    setScenario,
    applyPreset,
    loadFromUrl,
    getShareableUrl,
  };
}

export type BuilderStore = ReturnType<typeof createBuilderStore>;
