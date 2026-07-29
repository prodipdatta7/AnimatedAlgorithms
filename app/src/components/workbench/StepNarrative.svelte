<script lang="ts">
  import type { AlgorithmStep } from '../../lib/algorithm-step.types';

  interface Props {
    step: AlgorithmStep | null;
  }

  let { step }: Props = $props();
</script>

<div class="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
  <div class="flex items-center justify-between mb-1.5">
    <span class="text-xs font-bold uppercase tracking-wider text-cyan-400">Execution Narrative</span>
    {#if step}
      <span class="text-[11px] font-mono text-slate-400">Step {step.stepIndex + 1}</span>
    {/if}
  </div>

  <p class="text-xs font-mono text-slate-200 leading-relaxed min-h-[36px]">
    {step ? step.narrative : 'Click "RUN SIMULATION" or press Play to begin execution.'}
  </p>
</div>
