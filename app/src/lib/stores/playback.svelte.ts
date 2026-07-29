/**
 * Custom Transport Clock per AGENTS.md §4.6
 * Single source of truth for step playback timing, scrubbing, and speed selection.
 */

export function createPlaybackClock(getTotalSteps: () => number, stepDurationMs = 800) {
  let currentTime = $state(0);
  let playbackRate = $state(1);
  let isPlaying = $state(false);
  let rafId: number | null = null;
  let lastFrameTime: number | null = null;

  const totalSteps = $derived(getTotalSteps());
  const maxTime = $derived(Math.max(0, (totalSteps - 1) * stepDurationMs));

  const currentStepIndex = $derived(
    totalSteps === 0 ? 0 : Math.min(totalSteps - 1, Math.floor(currentTime / stepDurationMs))
  );

  const progressPercentage = $derived(
    maxTime === 0 ? 0 : Math.min(100, (currentTime / maxTime) * 100)
  );

  function tick(now: number) {
    if (!isPlaying) return;

    if (lastFrameTime !== null) {
      const delta = now - lastFrameTime;
      currentTime = Math.min(maxTime, currentTime + delta * playbackRate);
    }

    lastFrameTime = now;

    if (currentTime >= maxTime) {
      isPlaying = false;
      lastFrameTime = null;
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  function play() {
    if (totalSteps <= 1) return;
    if (currentTime >= maxTime) {
      currentTime = 0;
    }
    isPlaying = true;
    lastFrameTime = null;
    rafId = requestAnimationFrame(tick);
  }

  function pause() {
    isPlaying = false;
    lastFrameTime = null;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function seek(ms: number) {
    currentTime = Math.max(0, Math.min(ms, maxTime));
  }

  function seekToStep(stepIdx: number) {
    const targetMs = Math.max(0, Math.min(stepIdx, totalSteps - 1)) * stepDurationMs;
    seek(targetMs);
  }

  function setRate(rate: number) {
    playbackRate = Math.max(0.25, Math.min(rate, 2.0));
  }

  function reset() {
    pause();
    currentTime = 0;
  }

  return {
    get currentTime() {
      return currentTime;
    },
    get playbackRate() {
      return playbackRate;
    },
    get isPlaying() {
      return isPlaying;
    },
    get currentStepIndex() {
      return currentStepIndex;
    },
    get progressPercentage() {
      return progressPercentage;
    },
    get stepDurationMs() {
      return stepDurationMs;
    },
    play,
    pause,
    seek,
    seekToStep,
    setRate,
    reset,
  };
}

export type PlaybackClock = ReturnType<typeof createPlaybackClock>;
