import { ExternalLink } from 'lucide-react';
import type { Source } from '@shared/types';
import { getAlignmentLabel } from '../../utils/formatters';

interface SourceListProps {
  sources: Source[];
}

export function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">No se encontraron fuentes para esta afirmacion.</p>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fuentes</h4>
      <div className="space-y-2">
        {sources.map((source, index) => {
          const { label, color } = getAlignmentLabel(source.alignment);
          return (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg text-sm"
            >
              <div className="flex-1 min-w-0">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-chile-blue hover:underline flex items-center gap-1"
                >
                  <span className="truncate">{source.title}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
                {source.snippet && (
                  <p className="text-gray-500 mt-1 line-clamp-2">{source.snippet}</p>
                )}
              </div>
              <span
                className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${color}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
