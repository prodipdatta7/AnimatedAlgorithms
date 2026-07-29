import type {
  AlgorithmStep,
  ScenarioOptions,
  AggregateFunction,
  NodeOverlapState,
  QuizPauseData,
} from './algorithm-step.types';

export function combineValues(a: number | null, b: number | null, agg: AggregateFunction): number | null {
  if (a === null) return b;
  if (b === null) return a;
  if (agg === 'sum') return a + b;
  if (agg === 'min') return Math.min(a, b);
  if (agg === 'max') return Math.max(a, b);
  return a;
}

export function getNeutralValue(agg: AggregateFunction): number {
  if (agg === 'sum') return 0;
  if (agg === 'min') return Infinity;
  if (agg === 'max') return -Infinity;
  return 0;
}

export function generateSteps(options: ScenarioOptions): AlgorithmStep[] {
  const { array, aggregate, lazy, quizMode } = options;
  const n = array.length;
  if (n < 2 || n > 16) {
    return [];
  }

  const steps: AlgorithmStep[] = [];
  let stepIndex = 0;

  const treeSize = 4 * n;
  const tree: (number | null)[] = new Array(treeSize).fill(null);
  const lazyTags: (number | null)[] = new Array(treeSize).fill(null);

  function buildTree(node: number, start: number, end: number) {
    if (start > end) return;
    if (start === end) {
      tree[node] = array[start];
      return;
    }
    const mid = Math.floor((start + end) / 2);
    const left = 2 * node + 1;
    const right = 2 * node + 2;
    buildTree(left, start, mid);
    buildTree(right, mid + 1, end);
    tree[node] = combineValues(tree[left], tree[right], aggregate);
  }

  buildTree(0, 0, n - 1);

  function addStep(
    nodeId: number,
    range: { l: number; r: number },
    state: NodeOverlapState,
    value: number | null,
    lazyTag: number | null,
    codeLine: number,
    narrative: string,
    quizPause?: QuizPauseData
  ) {
    const step: AlgorithmStep = {
      stepIndex: stepIndex++,
      operation: options.operation,
      nodeId,
      range,
      state,
      value,
      lazyTag,
      codeLine,
      narrative,
    };
    if (quizMode && quizPause) {
      step.quizPause = quizPause;
    }
    steps.push(step);
  }

  function pushLazy(node: number, start: number, end: number, depth = 0) {
    if (start > end) return;
    if (!lazy || lazyTags[node] === null || lazyTags[node] === 0) return;

    const tag = lazyTags[node]!;
    lazyTags[node] = null;

    const count = end - start + 1;
    if (aggregate === 'sum') {
      tree[node] = (tree[node] ?? 0) + tag * count;
    } else {
      tree[node] = (tree[node] ?? 0) + tag;
    }

    addStep(
      node,
      { l: start, r: end },
      'visiting',
      tree[node],
      tag,
      2,
      `Pushing pending Lazy Tag (+${tag}) from Node ${node} [Range ${start}..${end}].`
    );

    if (start !== end && depth < 2) {
      const mid = Math.floor((start + end) / 2);
      const left = 2 * node + 1;
      const right = 2 * node + 2;
      lazyTags[left] = (lazyTags[left] ?? 0) + tag;
      lazyTags[right] = (lazyTags[right] ?? 0) + tag;

      addStep(
        left,
        { l: start, r: mid },
        'visiting',
        tree[left],
        lazyTags[left],
        2,
        `Lazy Tag (+${tag}) received at Left Child Node ${left} [Range ${start}..${mid}].`
      );
      addStep(
        right,
        { l: mid + 1, r: end },
        'visiting',
        tree[right],
        lazyTags[right],
        2,
        `Lazy Tag (+${tag}) received at Right Child Node ${right} [Range ${mid + 1}..${end}].`
      );

      pushLazy(left, start, mid, depth + 1);
      pushLazy(right, mid + 1, end, depth + 1);
    }
  }

  if (options.operation === 'query') {
    const { l: qL, r: qR } = options.range;

    function queryTree(node: number, start: number, end: number): number | null {
      if (start > end) return null;

      addStep(
        node,
        { l: start, r: end },
        'visiting',
        tree[node],
        lazyTags[node],
        1,
        `Visiting Tree Node ${node} [Range ${start}..${end}] for Query [${qL}..${qR}].`
      );

      if (lazy) {
        pushLazy(node, start, end);
      }

      if (qR < start || end < qL) {
        addStep(
          node,
          { l: start, r: end },
          'outOfRange',
          tree[node],
          lazyTags[node],
          3,
          `Node ${node} [Range ${start}..${end}] does NOT overlap with Query [${qL}..${qR}]. Pruning search branch.`,
          {
            prompt: `Does node ${node} [${start}..${end}] overlap with query range [${qL}..${qR}]?`,
            correctAnswer: 'noOverlap',
          }
        );
        return null;
      }

      if (qL <= start && end <= qR) {
        const val = tree[node];
        addStep(
          node,
          { l: start, r: end },
          'fullOverlap',
          val,
          lazyTags[node],
          4,
          `Node ${node} [Range ${start}..${end}] is FULLY contained within Query [${qL}..${qR}]. Returning value ${val}.`,
          {
            prompt: `What overlap classification is node ${node} [${start}..${end}] for query [${qL}..${qR}]?`,
            correctAnswer: 'fullOverlap',
          }
        );
        return val;
      }

      addStep(
        node,
        { l: start, r: end },
        'partialOverlap',
        tree[node],
        lazyTags[node],
        5,
        `Node ${node} [Range ${start}..${end}] PARTIALLY overlaps Query [${qL}..${qR}]. Recursing left and right children.`,
        {
          prompt: `What overlap classification is node ${node} [${start}..${end}] for query [${qL}..${qR}]?`,
          correctAnswer: 'partialOverlap',
        }
      );

      const mid = Math.floor((start + end) / 2);
      const leftVal = queryTree(2 * node + 1, start, mid);
      const rightVal = queryTree(2 * node + 2, mid + 1, end);

      const result = combineValues(leftVal, rightVal, aggregate);
      addStep(
        node,
        { l: start, r: end },
        'fullOverlap',
        result,
        lazyTags[node],
        8,
        `Combined child results for Node ${node} [Range ${start}..${end}] -> Result: ${result}.`
      );
      return result;
    }

    queryTree(0, 0, n - 1);
  } else if (options.operation === 'pointUpdate') {
    const { index: targetIdx, newValue } = options;

    function pointUpdateTree(node: number, start: number, end: number) {
      if (start > end) return;

      addStep(
        node,
        { l: start, r: end },
        'visiting',
        tree[node],
        lazyTags[node],
        1,
        `Visiting Node ${node} [Range ${start}..${end}] to update index ${targetIdx} to value ${newValue}.`
      );

      if (start === end) {
        tree[node] = newValue;
        addStep(
          node,
          { l: start, r: end },
          'updated',
          newValue,
          lazyTags[node],
          2,
          `Reached Leaf Node ${node} (Index ${start}). Value updated to ${newValue}.`
        );
        return;
      }

      const mid = Math.floor((start + end) / 2);
      const left = 2 * node + 1;
      const right = 2 * node + 2;

      if (targetIdx <= mid) {
        pointUpdateTree(left, start, mid);
      } else {
        pointUpdateTree(right, mid + 1, end);
      }

      tree[node] = combineValues(tree[left], tree[right], aggregate);
      addStep(
        node,
        { l: start, r: end },
        'updated',
        tree[node],
        lazyTags[node],
        6,
        `Recalculated aggregate value for internal Node ${node} [${start}..${end}] -> New aggregate: ${tree[node]}.`
      );
    }

    pointUpdateTree(0, 0, n - 1);
  } else if (options.operation === 'rangeUpdate') {
    const { l: uL, r: uR } = options.range;
    const { delta } = options;

    function rangeUpdateTree(node: number, start: number, end: number) {
      if (start > end) return;

      addStep(
        node,
        { l: start, r: end },
        'visiting',
        tree[node],
        lazyTags[node],
        1,
        `Visiting Node ${node} [Range ${start}..${end}] for Range Update [${uL}..${uR}] (+${delta}).`
      );

      if (lazy) {
        pushLazy(node, start, end);
      }

      if (uR < start || end < uL) {
        addStep(
          node,
          { l: start, r: end },
          'outOfRange',
          tree[node],
          lazyTags[node],
          3,
          `Node ${node} [Range ${start}..${end}] is outside update range [${uL}..${uR}]. Pruning branch.`
        );
        return;
      }

      if (uL <= start && end <= uR) {
        if (lazy) {
          lazyTags[node] = (lazyTags[node] ?? 0) + delta;
          pushLazy(node, start, end);
          addStep(
            node,
            { l: start, r: end },
            'updated',
            tree[node],
            lazyTags[node],
            4,
            `Node ${node} [Range ${start}..${end}] is FULLY within update range. Applied lazy tag delta (+${delta}). New value: ${tree[node]}.`
          );
        } else {
          if (start === end) {
            tree[node] = (tree[node] ?? 0) + delta;
            addStep(
              node,
              { l: start, r: end },
              'updated',
              tree[node],
              null,
              4,
              `Updated leaf Node ${node} [${start}..${end}] to ${tree[node]}.`
            );
          } else {
            const mid = Math.floor((start + end) / 2);
            rangeUpdateTree(2 * node + 1, start, mid);
            rangeUpdateTree(2 * node + 2, mid + 1, end);
            tree[node] = combineValues(tree[2 * node + 1], tree[2 * node + 2], aggregate);
            addStep(
              node,
              { l: start, r: end },
              'updated',
              tree[node],
              null,
              8,
              `Updated internal Node ${node} [${start}..${end}] to ${tree[node]}.`
            );
          }
        }
        return;
      }

      addStep(
        node,
        { l: start, r: end },
        'partialOverlap',
        tree[node],
        lazyTags[node],
        5,
        `Node ${node} [Range ${start}..${end}] PARTIALLY overlaps update range [${uL}..${uR}]. Pushing updates down.`
      );

      const mid = Math.floor((start + end) / 2);
      const left = 2 * node + 1;
      const right = 2 * node + 2;
      rangeUpdateTree(left, start, mid);
      rangeUpdateTree(right, mid + 1, end);

      tree[node] = combineValues(tree[left], tree[right], aggregate);
      addStep(
        node,
        { l: start, r: end },
        'updated',
        tree[node],
        lazyTags[node],
        8,
        `Recalculated Node ${node} [${start}..${end}] after child updates -> New value: ${tree[node]}.`
      );
    }

    rangeUpdateTree(0, 0, n - 1);
  }

  return steps;
}
