import { hierarchy, tree } from 'd3-hierarchy';
import type { TreeNodePosition } from './algorithm-step.types';

interface InternalHierarchyNode {
  id: number;
  start: number;
  end: number;
  arrayIndex: number | null;
  children?: InternalHierarchyNode[];
}

export function calculateTreeLayout(
  array: number[],
  canvasWidth = 1000,
  canvasHeight = 500
): TreeNodePosition[] {
  const n = array.length;
  if (n === 0) return [];

  // Build recursive tree structure starting from node 0 (range [0, N-1])
  function buildNode(nodeId: number, start: number, end: number): InternalHierarchyNode {
    const isLeaf = start === end;
    const node: InternalHierarchyNode = {
      id: nodeId,
      start,
      end,
      arrayIndex: isLeaf ? start : null,
    };

    if (!isLeaf) {
      const mid = Math.floor((start + end) / 2);
      node.children = [
        buildNode(2 * nodeId + 1, start, mid),
        buildNode(2 * nodeId + 2, mid + 1, end),
      ];
    }

    return node;
  }

  const rootData = buildNode(0, 0, n - 1);
  const rootHierarchy = hierarchy<InternalHierarchyNode>(rootData);

  // Apply d3 Reingold-Tilford tree layout algorithm
  const paddingX = 60;
  const paddingTop = 60;
  const paddingBottom = 60;

  const layoutEngine = tree<InternalHierarchyNode>().size([
    canvasWidth - 2 * paddingX,
    canvasHeight - paddingTop - paddingBottom,
  ]);

  const layoutRoot = layoutEngine(rootHierarchy);

  const nodePositions: TreeNodePosition[] = [];

  layoutRoot.each((node) => {
    nodePositions.push({
      id: node.data.id,
      nodeRange: { l: node.data.start, r: node.data.end },
      isLeaf: node.data.arrayIndex !== null,
      arrayIndex: node.data.arrayIndex,
      x: node.x + paddingX,
      y: node.y + paddingTop,
      depth: node.depth,
    });
  });

  return nodePositions;
}
