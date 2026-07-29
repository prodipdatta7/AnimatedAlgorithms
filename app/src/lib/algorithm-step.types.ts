/**
 * AlgorithmStep and shared interface contracts per AGENTS.md §4.3
 */

export type AggregateFunction = 'sum' | 'min' | 'max';
export type IndexingMode = '0-based' | '1-based';
export type OperationType = 'query' | 'pointUpdate' | 'rangeUpdate';

export type NodeOverlapState =
  | 'visiting'
  | 'fullOverlap'
  | 'partialOverlap'
  | 'outOfRange'
  | 'updated';

export interface QuizPauseData {
  prompt: string;
  correctAnswer: 'fullOverlap' | 'partialOverlap' | 'noOverlap';
}

export interface AlgorithmStep {
  stepIndex: number;
  operation: OperationType;
  nodeId: number; // 0-indexed position in flattened 1D array representation of tree
  range: { l: number; r: number };
  state: NodeOverlapState;
  value: number | null; // node aggregate value at this step
  lazyTag: number | null; // pending lazy propagation tag
  codeLine: number; // 1-indexed line number in synced C++20 snippet
  narrative: string; // plain-English description
  quizPause?: QuizPauseData; // present when quiz mode is enabled
}

export interface BaseScenarioOptions {
  array: number[];
  aggregate: AggregateFunction;
  indexing: IndexingMode;
  lazy: boolean;
  quizMode?: boolean;
}

export interface QueryOptions extends BaseScenarioOptions {
  operation: 'query';
  range: { l: number; r: number };
}

export interface PointUpdateOptions extends BaseScenarioOptions {
  operation: 'pointUpdate';
  index: number;
  newValue: number;
}

export interface RangeUpdateOptions extends BaseScenarioOptions {
  operation: 'rangeUpdate';
  range: { l: number; r: number };
  delta: number;
}

export type ScenarioOptions = QueryOptions | PointUpdateOptions | RangeUpdateOptions;

export interface TreeNodePosition {
  id: number; // 0-indexed 1D tree node index
  nodeRange: { l: number; r: number };
  isLeaf: boolean;
  arrayIndex: number | null; // index into original array if leaf
  x: number; // normalized SVG x position
  y: number; // normalized SVG y position
  depth: number;
}
