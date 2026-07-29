<script lang="ts">
  import { onMount } from 'svelte';
  import { createBuilderStore, ARRAY_PRESETS } from './lib/stores/builder.svelte';
  import { createPlaybackClock } from './lib/stores/playback.svelte';
  import { createVaultStore } from './lib/stores/vault.svelte';

  import ScenarioBuilder from './components/builder/ScenarioBuilder.svelte';
  import TreeCanvas from './components/canvas/TreeCanvas.svelte';
  import CodeWorkbench from './components/workbench/CodeWorkbench.svelte';
  import StepNarrative from './components/workbench/StepNarrative.svelte';
  import PlaybackDeck from './components/workbench/PlaybackDeck.svelte';
  import QuizModal from './components/vault/QuizModal.svelte';
  import TemplateVault from './components/vault/TemplateVault.svelte';
  import ShareModal from './components/vault/ShareModal.svelte';

  const builder = createBuilderStore();
  const vault = createVaultStore();
  const playback = createPlaybackClock(() => builder.steps.length, 800);

  let showTemplateVault = $state(false);
  let showShareModal = $state(false);

  const activePresetName = $derived.by(() => {
    const match = ARRAY_PRESETS.find((p) =>
      p.array.length === builder.options.array.length &&
      p.array.every((val, i) => val === builder.options.array[i])
    );
    return match ? match.label : 'Custom Array';
  });

  const currentStep = $derived(
    builder.steps.length > 0 ? builder.steps[playback.currentStepIndex] : null
  );

  const activeQuiz = $derived(
    builder.options.quizMode && currentStep?.quizPause ? currentStep.quizPause : null
  );

  $effect(() => {
    if (activeQuiz && playback.isPlaying) {
      playback.pause();
    }
  });

  onMount(() => {
    if (typeof window !== 'undefined') {
      builder.loadFromUrl(window.location.search);
    }
  });

  function handleRunSimulation() {
    playback.reset();
  }

  function handlePresetSelect(array: number[]) {
    builder.applyPreset(array);
    playback.reset();
  }

  function handleQuizAnswer(selected: 'fullOverlap' | 'partialOverlap' | 'noOverlap') {
    if (activeQuiz) {
      vault.answerQuiz(selected, activeQuiz.correctAnswer);
      playback.seekToStep(playback.currentStepIndex + 1);
      playback.play();
    }
  }
</script>

<main class="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-3 md:p-5 flex flex-col justify-between">
  <!-- Header Navbar -->
  <header class="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center font-bold text-slate-950 font-mono shadow-[0_0_12px_rgba(0,242,254,0.5)]">
        ST
      </div>
      <div>
        <h1 class="text-lg font-black tracking-tight text-white flex items-center gap-2">
          Segment Tree Interactive Studio
          <span class="text-[10px] font-mono font-normal px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">
            Svelte 5 Runes
          </span>
        </h1>
        <p class="text-xs text-slate-400">Pure Client-Side Visual Learning & Time-Travel Debugger</p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <!-- Active Preset Label Badge -->
      <span data-testid="active-preset-label" class="text-xs font-mono text-cyan-300 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded">
        {activePresetName}
      </span>

      <button
        type="button"
        aria-label="Share"
        onclick={() => (showShareModal = true)}
        class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold rounded border border-slate-700 transition-all flex items-center gap-1.5"
      >
        🔗 Share
      </button>

      <button
        type="button"
        aria-label="C++ Template Vault"
        onclick={() => (showTemplateVault = true)}
        class="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 font-mono text-xs font-bold rounded border border-purple-500/40 transition-all flex items-center gap-1.5"
      >
        ⚡ C++ Vault
      </button>
    </div>
  </header>

  <!-- Malformed Link Warning Notice -->
  {#if builder.isMalformedUrl}
    <div
      data-testid="malformed-link-notice"
      class="mb-3 p-3 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-200 text-xs font-mono flex items-center justify-between"
    >
      <span>⚠ Invalid or malformed shared URL detected. Restored default scenario.</span>
    </div>
  {/if}

  <!-- Preset Selector Quick Bar -->
  <div class="flex items-center gap-2 mb-3">
    <span class="text-xs font-semibold text-slate-400">Quick Presets:</span>
    {#each ARRAY_PRESETS as preset}
      <button
        type="button"
        onclick={() => handlePresetSelect(preset.array)}
        class={`px-2.5 py-1 text-xs rounded font-mono font-medium transition-all border ${
          activePresetName === preset.label
            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-[0_0_8px_rgba(0,242,254,0.3)]'
            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
        }`}
      >
        {preset.label}
      </button>
    {/each}
  </div>

  <!-- Main Desktop 2x2 Grid Layout -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
    <!-- Left Column (Module A + Module B Visual Canvas) -->
    <div class="lg:col-span-7 flex flex-col gap-4">
      <ScenarioBuilder
        {builder}
        onRun={handleRunSimulation}
      />
      <TreeCanvas
        layout={builder.layout}
        {currentStep}
        originalArray={builder.options.array}
      />
    </div>

    <!-- Right Column (Module C Synchronized Code Workbench & Narratives) -->
    <div class="lg:col-span-5 flex flex-col justify-between gap-4">
      <CodeWorkbench
        activeCodeLine={currentStep?.codeLine ?? 1}
        operation={builder.options.operation}
        lazy={builder.options.lazy}
      />
      <StepNarrative step={currentStep} />
      <PlaybackDeck
        clock={playback}
        totalSteps={builder.steps.length}
      />
    </div>
  </div>

  <!-- Modals -->
  {#if activeQuiz}
    <QuizModal
      quiz={activeQuiz}
      onAnswer={handleQuizAnswer}
    />
  {/if}

  {#if showTemplateVault}
    <TemplateVault
      {vault}
      scenario={builder.options}
      onClose={() => (showTemplateVault = false)}
    />
  {/if}

  {#if showShareModal}
    <ShareModal
      shareUrl={builder.getShareableUrl()}
      onClose={() => (showShareModal = false)}
    />
  {/if}
</main>
