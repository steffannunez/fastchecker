# Arquitectura de FastChecker

## Pipeline de analisis

El flujo de analisis sigue estos pasos secuenciales:

```
Input (texto/imagen) → OCR (si imagen) → Extraccion de claims → Busqueda web → Analisis de veracidad → Reporte
```

### Paso 1: Extraccion de texto (OCR)
- Si se proporciona una imagen, se envia a Claude Vision
- Claude identifica el texto de la publicacion separandolo de elementos de UI
- El texto extraido se combina con cualquier texto proporcionado manualmente

### Paso 2: Identificacion de afirmaciones
- El texto combinado se envia a Claude con el prompt `extractClaims`
- Claude devuelve un JSON con afirmaciones individuales verificables
- Cada afirmacion incluye consultas de busqueda sugeridas

### Paso 3: Busqueda web
- Para cada afirmacion, se ejecutan 1-2 busquedas en Google
- Las busquedas se ejecutan en paralelo (max 3 concurrentes)
- Los resultados se deducplican por URL

### Paso 4: Analisis de veracidad
- Todas las afirmaciones y fuentes se envian a Claude con el prompt `analyzeVeracity`
- Claude evalua cada afirmacion contra las fuentes y asigna:
  - Puntaje de veracidad (1-10)
  - Veredicto (verdadero, falso, mixto, etc.)
  - Explicacion detallada con citas de fuentes
  - Alineacion de cada fuente (confirma, contradice, etc.)

### Paso 5: Ensamblaje del reporte
- Se construye el `AnalysisResponse` con metadata (tiempo, modelo, cantidad de fuentes)
- Se envia al frontend para renderizar

## Decisiones de diseno

### Dos llamadas a Claude en vez de una
El pipeline usa dos llamadas separadas a Claude porque necesitamos saber que buscar antes de buscar. La primera llamada identifica claims y sugiere queries, la segunda analiza con las fuentes encontradas.

### Claude Vision para OCR
Usamos Claude Vision en vez de una libreria OCR (como Tesseract) porque:
- Entiende el contexto de screenshots de redes sociales
- Distingue texto del post vs elementos de interfaz
- Soporta espanol nativamente
- No requiere dependencias adicionales

### Backend como proxy
El servidor Express actua como proxy para todas las APIs externas. Esto:
- Mantiene las API keys seguras (nunca llegan al browser)
- Permite rate limiting centralizado
- Facilita el manejo de errores

## Tipos compartidos
El archivo `shared/types.ts` define el contrato entre frontend y backend. Ambos importan del mismo archivo para prevenir discrepancias.
