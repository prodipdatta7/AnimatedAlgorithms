<script lang="ts">
  import type { PlaybackClock } from '../../lib/stores/playback.svelte';

  interface Props {
    clock: PlaybackClock;
    totalSteps: number;
  }

  let { clock, totalSteps }: Props = $props();

  const speeds = [0.25, 0.5, 1.0, 1.5, 2.0];

  function handleSliderInput(e: Event) {
    const value = Number((e.target as HTMLInputElement).value);
    clock.seekToStep(value);
  }
</script>

<div class="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 shadow-xl flex flex-col gap-3">
  <!-- Scrubbing Timeline Slider -->
  <div class="flex items-center gap-3">
    <span class="text-xs font-mono font-bold text-slate-400 min-w-[50px]">
      Step <span data-testid="step-index">{clock.currentStepIndex}</span> / {Math.max(0, totalSteps - 1)}
    </span>

    <input
      type="range"
      min="0"
      max={Math.max(0, totalSteps - 1)}
      value={clock.currentStepIndex}
      oninput={handleSliderInput}
      aria-label="Timeline"
      class="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
    />

    <span class="text-xs font-mono text-cyan-400 font-bold min-w-[40px] text-right">
      {Math.round(clock.progressPercentage)}%
    </span>
  </div>

  <!-- Transport Controls & Speed Selector -->
  <div class="flex items-center justify-between">
    <!-- Buttons -->
    <div class="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Jump to Start"
        onclick={() => clock.seekToStep(0)}
        class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono font-bold transition-all"
      >
        ⏮ Start
      </button>

      <button
        type="button"
        aria-label="Step Backward"
        onclick={() => clock.seekToStep(clock.currentStepIndex - 1)}
        class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono font-bold transition-all"
      >
        ◀ Prev
      </button>

      {#if clock.isPlaying}
        <button
          type="button"
          aria-label="Pause"
          onclick={() => clock.pause()}
          class="px-4 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition-all shadow-[0_0_10px_rgba(245,158,11,0.4)]"
        >
          Pause
        </button>
      {:else}
        <button
          type="button"
          aria-label="Play"
          onclick={() => clock.play()}
          class="px-4 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded transition-all shadow-[0_0_10px_rgba(0,242,254,0.4)]"
        >
          Play
        </button>
      {/if}

      <button
        type="button"
        aria-label="Step Forward"
        onclick={() => clock.seekToStep(clock.currentStepIndex + 1)}
        class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono font-bold transition-all"
      >
        Next ▶
      </button>

      <button
        type="button"
        aria-label="Jump to End"
        onclick={() => clock.seekToStep(totalSteps - 1)}
        class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono font-bold transition-all"
      >
        End ⏭
      </button>
    </div>

    <!-- Speed Selector -->
    <div class="flex items-center gap-1">
      <span class="text-[11px] font-mono text-slate-400 mr-1">Speed:</span>
      {#each speeds as s}
        <button
          type="button"
          onclick={() => clock.setRate(s)}
          class={`px-1.5 py-0.5 text-[11px] font-mono rounded ${
            clock.playbackRate === s
              ? 'bg-cyan-500 text-slate-950 font-bold'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {s}×
        </button>
      {/each}
    </div>
  </div>
</div>
