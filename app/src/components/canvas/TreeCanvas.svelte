<script lang="ts">
  import type { TreeNodePosition, AlgorithmStep } from '../../lib/algorithm-step.types';
  import TreeNodeElement from './TreeNodeElement.svelte';
  import LazyDroplet from './LazyDroplet.svelte';
  import LeafArrayBar from './LeafArrayBar.svelte';

  interface Props {
    layout: TreeNodePosition[];
    currentStep: AlgorithmStep | null;
    originalArray: number[];
  }

  let { layout, currentStep, originalArray }: Props = $props();

  // Helper map for layout positions by node ID
  const layoutMap = $derived(new Map(layout.map((pos) => [pos.id, pos])));

  // Calculate parent-child tree edges
  const treeEdges = $derived.by(() => {
    const edges: { parent: TreeNodePosition; child: TreeNodePosition }[] = [];
    layout.forEach((pos) => {
      if (pos.id === 0) return;
      const parentId = Math.floor((pos.id - 1) / 2);
      const parentPos = layoutMap.get(parentId);
      if (parentPos) {
        edges.push({ parent: parentPos, child: pos });
      }
    });
    return edges;
  });

  // Calculate node state map for current step
  const activeNodeId = $derived(currentStep?.nodeId ?? null);

  function getNodeState(nodeId: number) {
    if (currentStep && currentStep.nodeId === nodeId) {
      return currentStep.state;
    }
    return 'outOfRange';
  }

  function getNodeValue(pos: TreeNodePosition) {
    if (currentStep && currentStep.nodeId === pos.id && currentStep.value !== null) {
      return currentStep.value;
    }
    return null;
  }

  function getNodeLazyTag(pos: TreeNodePosition) {
    if (currentStep && currentStep.nodeId === pos.id) {
      return currentStep.lazyTag;
    }
    return null;
  }
</script>

<section class="bg-slate-950/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col justify-between h-full">
  <div class="flex items-center justify-between mb-2">
    <div>
      <h2 class="text-sm font-bold uppercase tracking-wider text-cyan-400">Module B: Visual Simulation & Motion Canvas</h2>
      <p class="text-xs text-slate-400">Dynamic Reingold–Tilford Tree Graph (N = {originalArray.length})</p>
    </div>
    {#if currentStep}
      <div class="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono">
        Active Node: <span class="text-cyan-300 font-bold">#{currentStep.nodeId}</span>
        [Range {currentStep.range.l}..{currentStep.range.r}]
      </div>
    {/if}
  </div>

  <!-- SVG Tree Canvas -->
  <div class="relative w-full overflow-hidden bg-slate-900/60 rounded-lg border border-slate-800 p-2 min-h-[360px] flex items-center justify-center">
    <svg viewBox="0 0 1000 480" class="w-full h-auto max-h-[460px]">
      <!-- SVG Definitions / Gradients -->
      <defs>
        <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#334155" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
      </defs>

      <!-- Parent -> Child Tree Edges -->
      {#each treeEdges as edge}
        <line
          x1={edge.parent.x}
          y1={edge.parent.y}
          x2={edge.child.x}
          y2={edge.child.y}
          stroke={activeNodeId === edge.child.id || activeNodeId === edge.parent.id ? '#00f2fe' : '#334155'}
          stroke-width={activeNodeId === edge.child.id || activeNodeId === edge.parent.id ? '2.5' : '1.5'}
          stroke-opacity={activeNodeId === edge.child.id ? '0.9' : '0.4'}
          class="transition-all duration-300"
        />
      {/each}

      <!-- Tree Nodes -->
      {#each layout as pos}
        <TreeNodeElement
          position={pos}
          state={getNodeState(pos.id)}
          value={getNodeValue(pos)}
          lazyTag={getNodeLazyTag(pos)}
          isActive={activeNodeId === pos.id}
        />
      {/each}

      <!-- Lazy Droplet Motion Cascade -->
      {#if currentStep && currentStep.lazyTag !== null && currentStep.nodeId > 0}
        {@const parentId = Math.floor((currentStep.nodeId - 1) / 2)}
        {@const parentPos = layoutMap.get(parentId)}
        {@const childPos = layoutMap.get(currentStep.nodeId)}
        {#if parentPos && childPos}
          <LazyDroplet
            startX={parentPos.x}
            startY={parentPos.y}
            endX={childPos.x}
            endY={childPos.y}
            tagValue={currentStep.lazyTag}
          />
        {/if}
      {/if}
    </svg>
  </div>

  <!-- Synchronized 1D Leaf Array Bar -->
  <LeafArrayBar
    array={originalArray}
    activeIndex={currentStep ? (currentStep.range.l === currentStep.range.r ? currentStep.range.l : null) : null}
    activeRange={currentStep ? currentStep.range : null}
  />
</section>
