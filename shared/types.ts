export type ClaimCategory =
  | 'statistical'
  | 'event'
  | 'quote'
  | 'scientific'
  | 'political'
  | 'other';

export type VerdictLevel =
  | 'true'
  | 'mostly_true'
  | 'mixed'
  | 'mostly_false'
  | 'false'
  | 'unverifiable';

export type SourceAlignment =
  | 'confirms'
  | 'denies'
  | 'partially_relevant'
  | 'unrelated';

export interface AnalysisRequest {
  text?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface Source {
  title: string;
  url: string;
  snippet: string;
  alignment: SourceAlignment;
}

export interface Claim {
  id: number;
  statement: string;
  category: ClaimCategory;
  searchQueries: string[];
  sources: Source[];
  veracityScore: number;
  verdict: VerdictLevel;
  explanation: string;
}

export interface AnalysisResponse {
  id: string;
  overallScore: number;
  overallVerdict: VerdictLevel;
  summary: string;
  claims: Claim[];
  extractedText?: string;
  analyzedAt: string;
  metadata: {
    modelUsed: string;
    searchResultsCount: number;
    processingTimeMs: number;
  };
}

export type PipelineStepName =
  | 'extracting_text'
  | 'identifying_claims'
  | 'searching'
  | 'analyzing'
  | 'complete';

export interface PipelineStep {
  step: PipelineStepName;
  message: string;
}

export interface ExtractedClaim {
  statement: string;
  category: ClaimCategory;
  searchQueries: string[];
}

export interface ClaimAnalysis {
  id: number;
  statement: string;
  category: ClaimCategory;
  veracityScore: number;
  verdict: VerdictLevel;
  explanation: string;
  sourceAlignments: Array<{
    url: string;
    alignment: SourceAlignment;
  }>;
}

export interface AnalysisResult {
  overallScore: number;
  overallVerdict: VerdictLevel;
  summary: string;
  claims: ClaimAnalysis[];
}

export const VERDICT_LABELS: Record<VerdictLevel, string> = {
  true: 'Verdadero',
  mostly_true: 'Mayormente verdadero',
  mixed: 'Mixto',
  mostly_false: 'Mayormente falso',
  false: 'Falso',
  unverifiable: 'No verificable',
};

export const PIPELINE_MESSAGES: Record<PipelineStepName, string> = {
  extracting_text: 'Extrayendo texto de la imagen...',
  identifying_claims: 'Identificando afirmaciones...',
  searching: 'Buscando fuentes en la web...',
  analyzing: 'Analizando veracidad...',
  complete: 'Analisis completo',
};
