import { describe, it, expect } from 'vitest';
import { createPlaybackClock } from './playback.svelte';

describe('createPlaybackClock', () => {
  it('initializes with default step 0 and stopped state', () => {
    const clock = createPlaybackClock(() => 10, 800);
    expect(clock.currentStepIndex).toBe(0);
    expect(clock.isPlaying).toBe(false);
    expect(clock.progressPercentage).toBe(0);
  });

  it('seeks accurately to a given step index', () => {
    const clock = createPlaybackClock(() => 10, 800);
    clock.seekToStep(4);
    expect(clock.currentStepIndex).toBe(4);
    expect(clock.currentTime).toBe(3200);
  });

  it('caps playback rate between 0.25x and 2.0x', () => {
    const clock = createPlaybackClock(() => 10, 800);
    clock.setRate(0.1);
    expect(clock.playbackRate).toBe(0.25);
    clock.setRate(3.0);
    expect(clock.playbackRate).toBe(2.0);
    clock.setRate(1.5);
    expect(clock.playbackRate).toBe(1.5);
  });

  it('resets clock back to step 0', () => {
    const clock = createPlaybackClock(() => 10, 800);
    clock.seekToStep(5);
    expect(clock.currentStepIndex).toBe(5);
    clock.reset();
    expect(clock.currentStepIndex).toBe(0);
    expect(clock.currentTime).toBe(0);
    expect(clock.isPlaying).toBe(false);
  });
});
