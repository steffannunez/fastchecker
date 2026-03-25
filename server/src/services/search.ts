import axios from 'axios';
import { validateEnv } from '../config/env.js';
import type { Source } from '../../../shared/types.js';

interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
}

interface GoogleSearchResponse {
  items?: GoogleSearchResult[];
}

export async function searchGoogle(query: string, numResults = 5): Promise<Source[]> {
  const config = validateEnv();

  try {
    const response = await axios.get<GoogleSearchResponse>(
      'https://www.googleapis.com/customsearch/v1',
      {
        params: {
          key: config.GOOGLE_SEARCH_API_KEY,
          cx: config.GOOGLE_SEARCH_ENGINE_ID,
          q: query,
          num: Math.min(numResults, 10),
          lr: 'lang_es',
        },
        timeout: 10000,
      }
    );

    if (!response.data.items) {
      return [];
    }

    return response.data.items.map((item) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet ?? '',
      alignment: 'unrelated' as const,
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`[Search] Error buscando "${query}":`, error.response?.status, error.message);
    } else {
      console.error(`[Search] Error buscando "${query}":`, error);
    }
    return [];
  }
}

export async function searchMultipleQueries(
  queries: string[],
  maxConcurrent = 3
): Promise<Source[]> {
  const allSources: Source[] = [];
  const seenUrls = new Set<string>();

  for (let i = 0; i < queries.length; i += maxConcurrent) {
    const batch = queries.slice(i, i + maxConcurrent);
    const results = await Promise.all(batch.map((q) => searchGoogle(q)));

    for (const sources of results) {
      for (const source of sources) {
        if (!seenUrls.has(source.url)) {
          seenUrls.add(source.url);
          allSources.push(source);
        }
      }
    }
  }

  return allSources;
}
