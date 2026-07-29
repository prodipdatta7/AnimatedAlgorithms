<script lang="ts">
  import type { ScenarioOptions, AggregateFunction, IndexingMode, OperationType } from '../../lib/algorithm-step.types';

  interface Props {
    options: ScenarioOptions;
    onChange: (updated: ScenarioOptions) => void;
  }

  let { options, onChange }: Props = $props();

  function updateOp(op: OperationType) {
    const n = options.array.length;
    if (op === 'query') {
      onChange({
        ...options,
        operation: 'query',
        range: { l: 0, r: Math.min(3, n - 1) },
      });
    } else if (op === 'pointUpdate') {
      onChange({
        ...options,
        operation: 'pointUpdate',
        index: 1,
        newValue: 9,
      });
    } else if (op === 'rangeUpdate') {
      onChange({
        ...options,
        operation: 'rangeUpdate',
        range: { l: 0, r: Math.min(3, n - 1) },
        delta: 5,
        lazy: true,
      });
    }
  }

  function updateRange(l: number, r: number) {
    if (options.operation === 'query' || options.operation === 'rangeUpdate') {
      onChange({
        ...options,
        range: { l, r },
      });
    }
  }

  function updatePoint(index: number, newValue: number) {
    if (options.operation === 'pointUpdate') {
      onChange({
        ...options,
        index,
        newValue,
      });
    }
  }

  function updateDelta(delta: number) {
    if (options.operation === 'rangeUpdate') {
      onChange({
        ...options,
        delta,
      });
    }
  }

  function updateAggregate(aggregate: AggregateFunction) {
    onChange({ ...options, aggregate });
  }

  function updateIndexing(indexing: IndexingMode) {
    onChange({ ...options, indexing });
  }

  function toggleLazy(lazy: boolean) {
    onChange({ ...options, lazy });
  }

  function toggleQuiz(quizMode: boolean) {
    onChange({ ...options, quizMode });
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
  <!-- Operation Selector -->
  <div>
    <label for="operation-select" class="block text-xs font-semibold text-slate-400 mb-1">Operation Type</label>
    <select
      id="operation-select"
      aria-label="Operation Type"
      value={options.operation}
      onchange={(e) => updateOp((e.target as HTMLSelectElement).value as OperationType)}
      class="w-full bg-slate-800 text-cyan-300 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono focus:border-cyan-500 focus:outline-none"
    >
      <option value="query">Range Query [qL..qR]</option>
      <option value="pointUpdate">Point Update (index i = val)</option>
      <option value="rangeUpdate">Range Update (Lazy [qL..qR] + val)</option>
    </select>
  </div>

  <!-- Dynamic Operation Arguments -->
  {#if options.operation === 'query' || options.operation === 'rangeUpdate'}
    <div class="flex gap-2">
      <div class="flex-1">
        <label for="range-l-input" class="block text-xs font-semibold text-slate-400 mb-1">Query Left Bound (qL)</label>
        <input
          id="range-l-input"
          type="number"
          aria-label="Query Left Bound"
          value={options.range.l}
          oninput={(e) => updateRange(Number((e.target as HTMLInputElement).value), options.range.r)}
          class="w-full bg-slate-800 text-cyan-300 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono focus:border-cyan-500 focus:outline-none"
        />
      </div>
      <div class="flex-1">
        <label for="range-r-input" class="block text-xs font-semibold text-slate-400 mb-1">Query Right Bound (qR)</label>
        <input
          id="range-r-input"
          type="number"
          aria-label="Query Right Bound"
          value={options.range.r}
          oninput={(e) => updateRange(options.range.l, Number((e.target as HTMLInputElement).value))}
          class="w-full bg-slate-800 text-cyan-300 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono focus:border-cyan-500 focus:outline-none"
        />
      </div>
    </div>
  {:else if options.operation === 'pointUpdate'}
    <div class="flex gap-2">
      <div class="flex-1">
        <label for="point-idx-input" class="block text-xs font-semibold text-slate-400 mb-1">Target Index (i)</label>
        <input
          id="point-idx-input"
          type="number"
          aria-label="Target Index"
          value={options.index}
          oninput={(e) => updatePoint(Number((e.target as HTMLInputElement).value), options.newValue)}
          class="w-full bg-slate-800 text-cyan-300 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono focus:border-cyan-500 focus:outline-none"
        />
      </div>
      <div class="flex-1">
        <label for="point-val-input" class="block text-xs font-semibold text-slate-400 mb-1">New Value</label>
        <input
          id="point-val-input"
          type="number"
          aria-label="New Value"
          value={options.newValue}
          oninput={(e) => updatePoint(options.index, Number((e.target as HTMLInputElement).value))}
          class="w-full bg-slate-800 text-cyan-300 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono focus:border-cyan-500 focus:outline-none"
        />
      </div>
    </div>
  {/if}

  {#if options.operation === 'rangeUpdate'}
    <div>
      <label for="range-delta-input" class="block text-xs font-semibold text-slate-400 mb-1">Delta Value (+val)</label>
      <input
        id="range-delta-input"
        type="number"
        aria-label="Delta Value"
        value={options.delta}
        oninput={(e) => updateDelta(Number((e.target as HTMLInputElement).value))}
        class="w-full bg-slate-800 text-cyan-300 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono focus:border-cyan-500 focus:outline-none"
      />
    </div>
  {/if}

  <!-- Toggles: Aggregate, Indexing, Lazy, Quiz -->
  <div class="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800 col-span-full">
    <div class="flex items-center gap-1.5">
      <span class="text-xs text-slate-400 font-medium">Agg:</span>
      {#each ['sum', 'min', 'max'] as agg}
        <button
          type="button"
          onclick={() => updateAggregate(agg as AggregateFunction)}
          class={`px-2 py-0.5 text-xs rounded font-mono ${
            options.aggregate === agg
              ? 'bg-purple-600 text-white font-bold'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {agg.toUpperCase()}
        </button>
      {/each}
    </div>

    <div class="h-4 w-px bg-slate-800"></div>

    <div class="flex items-center gap-1.5">
      <span class="text-xs text-slate-400 font-medium">Index:</span>
      {#each ['0-based', '1-based'] as idxMode}
        <button
          type="button"
          onclick={() => updateIndexing(idxMode as IndexingMode)}
          class={`px-2 py-0.5 text-xs rounded font-mono ${
            options.indexing === idxMode
              ? 'bg-cyan-600 text-white font-bold'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {idxMode}
        </button>
      {/each}
    </div>

    <div class="h-4 w-px bg-slate-800"></div>

    <label class="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
      <input
        type="checkbox"
        aria-label="Lazy Propagation"
        checked={options.lazy}
        onchange={(e) => toggleLazy((e.target as HTMLInputElement).checked)}
        class="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
      />
      Lazy Propagation
    </label>

    <div class="h-4 w-px bg-slate-800"></div>

    <label class="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
      <input
        type="checkbox"
        aria-label="Prediction Pauses"
        checked={options.quizMode ?? false}
        onchange={(e) => toggleQuiz((e.target as HTMLInputElement).checked)}
        class="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
      />
      Prediction Pauses
    </label>
  </div>
</div>
