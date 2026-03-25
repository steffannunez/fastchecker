import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Claim } from '@shared/types';
import { VERDICT_LABELS } from '@shared/types';
import { getScoreColor, getVerdictBgColor, getVerdictColor } from '../../utils/formatters';
import { SourceList } from './SourceList';

interface ClaimCardProps {
  claim: Claim;
}

export function ClaimCard({ claim }: ClaimCardProps) {
  const [expanded, setExpanded] = useState(true);
  const verdictBg = getVerdictBgColor(claim.verdict);

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${verdictBg}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-start gap-4 text-left"
      >
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <span className={`text-2xl font-bold ${getScoreColor(claim.veracityScore)}`}>
            {claim.veracityScore}
          </span>
          <span className="text-xs text-gray-500">/10</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{claim.statement}</p>
          <span
            className={`inline-block mt-1.5 text-xs font-semibold ${getVerdictColor(claim.verdict)}`}
          >
            {VERDICT_LABELS[claim.verdict]}
          </span>
        </div>

        <div className="flex-shrink-0 text-gray-400">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-inherit">
          <div className="pt-4">
            <p className="text-sm text-gray-700 leading-relaxed">{claim.explanation}</p>
          </div>
          <SourceList sources={claim.sources} />
        </div>
      )}
    </div>
  );
}
