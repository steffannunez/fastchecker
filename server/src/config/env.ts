import { z } from 'zod';

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY es requerida. Obtenla en https://console.anthropic.com/settings/keys'),
  GOOGLE_SEARCH_API_KEY: z.string().min(1, 'GOOGLE_SEARCH_API_KEY es requerida. Obtenla en https://developers.google.com/custom-search/v1/overview'),
  GOOGLE_SEARCH_ENGINE_ID: z.string().min(1, 'GOOGLE_SEARCH_ENGINE_ID es requerido. Crealo en https://programmablesearchengine.google.com/'),
  PORT: z.coerce.number().default(3001),
  CLAUDE_MODEL: z.string().default('claude-sonnet-4-20250514'),
  MAX_IMAGE_SIZE: z.coerce.number().default(5242880),
  RATE_LIMIT_RPM: z.coerce.number().default(10),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedConfig: EnvConfig | null = null;

export function validateEnv(): EnvConfig {
  if (cachedConfig) return cachedConfig;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    console.error(`\n[FastChecker] Error de configuracion:\n${errors}\n`);
    console.error('Copia .env.example a .env y completa las variables requeridas.\n');
    process.exit(1);
  }

  cachedConfig = result.data;
  return cachedConfig;
}
