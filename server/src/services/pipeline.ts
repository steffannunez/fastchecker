import { v4 as uuidv4 } from 'uuid';
import { extractTextFromImage, extractClaims, analyzeWithSources } from './claude.js';
import { searchMultipleQueries } from './search.js';
import { validateEnv } from '../config/env.js';
import type { AnalysisRequest, AnalysisResponse, Claim, Source } from '../../../shared/types.js';

export async function runAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
  const config = validateEnv();
  const startTime = Date.now();

  // Step 1: Extract text from image if provided
  let extractedText: string | undefined;
  let combinedText = request.text ?? '';

  if (request.imageBase64 && request.imageMimeType) {
    console.log('[Pipeline] Extrayendo texto de imagen...');
    extractedText = await extractTextFromImage(request.imageBase64, request.imageMimeType);
    combinedText = combinedText
      ? `${combinedText}\n\n[Texto extraído de la imagen]:\n${extractedText}`
      : extractedText;
  }

  if (!combinedText.trim()) {
    throw new PipelineError(
      'No se pudo extraer texto del contenido proporcionado.',
      'no_content',
      422
    );
  }

  // Step 2: Identify claims
  console.log('[Pipeline] Identificando afirmaciones...');
  const extractedClaims = await extractClaims(combinedText);

  if (extractedClaims.length === 0) {
    throw new PipelineError(
      'No se encontraron afirmaciones verificables en el contenido proporcionado.',
      'no_claims',
      422
    );
  }

  console.log(`[Pipeline] ${extractedClaims.length} afirmaciones encontradas`);

  // Step 3: Search for sources
  console.log('[Pipeline] Buscando fuentes en la web...');
  const allQueries = extractedClaims.flatMap((c) => c.searchQueries).slice(0, 20);
  let sources: Source[] = [];

  try {
    sources = await searchMultipleQueries(allQueries);
    console.log(`[Pipeline] ${sources.length} fuentes encontradas`);
  } catch (error) {
    console.warn('[Pipeline] Error en búsqueda web, continuando sin fuentes:', error);
  }

  // Step 4: Analyze veracity
  console.log('[Pipeline] Analizando veracidad...');
  const analysis = await analyzeWithSources(extractedClaims, sources, combinedText);

  // Step 5: Assemble response
  const claimMap = new Map(extractedClaims.map((c, i) => [i + 1, c]));

  const claims: Claim[] = analysis.claims.map((claim) => ({
    id: claim.id,
    statement: claim.statement,
    category: claim.category,
    searchQueries: claimMap.get(claim.id)?.searchQueries ?? [],
    sources: claim.sourceAlignments.map((sa) => {
      const matchedSource = sources.find((s) => s.url === sa.url);
      return {
        title: matchedSource?.title ?? '',
        url: sa.url,
        snippet: matchedSource?.snippet ?? '',
        alignment: sa.alignment,
      };
    }),
    veracityScore: claim.veracityScore,
    verdict: claim.verdict,
    explanation: claim.explanation,
  }));

  const processingTimeMs = Date.now() - startTime;
  console.log(`[Pipeline] Análisis completado en ${processingTimeMs}ms`);

  return {
    id: uuidv4(),
    overallScore: analysis.overallScore,
    overallVerdict: analysis.overallVerdict,
    summary: analysis.summary,
    claims,
    extractedText,
    analyzedAt: new Date().toISOString(),
    metadata: {
      modelUsed: config.CLAUDE_MODEL,
      searchResultsCount: sources.length,
      processingTimeMs,
    },
  };
}

export class PipelineError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'PipelineError';
  }
}
