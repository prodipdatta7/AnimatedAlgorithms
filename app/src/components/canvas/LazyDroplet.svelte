<script lang="ts">
  import { spring } from 'svelte/motion';

  interface Props {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    tagValue: number;
  }

  let { startX, startY, endX, endY, tagValue }: Props = $props();

  const coords = spring({ x: 0, y: 0 }, { stiffness: 0.15, damping: 0.8 });

  $effect(() => {
    coords.set({ x: startX, y: startY }, { hard: true });
    coords.set({ x: endX, y: endY });
  });
</script>

<g transform={`translate(${$coords.x}, ${$coords.y})`}>
  <circle r="10" fill="#8b5cf6" stroke="#00f2fe" stroke-width="2" class="animate-pulse" />
  <text
    y="3"
    text-anchor="middle"
    class="text-[9px] font-mono font-bold fill-white select-none"
  >
    +{tagValue}
  </text>
</g>
