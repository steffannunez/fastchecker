import { Clock, Search, Cpu } from 'lucide-react';
import type { AnalysisResponse } from '@shared/types';
import { VeracityScore } from './VeracityScore';
import { ClaimCard } from './ClaimCard';
import { Verdict } from './Verdict';
import { formatDuration } from '../../utils/formatters';

interface AnalysisReportProps {
  data: AnalysisResponse;
}

export function AnalysisReport({ data }: AnalysisReportProps) {
  return (
    <div className="space-y-6">
      {/* Header with score */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Resultado del analisis</h2>
          <VeracityScore score={data.overallScore} verdict={data.overallVerdict} />

          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100 w-full">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(data.metadata.processingTimeMs)}
            </span>
            <span className="flex items-center gap-1">
              <Search className="w-3.5 h-3.5" />
              {data.metadata.searchResultsCount} fuentes
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" />
              {data.metadata.modelUsed}
            </span>
          </div>
        </div>
      </div>

      {/* Extracted text (if from image) */}
      {data.extractedText && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Texto extraido de la imagen</h3>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
            {data.extractedText}
          </p>
        </div>
      )}

      {/* Claims */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Afirmaciones analizadas ({data.claims.length})
        </h3>
        {data.claims.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} />
        ))}
      </div>

      {/* Verdict */}
      <Verdict summary={data.summary} verdict={data.overallVerdict} />
    </div>
  );
}
