<script lang="ts">
  interface Props {
    shareUrl: string;
    onClose: () => void;
  }

  let { shareUrl, onClose }: Props = $props();

  let copied = $state(false);

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }
</script>

<div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div class="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-md w-full shadow-2xl">
    <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
      <h3 class="text-base font-bold text-white">Share Scenario Link</h3>
      <button
        type="button"
        onclick={onClose}
        class="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 bg-slate-800 rounded"
      >
        ✕
      </button>
    </div>

    <p class="text-xs text-slate-400 mb-3">
      This link encodes your array input, operations, and toggles into a single Base64 parameter.
    </p>

    <div class="flex items-center gap-2 mb-4">
      <input
        type="text"
        readonly
        value={shareUrl}
        data-testid="share-url-output"
        class="w-full bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-xs p-2 rounded focus:outline-none"
      />
      <button
        type="button"
        onclick={handleCopy}
        class="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded whitespace-nowrap"
      >
        {copied ? 'COPIED!' : 'COPY'}
      </button>
    </div>
  </div>
</div>
