<script lang="ts">
  import type { QuizPauseData } from '../../lib/algorithm-step.types';

  interface Props {
    quiz: QuizPauseData;
    onAnswer: (selected: 'fullOverlap' | 'partialOverlap' | 'noOverlap') => void;
  }

  let { quiz, onAnswer }: Props = $props();
</script>

<div
  class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  data-testid="quiz-pause-modal"
>
  <div class="bg-slate-900 border border-cyan-500/50 rounded-xl p-6 max-w-md w-full shadow-[0_0_30px_rgba(0,242,254,0.2)]">
    <div class="flex items-center gap-2 mb-3">
      <span class="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-xs font-bold rounded border border-amber-500/40">
        ⚡ PREDICTION PAUSE
      </span>
    </div>

    <h3 class="text-base font-bold text-white mb-2">Predict the Overlap Classification</h3>
    <p class="text-sm text-slate-300 font-mono mb-6 bg-slate-950 p-3 rounded border border-slate-800">
      {quiz.prompt}
    </p>

    <div class="grid grid-cols-1 gap-2.5">
      <button
        type="button"
        onclick={() => onAnswer('fullOverlap')}
        class="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/50 font-bold text-xs rounded-lg transition-all text-left px-4 flex items-center justify-between"
      >
        <span>Full Overlap</span>
        <span class="font-mono text-[10px] bg-emerald-950 px-2 py-0.5 rounded">FULL</span>
      </button>

      <button
        type="button"
        onclick={() => onAnswer('partialOverlap')}
        class="w-full py-2.5 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/50 font-bold text-xs rounded-lg transition-all text-left px-4 flex items-center justify-between"
      >
        <span>Partial Overlap</span>
        <span class="font-mono text-[10px] bg-amber-950 px-2 py-0.5 rounded">PARTIAL</span>
      </button>

      <button
        type="button"
        onclick={() => onAnswer('noOverlap')}
        class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs rounded-lg transition-all text-left px-4 flex items-center justify-between"
      >
        <span>No Overlap (Pruned)</span>
        <span class="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded">NONE</span>
      </button>
    </div>
  </div>
</div>
