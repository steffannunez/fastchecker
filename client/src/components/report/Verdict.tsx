import { FileText } from 'lucide-react';
import type { VerdictLevel } from '@shared/types';
import { getVerdictBgColor } from '../../utils/formatters';

interface VerdictProps {
  summary: string;
  verdict: VerdictLevel;
}

export function Verdict({ summary, verdict }: VerdictProps) {
  return (
    <div className={`rounded-xl border-2 p-5 ${getVerdictBgColor(verdict)}`}>
      <div className="flex items-start gap-3">
        <FileText className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Resumen del analisis
          </h3>
          <p className="text-sm text-gray-800 leading-relaxed">{summary}</p>
        </div>
      </div>
    </div>
  );
}
