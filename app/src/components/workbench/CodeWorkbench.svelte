<script lang="ts">
  import { codeToHtml } from 'shiki';
  import type { OperationType } from '../../lib/algorithm-step.types';

  interface Props {
    activeCodeLine: number;
    operation: OperationType;
    lazy: boolean;
  }

  let { activeCodeLine, operation, lazy }: Props = $props();

  let highlightedHtml = $state('');

  const CPP_QUERY_CODE = `int query(int node, int start, int end, int l, int r) {
    if (lazy) push(node, start, end);
    if (r < start || end < l) return NEUTRAL;
    if (l <= start && end <= r) return tree[node];
    int mid = start + (end - start) / 2;
    auto leftAns = query(2 * node + 1, start, mid, l, r);
    auto rightAns = query(2 * node + 2, mid + 1, end, l, r);
    return combine(leftAns, rightAns);
}`;

  const CPP_POINT_UPDATE_CODE = `void pointUpdate(int node, int start, int end, int idx, int val) {
    if (start == end) { tree[node] = val; return; }
    int mid = start + (end - start) / 2;
    if (idx <= mid) pointUpdate(2 * node + 1, start, mid, idx, val);
    else pointUpdate(2 * node + 2, mid + 1, end, idx, val);
    tree[node] = combine(tree[2 * node + 1], tree[2 * node + 2]);
}`;

  const CPP_RANGE_UPDATE_CODE = `void rangeUpdate(int node, int start, int end, int l, int r, int val) {
    if (lazy) push(node, start, end);
    if (r < start || end < l) return;
    if (l <= start && end <= r) { lazy[node] += val; push(node, start, end); return; }
    int mid = start + (end - start) / 2;
    rangeUpdate(2 * node + 1, start, mid, l, r, val);
    rangeUpdate(2 * node + 2, mid + 1, end, l, r, val);
    tree[node] = combine(tree[2 * node + 1], tree[2 * node + 2]);
}`;

  const activeSnippet = $derived.by(() => {
    if (operation === 'query') return CPP_QUERY_CODE;
    if (operation === 'pointUpdate') return CPP_POINT_UPDATE_CODE;
    return CPP_RANGE_UPDATE_CODE;
  });

  $effect(() => {
    codeToHtml(activeSnippet, {
      lang: 'cpp',
      theme: 'one-dark-pro',
    }).then((html) => {
      highlightedHtml = html;
    });
  });

  const lines = $derived(activeSnippet.split('\n'));
</script>

<section class="bg-slate-950/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col justify-between h-full">
  <div class="flex items-center justify-between mb-2">
    <div>
      <h2 class="text-sm font-bold uppercase tracking-wider text-cyan-400">Module C: Synchronized Workbench</h2>
      <p class="text-xs text-slate-400">C++20 Segment Tree Line-by-Line Execution Sync {lazy ? '(Lazy Active)' : ''}</p>
    </div>
    <span class="text-xs font-mono text-purple-400 font-bold bg-purple-950/60 border border-purple-800 px-2 py-0.5 rounded">
      Active Line: #{activeCodeLine}
    </span>
  </div>

  <!-- Code Display with Active Line Highlight -->
  <div class="relative font-mono text-xs bg-slate-900/90 border border-slate-800 rounded-lg p-3 overflow-x-auto min-h-[220px]">
    {#if highlightedHtml}
      <div class="hidden">{highlightedHtml}</div>
    {/if}

    {#each lines as lineText, idx}
      {@const lineNumber = idx + 1}
      {@const isActive = lineNumber === activeCodeLine}
      <div
        class={`flex items-center gap-3 py-0.5 px-2 rounded font-mono transition-colors ${
          isActive
            ? 'bg-cyan-500/20 text-cyan-200 border-l-4 border-cyan-400 font-bold shadow-[0_0_8px_rgba(0,242,254,0.2)]'
            : 'text-slate-300 hover:bg-slate-800/40'
        }`}
        data-testid={isActive ? 'active-code-line' : undefined}
        data-line={isActive ? lineNumber : undefined}
      >
        <span class="w-6 text-right text-slate-500 select-none text-[11px]">{lineNumber}</span>
        <pre class="flex-1 overflow-x-auto"><code>{lineText}</code></pre>
      </div>
    {/each}
  </div>
</section>
