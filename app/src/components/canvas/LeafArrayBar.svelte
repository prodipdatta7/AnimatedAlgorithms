<script lang="ts">
  interface Props {
    array: number[];
    activeIndex: number | null;
    activeRange: { l: number; r: number } | null;
  }

  let { array, activeIndex, activeRange }: Props = $props();

  function isInRange(index: number) {
    if (!activeRange) return false;
    return index >= activeRange.l && index <= activeRange.r;
  }
</script>

<div class="mt-3 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
  <div class="flex items-center justify-between mb-2">
    <span class="text-xs font-bold uppercase text-slate-400 tracking-wider">Synchronized 1D Leaf Array (N = {array.length})</span>
    <span class="text-[11px] font-mono text-cyan-400">Leaf Index Mapping</span>
  </div>

  <div class="grid gap-1.5 auto-cols-fr grid-flow-col">
    {#each array as val, idx}
      <div
        class={`flex flex-col items-center justify-center p-2 rounded border font-mono transition-all duration-200 ${
          activeIndex === idx
            ? 'bg-purple-600/30 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(139,92,246,0.4)] scale-105'
            : isInRange(idx)
            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200'
            : 'bg-slate-800/80 border-slate-700 text-slate-300'
        }`}
      >
        <span class="text-[10px] text-slate-400 mb-0.5">[{idx}]</span>
        <span class="text-xs font-bold">{val}</span>
      </div>
    {/each}
  </div>
</div>
