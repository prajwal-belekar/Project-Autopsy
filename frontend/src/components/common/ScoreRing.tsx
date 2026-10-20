import { healthColor } from '../../utils/severity';

/** Restrained radial score indicator. */
export function ScoreRing({ score, size = 136, label }: { score: number; size?: number; label: string }) {
  const stroke = 10;
  const r = (size - stroke) / 2 - 2;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, score / 100));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#202832" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={healthColor(score)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * frac} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[30px] font-semibold leading-none tabular-nums text-ink">{score}</span>
        <span className="mt-1 text-2xs text-faint">/ 100</span>
      </div>
    </div>
  );
}
