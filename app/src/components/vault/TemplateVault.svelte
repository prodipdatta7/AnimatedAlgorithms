<script lang="ts">
  import type { VaultStore } from '../../lib/stores/vault.svelte';
  import type { ScenarioOptions } from '../../lib/algorithm-step.types';

  interface Props {
    vault: VaultStore;
    scenario: ScenarioOptions;
    onClose: () => void;
  }

  let { vault, scenario, onClose }: Props = $props();

  let copied = $state(false);

  const templateCode = $derived(vault.getTemplateForOptions(scenario));

  function handleCopy() {
    navigator.clipboard.writeText(templateCode);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }
</script>

<div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div class="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh]">
    <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
      <div>
        <h3 class="text-base font-bold text-white">Module D: CP C++20 Template Vault</h3>
        <p class="text-xs text-slate-400">Contest-ready, optimized C++20 Segment Tree boilerplate</p>
      </div>
      <button
        type="button"
        onclick={onClose}
        class="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 bg-slate-800 rounded"
      >
        ✕
      </button>
    </div>

    <!-- Toggles -->
    <div class="flex items-center justify-between mb-3 bg-slate-950 p-2.5 rounded border border-slate-800">
      <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={vault.includeFastIO}
          onchange={(e) => vault.setFastIO((e.target as HTMLInputElement).checked)}
          class="rounded bg-slate-800 border-slate-700 text-cyan-500"
        />
        Include Fast I/O Snippet (`std::ios_base::sync_with_stdio`)
      </label>

      <button
        type="button"
        onclick={handleCopy}
        class="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded transition-all"
      >
        {copied ? '✓ COPIED!' : '📋 COPY TO CLIPBOARD'}
      </button>
    </div>

    <!-- Code Box -->
    <pre class="flex-1 bg-slate-950 p-3.5 rounded border border-slate-800 font-mono text-xs text-slate-200 overflow-y-auto leading-relaxed"><code>{templateCode}</code></pre>
  </div>
</div>
