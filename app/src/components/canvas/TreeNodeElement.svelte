<script lang="ts">
  import type { TreeNodePosition, NodeOverlapState } from '../../lib/algorithm-step.types';
  import { STATE_THEMES } from '../../styles/theme';

  interface Props {
    position: TreeNodePosition;
    state: NodeOverlapState;
    value: number | null;
    lazyTag: number | null;
    isActive: boolean;
  }

  let { position, state, value, lazyTag, isActive }: Props = $props();

  const theme = $derived(STATE_THEMES[state]);
  const nodeRadius = 24;
</script>

<g
  class="transition-all duration-300 transform"
  transform={`translate(${position.x}, ${position.y})`}
  data-node-id={position.id}
  data-node-state={state}
>
  <!-- Outer Visiting/Active Pulse Ring -->
  {#if isActive}
    <circle
      r={nodeRadius + 6}
      fill="none"
      stroke="#f59e0b"
      stroke-width="3"
      stroke-dasharray="4 2"
      class="animate-spin-slow"
    />
  {/if}

  <!-- Node Circle with Fill Color & Non-Color Redundant Stroke (AGENTS.md §4.2) -->
  <circle
    r={nodeRadius}
    fill={theme.fill}
    stroke={theme.stroke}
    stroke-width={isActive ? '4' : '2.5'}
    stroke-dasharray={theme.strokeDasharray}
    class="transition-colors duration-300"
  />

  <!-- Range Label Above Node -->
  <text
    y={-nodeRadius - 6}
    text-anchor="middle"
    class="text-[10px] font-mono fill-slate-300 font-bold select-none"
  >
    [{position.nodeRange.l}..{position.nodeRange.r}]
  </text>

  <!-- Node Aggregate Value Inside Circle -->
  <text
    y="4"
    text-anchor="middle"
    class="text-xs font-mono font-bold fill-white select-none pointer-events-none"
  >
    {value !== null && value !== undefined ? value : '?'}
  </text>

  <!-- Lazy Tag Badge Below Node if Pending -->
  {#if lazyTag !== null && lazyTag !== undefined}
    <g transform={`translate(0, ${nodeRadius + 14})`}>
      <rect
        x="-18"
        y="-8"
        width="36"
        height="14"
        rx="3"
        fill="#8b5cf6"
        stroke="#c4b5fd"
        stroke-width="1"
      />
      <text
        y="2"
        text-anchor="middle"
        class="text-[9px] font-mono font-bold fill-white select-none"
      >
        +{lazyTag}
      </text>
    </g>
  {/if}

  <!-- Accessibility Badge for Non-Color Redundant Signal (§4.2) -->
  <g transform={`translate(${nodeRadius - 4}, ${-nodeRadius + 4})`} data-testid="state-badge">
    <circle r="7" fill={theme.stroke} />
    <text
      y="2.5"
      text-anchor="middle"
      class="text-[7px] font-mono font-black fill-slate-950 uppercase select-none"
    >
      {theme.badgeText.substring(0, 1)}
    </text>
  </g>
</g>
