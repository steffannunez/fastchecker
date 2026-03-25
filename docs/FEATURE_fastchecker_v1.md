# Feature: FastChecker v1 - Verificador de Noticias

## Resumen
App fullstack React + Express + TypeScript para verificar publicaciones de redes sociales usando Claude AI y Google Search.

## Archivos clave

### Shared
- `shared/types.ts` - Todos los tipos compartidos (AnalysisRequest, AnalysisResponse, Claim, Source, VerdictLevel, etc.)

### Server (`server/src/`)
- `index.ts` - Entry point Express, configura CORS, JSON, rutas
- `config/env.ts` - Validacion de env vars con Zod, fail-fast si falta alguna
- `services/pipeline.ts` - **Orquestador principal**: OCR → Claims → Search → Analysis → Response
- `services/claude.ts` - 3 funciones: `extractTextFromImage()`, `extractClaims()`, `analyzeWithSources()`
- `services/search.ts` - Google Custom Search API wrapper con dedup y concurrencia
- `prompts/extractClaims.ts` - Prompt para extraer afirmaciones verificables
- `prompts/analyzeVeracity.ts` - Prompt para analizar veracidad con rubrica 1-10
- `routes/analyze.ts` - POST /api/analyze con multer para imagenes
- `middleware/validateRequest.ts` - Zod validation + multer processing
- `middleware/rateLimiter.ts` - express-rate-limit configurable
- `middleware/errorHandler.ts` - Mapeo de errores a mensajes en espanol

### Client (`client/src/`)
- `App.tsx` - Shell principal con PostInput + StepProgress + ErrorAlert + AnalysisReport
- `hooks/useFactCheck.ts` - Hook que maneja todo el lifecycle (loading, steps simulados, result, error)
- `services/api.ts` - Axios con interceptors para FormData POST
- `components/input/PostInput.tsx` - Container con TextInput + ImageUpload + SubmitButton
- `components/input/ImageUpload.tsx` - react-dropzone con preview y validacion
- `components/report/AnalysisReport.tsx` - Contenedor del reporte completo
- `components/report/VeracityScore.tsx` - Gauge SVG circular 1-10 con colores
- `components/report/ClaimCard.tsx` - Card expandible por afirmacion con fuentes
- `components/report/SourceList.tsx` - Lista de fuentes con badges de alineacion
- `components/shared/StepProgress.tsx` - Indicador de progreso del pipeline

## Pipeline de analisis
1. Si hay imagen → Claude Vision extrae texto (OCR)
2. Claude identifica afirmaciones verificables + sugiere queries de busqueda
3. Google Search en paralelo (max 3) por cada claim, dedup por URL
4. Claude analiza todas las claims vs todas las fuentes → JSON estructurado
5. Se ensambla AnalysisResponse con metadata

## API
- `POST /api/analyze` - multipart/form-data (text + image) o JSON (text + imageBase64)
- `GET /api/health` - healthcheck

## Config
- `.env` con ANTHROPIC_API_KEY, GOOGLE_SEARCH_API_KEY, GOOGLE_SEARCH_ENGINE_ID
- Puerto backend: 3001 (configurable via PORT)
- Puerto frontend: 5173 (Vite dev server)
- Vite proxy: /api → localhost:3001
