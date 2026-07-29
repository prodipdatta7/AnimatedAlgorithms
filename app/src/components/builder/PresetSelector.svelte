<script lang="ts">
  import { ARRAY_PRESETS } from '../../lib/stores/builder.svelte';

  interface Props {
    currentArray: number[];
    onSelectPreset: (array: number[]) => void;
  }

  let { currentArray, onSelectPreset }: Props = $props();

  function isPresetSelected(presetArray: number[]) {
    if (presetArray.length !== currentArray.length) return false;
    return presetArray.every((val, i) => val === currentArray[i]);
  }
</script>

<div class="flex flex-wrap items-center gap-2 mb-3">
  <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Presets:</span>
  {#each ARRAY_PRESETS as preset}
    <button
      type="button"
      onclick={() => onSelectPreset(preset.array)}
      class={`px-2.5 py-1 text-xs rounded font-mono font-medium transition-all duration-150 border ${
        isPresetSelected(preset.array)
          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-[0_0_8px_rgba(0,242,254,0.3)]'
          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {preset.label}
    </button>
  {/each}
</div>
