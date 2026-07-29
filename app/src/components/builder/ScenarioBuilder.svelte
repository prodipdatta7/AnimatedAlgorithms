<script lang="ts">
  import type { BuilderStore } from '../../lib/stores/builder.svelte';
  import PresetSelector from './PresetSelector.svelte';
  import OperationControls from './OperationControls.svelte';

  interface Props {
    builder: BuilderStore;
    onRun: () => void;
  }

  let { builder, onRun }: Props = $props();

  let rawArrayInput = $state('');
  let arrayFieldError = $state<string | null>(null);

  $effect(() => {
    rawArrayInput = builder.options.array.join(', ');
  });

  function handleArrayInputChange(value: string) {
    rawArrayInput = value;
    const parts = value.split(',').map((p) => p.trim()).filter((p) => p.length > 0);
    const parsedNumbers = parts.map((p) => Number(p));

    if (parts.length < 2 || parts.length > 16) {
      arrayFieldError = 'Array length N must be between 2 and 16 elements.';
      return;
    }

    if (parsedNumbers.some((num) => isNaN(num))) {
      arrayFieldError = 'All array elements must be valid numbers.';
      return;
    }

    arrayFieldError = null;
    builder.setScenario({
      ...builder.options,
      array: parsedNumbers,
    });
  }
</script>

<section class="bg-slate-950/90 border border-slate-800 rounded-xl p-4 shadow-xl">
  <div class="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
    <div>
      <h2 class="text-sm font-bold uppercase tracking-wider text-cyan-400">Module A: Custom Scenario Builder</h2>
      <p class="text-xs text-slate-400">Configure array bounds, values, operations, and algorithm options.</p>
    </div>
    <button
      type="button"
      aria-label="Run Simulation"
      onclick={onRun}
      class="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-lg shadow-[0_0_12px_rgba(0,242,254,0.4)] transition-all transform active:scale-95"
    >
      RUN SIMULATION
    </button>
  </div>

  <PresetSelector
    currentArray={builder.options.array}
    onSelectPreset={(arr) => builder.applyPreset(arr)}
  />

  <!-- Raw Array Input Field -->
  <div class="mb-3.5">
    <label for="custom-array-input" class="block text-xs font-semibold text-slate-300 mb-1">
      Custom Array Input (N ∈ [2, 16], comma-separated):
    </label>
    <input
      id="custom-array-input"
      type="text"
      aria-label="Custom Array Input"
      value={rawArrayInput}
      oninput={(e) => handleArrayInputChange((e.target as HTMLInputElement).value)}
      class={`w-full bg-slate-900 border rounded px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none transition-colors ${
        arrayFieldError ? 'border-amber-500 text-amber-200' : 'border-slate-700 focus:border-cyan-500'
      }`}
    />
    {#if arrayFieldError}
      <p class="text-[11px] text-amber-400 mt-1 font-mono">{arrayFieldError}</p>
    {/if}
  </div>

  <!-- Operation Controls -->
  <OperationControls
    options={builder.options}
    onChange={(updated) => builder.setScenario(updated)}
  />

  <!-- Field Level Validation Errors -->
  {#if builder.validationErrors.length > 0}
    <div class="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
      {#each builder.validationErrors as err}
        <p class="text-xs text-amber-300 font-mono flex items-center gap-1.5">
          <span class="text-amber-400 font-bold">⚠</span> {err.message}
        </p>
      {/each}
    </div>
  {/if}
</section>
