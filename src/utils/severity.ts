import type { Severity, SignalLevel } from '../types';

export type ChipTone = 'ok' | 'warn' | 'high' | 'crit' | 'accent' | 'note' | 'neutral';

export const toneHex: Record<ChipTone, string> = {
  ok: '#22C55E',
  warn: '#F59E0B',
  high: '#F97316',
  crit: '#EF4444',
  accent: '#22D3EE',
  note: '#8B5CF6',
  neutral: '#6B7785',
};

export const severityTone: Record<Severity, ChipTone> = {
  critical: 'crit',
  high: 'high',
  medium: 'warn',
  low: 'ok',
  informational: 'accent',
};

export const severityLabel: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  informational: 'Informational',
};

/** Map a 0–100 risk score to a severity bucket. */
export function riskSeverity(score: number): Severity {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/** Map a 0–100 health score to a severity bucket (higher = healthier). */
export function healthSeverity(score: number): Severity {
  if (score >= 75) return 'low';
  if (score >= 60) return 'medium';
  if (score >= 45) return 'high';
  return 'critical';
}

export function healthColor(score: number): string {
  const s = healthSeverity(score);
  return s === 'low' ? '#22C55E' : s === 'medium' ? '#F59E0B' : s === 'high' ? '#F97316' : '#EF4444';
}

export function signalTone(level: SignalLevel, lowIsBad = false): ChipTone {
  switch (level) {
    case 'high':
      return 'high';
    case 'moderate':
    case 'medium':
    case 'partial':
      return 'warn';
    case 'available':
      return 'ok';
    case 'low':
      return lowIsBad ? 'high' : 'ok';
    case 'none':
      return 'neutral';
  }
}

export function signalLabel(level: SignalLevel): string {
  switch (level) {
    case 'high':
      return 'High';
    case 'moderate':
      return 'Moderate';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    case 'available':
      return 'Available';
    case 'partial':
      return 'Partial';
    case 'none':
      return 'Not detected';
  }
}

export const levelLabel = signalLabel;
