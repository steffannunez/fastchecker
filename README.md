# FastChecker

Verificador automatico de publicaciones en redes sociales usando inteligencia artificial.

FastChecker analiza textos e imagenes de publicaciones en redes sociales para verificar la veracidad de las afirmaciones que contienen. Usa Claude AI con busqueda web integrada para investigar cada afirmacion contra fuentes reales y genera un informe detallado con puntaje de veracidad.

## Como funciona

1. **Ingreso**: Pega el texto de una publicacion o sube una captura de pantalla
2. **Extraccion**: Si se sube una imagen, Claude AI extrae el texto automaticamente (OCR)
3. **Identificacion**: La IA identifica cada afirmacion factual verificable del post
4. **Investigacion**: Claude busca en internet fuentes oficiales, medios y fact-checkers para cada afirmacion
5. **Analisis**: La IA analiza cada afirmacion contra las fuentes encontradas y determina su veracidad
6. **Reporte**: Se genera un informe con puntaje de veracidad (1-10), veredicto y detalle por afirmacion con fuentes citadas

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [npm](https://www.npmjs.com/) v9 o superior
- Una API key de [Anthropic](https://console.anthropic.com/settings/keys) (Claude AI)

## Obtener la API Key de Anthropic (Claude AI)

FastChecker solo necesita **una API key** para funcionar: la de Anthropic (Claude AI). Claude se encarga tanto del analisis como de la busqueda de fuentes en internet.

### Paso a paso

1. Ve a [console.anthropic.com](https://console.anthropic.com/)
2. Crea una cuenta si no tienes una (necesitas un email valido)
3. Una vez dentro, ve a **Settings > API Keys** en el menu lateral
4. Haz clic en **Create Key**
5. Ponle un nombre (ej: "FastChecker") y haz clic en **Create**
6. **Copia la key** inmediatamente (formato: `sk-ant-api03-...`). No podras verla de nuevo
7. **Agrega creditos**: Ve a **Settings > Billing** y agrega un metodo de pago. El minimo es $5 USD

### Costos estimados

- Cada verificacion de un post cuesta aproximadamente **$0.01 - $0.05 USD** dependiendo de la cantidad de afirmaciones
- Con $5 USD puedes hacer **100-500 verificaciones** aproximadamente
- Claude web search esta incluido en el costo de la API, no requiere pago adicional

## Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/steffannunez/fastchecker.git
cd fastchecker

# Instalar todas las dependencias (frontend + backend)
npm run install:all

# Copiar el archivo de configuracion
cp .env.example .env
```

### Configurar el archivo .env

Abre `.env` con tu editor favorito y agrega tu API key:

```env
# REQUERIDA - Tu API key de Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-tu-key-aqui
```

Las demas variables son opcionales y tienen valores por defecto.

## Uso

```bash
# Iniciar en modo desarrollo (frontend + backend)
npm run dev
```

Esto inicia:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

### Como verificar una publicacion

1. Abre http://localhost:5173 en tu navegador
2. **Opcion A**: Pega el texto de una publicacion en el area de texto
3. **Opcion B**: Sube una captura de pantalla de la publicacion (PNG, JPG o WebP, max 5MB)
4. Puedes usar ambas opciones a la vez (texto + imagen)
5. Haz clic en **"Verificar publicacion"**
6. Espera el analisis (30-90 segundos dependiendo de la cantidad de afirmaciones)
7. Revisa el informe con:
   - **Puntaje general** de veracidad (1-10)
   - **Veredicto** (Verdadero, Mayormente verdadero, Mixto, Mayormente falso, Falso)
   - **Desglose** por cada afirmacion con explicacion detallada
   - **Fuentes** citadas con links a los sitios web originales

## Configuracion avanzada

| Variable | Requerida | Default | Descripcion |
|----------|-----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Si | - | API key de Anthropic (Claude AI) |
| `PORT` | No | `3001` | Puerto del servidor backend |
| `CLAUDE_MODEL` | No | `claude-sonnet-4-20250514` | Modelo de Claude a usar |
| `MAX_IMAGE_SIZE` | No | `5242880` | Tamano maximo de imagen en bytes (5MB) |
| `RATE_LIMIT_RPM` | No | `10` | Limite de requests por minuto por IP |
| `ALLOWED_ORIGINS` | No | `http://localhost:5173` | Origenes CORS permitidos (separados por coma) |

## Stack tecnologico

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS v4
- **Backend**: Express + TypeScript
- **IA**: Claude API (Anthropic) - analisis multimodal (texto + vision) + busqueda web integrada
- **Validacion**: Zod (input + output)
- **Seguridad**: Helmet, CORS restringido, rate limiting

## Estructura del proyecto

```
fastchecker/
├── client/              # Frontend React + Vite
│   └── src/
│       ├── components/      # Componentes UI (input, report, layout)
│       ├── hooks/           # Custom hooks (useFactCheck)
│       ├── services/        # Cliente API (axios)
│       ├── types/           # Tipos TypeScript
│       └── utils/           # Utilidades (formatters, imageUtils)
├── server/              # Backend Express
│   └── src/
│       ├── config/          # Configuracion del entorno (Zod)
│       ├── middleware/      # Validacion, rate limiting, errores
│       ├── prompts/         # Prompts de Claude AI
│       ├── routes/          # Endpoints de la API
│       └── services/        # Pipeline de verificacion + Claude
├── shared/              # Tipos TypeScript compartidos
│   └── types.ts
├── .env.example         # Plantilla de configuracion
└── package.json         # Scripts del proyecto
```

## API

### POST /api/analyze

Analiza una publicacion de redes sociales.

**Request** (multipart/form-data o JSON):
- `text` (string, opcional): Texto de la publicacion
- `image` (file, opcional): Captura de pantalla (PNG, JPG, WebP)

Al menos uno de los dos campos debe estar presente.

**Response**:
```json
{
  "id": "uuid",
  "overallScore": 4,
  "overallVerdict": "mostly_false",
  "summary": "Resumen del analisis...",
  "claims": [
    {
      "id": 1,
      "statement": "Afirmacion analizada",
      "category": "statistical",
      "veracityScore": 3,
      "verdict": "mostly_false",
      "explanation": "Explicacion detallada con fuentes...",
      "sources": [
        {
          "title": "Titulo de la fuente",
          "url": "https://...",
          "alignment": "denies"
        }
      ]
    }
  ],
  "analyzedAt": "2026-03-25T01:11:34.023Z",
  "metadata": {
    "modelUsed": "claude-sonnet-4-20250514",
    "searchResultsCount": 59,
    "processingTimeMs": 65000
  }
}
```

## Limitaciones

- Los resultados son generados por IA y **deben ser verificados por el usuario**
- El analisis tarda 30-90 segundos dependiendo del contenido y cantidad de afirmaciones
- La calidad del analisis depende de las fuentes disponibles en internet
- La API de Anthropic tiene un costo por uso (ver seccion de costos estimados)
- La busqueda web de Claude esta optimizada para fuentes en espanol y Chile, pero tambien busca fuentes internacionales

## Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/mi-feature`)
3. Haz commit de tus cambios (`git commit -m 'Agregar mi feature'`)
4. Push a la rama (`git push origin feature/mi-feature`)
5. Abre un Pull Request

## Licencia

[MIT](LICENSE)
