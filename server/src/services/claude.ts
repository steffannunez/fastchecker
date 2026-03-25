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

/**
 * Search the web using Claude's built-in web_search tool and then analyze veracity.
 * This replaces the old Google Custom Search + separate analysis flow.
 */
export async function searchAndAnalyze(
  claims: ExtractedClaim[],
  originalText: string
): Promise<{ analysis: AnalysisResult; sources: Source[] }> {
  const config = validateEnv();
  const anthropic = getClient();

  const sanitizedText = originalText.replace(/"""/g, '[comillas triples]');

  const claimsList = claims
    .map((c, i) => `${i + 1}. "${c.statement}" (categoría: ${c.category}, búsquedas sugeridas: ${c.searchQueries.join(', ')})`)
    .join('\n');

  const webSearchTool = {
    type: 'web_search_20250305',
    name: 'web_search',
    max_uses: 10,
    user_location: {
      type: 'approximate',
      country: 'CL',
      region: 'Región Metropolitana',
      city: 'Santiago',
      timezone: 'America/Santiago',
    },
  } as unknown as Anthropic.Messages.Tool;

  const userMessage = `Necesito que verifiques las siguientes afirmaciones de una publicación en redes sociales chilena.

PASO 1: Usa la herramienta de búsqueda web para investigar CADA afirmación. Busca en fuentes oficiales chilenas (Banco Central, DIPRES, Ministerio de Hacienda, medios de comunicación confiables).

PASO 2: Después de investigar, responde ÚNICAMENTE con el JSON de análisis.

TEXTO ORIGINAL DE LA PUBLICACIÓN:
"""
${sanitizedText}
"""

AFIRMACIONES A VERIFICAR:
${claimsList}

Después de buscar e investigar cada afirmación, responde con este JSON exacto:
{
  "overallScore": <número 1-10>,
  "overallVerdict": "true|mostly_true|mixed|mostly_false|false|unverifiable",
  "summary": "Resumen de 2-3 oraciones del análisis general en español",
  "claims": [
    {
      "id": <número secuencial empezando en 1>,
      "statement": "La afirmación analizada",
      "category": "statistical|event|quote|scientific|political|other",
      "veracityScore": <número 1-10>,
      "verdict": "true|mostly_true|mixed|mostly_false|false|unverifiable",
      "explanation": "Explicación detallada en español citando las fuentes encontradas con URLs",
      "sourceAlignments": [
        {
          "url": "URL real de la fuente encontrada",
          "alignment": "confirms|denies|partially_relevant|unrelated"
        }
      ]
    }
  ]
}`;

  // Make initial request - may need continuation if Claude pauses for web search
  const messages: Anthropic.Messages.MessageParam[] = [
    { role: 'user', content: userMessage },
  ];

  let allContentBlocks: Array<Record<string, unknown>> = [];
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`[Claude WebSearch] Llamada ${attempts}...`);

    const response = await anthropic.messages.create({
      model: config.CLAUDE_MODEL,
      max_tokens: 16000,
      system: ANALYZE_VERACITY_SYSTEM,
      tools: [webSearchTool],
      messages,
    }, { timeout: 120000 });

    const responseBlocks = response.content as unknown as Array<Record<string, unknown>>;
    allContentBlocks = allContentBlocks.concat(responseBlocks);

    console.log(`[Claude WebSearch] stop_reason: ${response.stop_reason}, blocks: ${response.content.length}`);

    // If Claude is done, break
    if (response.stop_reason === 'end_turn') {
      break;
    }

    // If Claude paused (e.g., during web search), continue the conversation
    if ((response.stop_reason as string) === 'pause_turn') {
      // Feed the response back to continue
      messages.push({ role: 'assistant', content: response.content as unknown as Anthropic.Messages.ContentBlockParam[] });
      messages.push({ role: 'user', content: 'Continúa con el análisis y responde con el JSON.' });
      continue;
    }

    // Any other stop reason, break
    break;
  }

  // Extract sources from all web_search_tool_result blocks
  const sources: Source[] = [];
  const seenUrls = new Set<string>();

  for (const block of allContentBlocks) {
    if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
      for (const result of block.content as Array<Record<string, string>>) {
        if (result.type === 'web_search_result' && result.url && !seenUrls.has(result.url)) {
          seenUrls.add(result.url);
          sources.push({
            title: result.title ?? '',
            url: result.url,
            snippet: '',
            alignment: 'partially_relevant' as const,
          });
        }
      }
    }
  }

  console.log(`[Claude WebSearch] ${sources.length} fuentes encontradas`);

  // Find JSON in text blocks (check all blocks, last first)
  const textBlocks = allContentBlocks.filter((b) => b.type === 'text' && typeof b.text === 'string');

  let parsed: unknown;
  let found = false;

  // Try from last text block to first
  for (let i = textBlocks.length - 1; i >= 0; i--) {
    const text = textBlocks[i].text as string;
    try {
      parsed = JSON.parse(cleanJsonResponse(text));
      found = true;
      break;
    } catch {
      // Try to extract JSON from within the text
      const jsonMatch = text.match(/\{[\s\S]*"overallScore"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
          found = true;
          break;
        } catch {
          continue;
        }
      }
    }
  }

  if (!found) {
    console.error('[Claude] No JSON found in response. Text blocks:', textBlocks.map(b => (b.text as string).substring(0, 100)));
    throw new PipelineError(
      'La respuesta de IA no pudo ser procesada. Intenta nuevamente.',
      'parse_error',
      500
    );
  }

  const validated = analyzeWithSourcesSchema.safeParse(parsed);
  if (!validated.success) {
    console.error('[Claude] Validation error:', validated.error.issues);
    throw new PipelineError(
      'La respuesta de IA no pudo ser procesada. Intenta nuevamente.',
      'parse_error',
      500
    );
  }

  return { analysis: validated.data, sources };
}
