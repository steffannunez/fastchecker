import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { validateEnv } from '../config/env.js';
import { PipelineError } from './pipeline.js';
import { EXTRACT_CLAIMS_SYSTEM, EXTRACT_CLAIMS_USER } from '../prompts/extractClaims.js';
import { ANALYZE_VERACITY_SYSTEM, ANALYZE_VERACITY_USER } from '../prompts/analyzeVeracity.js';
import type { ExtractedClaim, Source, AnalysisResult } from '../../../shared/types.js';

let client: Anthropic | null = null;

const claimCategorySchema = z.enum(['statistical', 'event', 'quote', 'scientific', 'political', 'other']);
const verdictLevelSchema = z.enum(['true', 'mostly_true', 'mixed', 'mostly_false', 'false', 'unverifiable']);

const extractClaimsSchema = z.object({
  claims: z.array(z.object({
    statement: z.string(),
    category: claimCategorySchema,
    searchQueries: z.array(z.string()),
  })),
});

const analyzeWithSourcesSchema = z.object({
  overallScore: z.number(),
  overallVerdict: verdictLevelSchema,
  summary: z.string(),
  claims: z.array(z.object({
    id: z.number(),
    statement: z.string(),
    category: claimCategorySchema,
    veracityScore: z.number(),
    verdict: verdictLevelSchema,
    explanation: z.string(),
    sourceAlignments: z.array(z.object({
      url: z.string(),
      alignment: z.enum(['confirms', 'denies', 'partially_relevant', 'unrelated']),
    })),
  })),
});

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  // Remove ```json ... ``` wrapping
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return cleaned.trim();
}

function getClient(): Anthropic {
  if (!client) {
    const config = validateEnv();
    client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function extractTextFromImage(
  imageBase64: string,
  mimeType: string
): Promise<string> {
  const config = validateEnv();
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: config.CLAUDE_MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: 'Extrae TODO el texto visible en esta captura de pantalla de una publicación en redes sociales. Incluye el texto principal del post, pero ignora elementos de interfaz como botones de "Me gusta", contadores, y barras de navegación. Devuelve solo el texto extraído, sin formateo adicional.',
          },
        ],
      },
    ],
  }, { timeout: 30000 });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.text ?? '';
}

export async function extractClaims(text: string): Promise<ExtractedClaim[]> {
  const config = validateEnv();
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: config.CLAUDE_MODEL,
    max_tokens: 4096,
    system: EXTRACT_CLAIMS_SYSTEM,
    messages: [
      {
        role: 'user',
        content: EXTRACT_CLAIMS_USER(text),
      },
    ],
  }, { timeout: 30000 });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No se recibió respuesta de texto de Claude');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanJsonResponse(textBlock.text));
  } catch {
    throw new PipelineError(
      'La respuesta de IA no pudo ser procesada. Intenta nuevamente.',
      'parse_error',
      500
    );
  }

  const validated = extractClaimsSchema.safeParse(parsed);
  if (!validated.success) {
    throw new PipelineError(
      'La respuesta de IA no pudo ser procesada. Intenta nuevamente.',
      'parse_error',
      500
    );
  }

  return validated.data.claims;
}

export async function analyzeWithSources(
  claims: ExtractedClaim[],
  sources: Source[],
  originalText: string
): Promise<AnalysisResult> {
  const config = validateEnv();
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: config.CLAUDE_MODEL,
    max_tokens: 8192,
    system: ANALYZE_VERACITY_SYSTEM,
    messages: [
      {
        role: 'user',
        content: ANALYZE_VERACITY_USER(claims, sources, originalText),
      },
    ],
  }, { timeout: 30000 });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No se recibió respuesta de texto de Claude');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanJsonResponse(textBlock.text));
  } catch {
    throw new PipelineError(
      'La respuesta de IA no pudo ser procesada. Intenta nuevamente.',
      'parse_error',
      500
    );
  }

  const validated = analyzeWithSourcesSchema.safeParse(parsed);
  if (!validated.success) {
    throw new PipelineError(
      'La respuesta de IA no pudo ser procesada. Intenta nuevamente.',
      'parse_error',
      500
    );
  }

  return validated.data;
}
