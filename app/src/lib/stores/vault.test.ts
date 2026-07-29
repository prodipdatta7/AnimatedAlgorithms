import { describe, it, expect } from 'vitest';
import { createVaultStore, generateCppTemplate } from './vault.svelte';

describe('createVaultStore', () => {
  it('generates C++20 boilerplate matching scenario options', () => {
    const code = generateCppTemplate({
      includeFastIO: true,
      indexing: '0-based',
      lazy: true,
      aggregate: 'sum',
    });

    expect(code).toContain('std::ios_base::sync_with_stdio(false);');
    expect(code).toContain('vector<T> lazy;');
    expect(code).toContain('updateRange(');
  });

  it('manages quiz answer state cleanly', () => {
    const vault = createVaultStore();
    expect(vault.quizAnswerState.selected).toBeNull();
    vault.answerQuiz('fullOverlap', 'fullOverlap');
    expect(vault.quizAnswerState.isCorrect).toBe(true);
    vault.resetQuiz();
    expect(vault.quizAnswerState.selected).toBeNull();
  });
});
