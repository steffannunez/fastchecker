# Security & QA Hardening (2026-03-24)

## Cambios realizados

### 1. claude.ts - JSON parsing seguro + Zod + timeout
- Se envuelven ambas llamadas `JSON.parse(cleanJsonResponse(...))` en try/catch que lanzan `PipelineError` con code `parse_error` y status 500.
- Se importa `PipelineError` desde `pipeline.js`.
- Se agregan schemas Zod (`extractClaimsSchema`, `analyzeWithSourcesSchema`) que validan la estructura completa de la respuesta de IA, incluyendo enums tipados para `category`, `verdict` y `alignment`.
- Se agrega `{ timeout: 30000 }` como segundo argumento a las 3 llamadas `anthropic.messages.create()`.

### 2. index.ts - CORS restrictivo + Helmet + JSON limit
- CORS configurado con `origin` desde `ALLOWED_ORIGINS` env var (comma-separated) o fallback a `http://localhost:5173`. Solo metodos GET y POST.
- Se agrega `helmet()` middleware para cabeceras de seguridad.
- El limite de JSON body se reduce de `10mb` a `1mb`.

### 3. validateRequest.ts - Limites de input
- Campo `text`: maximo 10.000 caracteres.
- Campo `imageBase64`: maximo 7.000.000 caracteres (aprox 5MB en base64).

### 4. analyze.ts - Multer alineado con config
- Se importa `validateEnv` y se usa `config.MAX_IMAGE_SIZE` para el limite de multer en lugar del hardcoded 10MB.

### 5. preload.ts - Strip de comillas en .env
- Despues de extraer el valor, se eliminan comillas simples o dobles envolventes con regex `/^(['"])(.*)\1$/`.

### 6. pipeline.ts - Mapping seguro + cap de queries
- Se reemplaza `extractedClaims[claim.id - 1]` por un `Map` construido con `new Map(extractedClaims.map((c, i) => [i + 1, c]))` para evitar errores de indice.
- Se limitan las search queries totales a 20 con `.slice(0, 20)`.
