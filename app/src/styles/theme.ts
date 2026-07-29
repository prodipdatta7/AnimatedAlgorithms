import type { NodeOverlapState } from '../lib/algorithm-step.types';

export interface StateThemeConfig {
  fill: string;
  stroke: string;
  strokeDasharray: string;
  badgeText: string;
  label: string;
}

export const STATE_THEMES: Record<NodeOverlapState, StateThemeConfig> = {
  visiting: {
    fill: '#1e293b',
    stroke: '#f59e0b',
    strokeDasharray: '4 2',
    badgeText: 'VISIT',
    label: 'Visiting',
  },
  fullOverlap: {
    fill: '#064e3b',
    stroke: '#10b981',
    strokeDasharray: 'none',
    badgeText: 'FULL',
    label: 'Full Overlap',
  },
  partialOverlap: {
    fill: '#78350f',
    stroke: '#d97706',
    strokeDasharray: '6 3',
    badgeText: 'PARTIAL',
    label: 'Partial Overlap',
  },
  outOfRange: {
    fill: '#1e293b',
    stroke: '#475569',
    strokeDasharray: '2 2',
    badgeText: 'PRUNED',
    label: 'Out of Range',
  },
  updated: {
    fill: '#4c1d95',
    stroke: '#8b5cf6',
    strokeDasharray: 'none',
    badgeText: 'UPDATED',
    label: 'Value Updated',
  },
};

export const CYBERPUNK_PALETTE = {
  bgDark: '#0b0f19',
  panelBg: '#111827',
  cyanAccent: '#00f2fe',
  cyanGlow: 'rgba(0, 242, 254, 0.25)',
  purpleAccent: '#8b5cf6',
  borderDark: '#1f2937',
  textMuted: '#94a3b8',
};
