import type { VerdictLevel } from '@shared/types';

export function getScoreColor(score: number): string {
  if (score <= 3) return 'text-score-false';
  if (score <= 5) return 'text-score-mixed';
  if (score <= 7) return 'text-score-mostly-true';
  return 'text-score-true';
}

export function getScoreBgColor(score: number): string {
  if (score <= 3) return 'bg-score-false';
  if (score <= 5) return 'bg-score-mixed';
  if (score <= 7) return 'bg-score-mostly-true';
  return 'bg-score-true';
}

export function getVerdictColor(verdict: VerdictLevel): string {
  switch (verdict) {
    case 'true':
      return 'text-score-true';
    case 'mostly_true':
      return 'text-score-mostly-true';
    case 'mixed':
      return 'text-score-mixed';
    case 'mostly_false':
      return 'text-score-mostly-false';
    case 'false':
      return 'text-score-false';
    case 'unverifiable':
      return 'text-gray-500';
  }
}

export function getVerdictBgColor(verdict: VerdictLevel): string {
  switch (verdict) {
    case 'true':
      return 'bg-green-50 border-green-200';
    case 'mostly_true':
      return 'bg-lime-50 border-lime-200';
    case 'mixed':
      return 'bg-amber-50 border-amber-200';
    case 'mostly_false':
      return 'bg-orange-50 border-orange-200';
    case 'false':
      return 'bg-red-50 border-red-200';
    case 'unverifiable':
      return 'bg-gray-50 border-gray-200';
  }
}

export function getAlignmentLabel(alignment: string): { label: string; color: string } {
  switch (alignment) {
    case 'confirms':
      return { label: 'Confirma', color: 'bg-green-100 text-green-800' };
    case 'denies':
      return { label: 'Contradice', color: 'bg-red-100 text-red-800' };
    case 'partially_relevant':
      return { label: 'Parcialmente relevante', color: 'bg-amber-100 text-amber-800' };
    default:
      return { label: 'No relacionado', color: 'bg-gray-100 text-gray-600' };
  }
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
