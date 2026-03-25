import { VERDICT_LABELS } from '@shared/types';
import type { VerdictLevel } from '@shared/types';
import { getScoreColor, getVerdictColor } from '../../utils/formatters';

interface VeracityScoreProps {
  score: number;
  verdict: VerdictLevel;
}

export function VeracityScore({ score, verdict }: VeracityScoreProps) {
  const circumference = 2 * Math.PI * 45;
  const progress = (score / 10) * circumference;
  const strokeColor =
    score <= 3
      ? '#DC2626'
      : score <= 5
        ? '#D97706'
        : score <= 7
          ? '#65A30D'
          : '#16A34A';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
        </div>
      </div>
      <span className={`text-lg font-semibold ${getVerdictColor(verdict)}`}>
        {VERDICT_LABELS[verdict]}
      </span>
    </div>
  );
}
