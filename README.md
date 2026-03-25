# FastChecker

Verificador automatico de publicaciones en redes sociales usando inteligencia artificial.

FastChecker analiza textos e imagenes de publicaciones en redes sociales para verificar la veracidad de las afirmaciones que contienen, buscando fuentes en internet y generando un informe detallado.

## Como funciona

1. **Ingreso**: Pega el texto de una publicacion o sube una captura de pantalla
2. **Extraccion**: Si se sube una imagen, Claude AI extrae el texto automaticamente
3. **Identificacion**: La IA identifica cada afirmacion factual verificable
4. **Busqueda**: Se buscan fuentes en internet para cada afirmacion (Google Search)
5. **Analisis**: Claude AI analiza cada afirmacion contra las fuentes encontradas
6. **Reporte**: Se genera un informe con puntaje de veracidad (1-10) y detalle por afirmacion

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [npm](https://www.npmjs.com/) v9 o superior
- Una API key de [Anthropic](https://console.anthropic.com/settings/keys) (Claude AI)
- Una API key de [Google Custom Search](https://developers.google.com/custom-search/v1/overview)
- Un [Programmable Search Engine](https://programmablesearchengine.google.com/) de Google

## Obtener las API keys

### Anthropic (Claude AI)

1. Ve a [console.anthropic.com](https://console.anthropic.com/settings/keys)
2. Crea una cuenta si no tienes una
3. Ve a **Settings > API Keys**
4. Crea una nueva API key y copiala

### Google Custom Search

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto (o usa uno existente)
3. Habilita la **Custom Search API**
4. Ve a **Credenciales** y crea una API key

### Google Programmable Search Engine

1. Ve a [programmablesearchengine.google.com](https://programmablesearchengine.google.com/)
2. Crea un nuevo buscador
3. En "Que buscar" selecciona **Buscar en toda la web**
4. Copia el **ID del motor de busqueda** (Search Engine ID)

## Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/fastchecker.git
cd fastchecker

# Instalar todas las dependencias
npm run install:all

# Copiar el archivo de configuracion
cp .env.example .env

# Editar .env con tus API keys
# Abre .env con tu editor favorito y completa:
# - ANTHROPIC_API_KEY
# - GOOGLE_SEARCH_API_KEY
# - GOOGLE_SEARCH_ENGINE_ID
```

## Uso

```bash
# Iniciar en modo desarrollo (frontend + backend)
npm run dev
```

Esto inicia:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

Abre http://localhost:5173 en tu navegador y:

1. Pega el texto de una publicacion en el area de texto
2. Opcionalmente, sube una captura de pantalla de la publicacion
3. Haz clic en **"Verificar publicacion"**
4. Espera el analisis (15-30 segundos aproximadamente)
5. Revisa el informe con el puntaje de veracidad y el desglose por afirmacion

## Configuracion avanzada

| Variable | Requerida | Default | Descripcion |
|----------|-----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Si | - | API key de Anthropic |
| `GOOGLE_SEARCH_API_KEY` | Si | - | API key de Google Custom Search |
| `GOOGLE_SEARCH_ENGINE_ID` | Si | - | ID del motor de busqueda de Google |
| `PORT` | No | `3001` | Puerto del servidor backend |
| `CLAUDE_MODEL` | No | `claude-sonnet-4-20250514` | Modelo de Claude a usar |
| `MAX_IMAGE_SIZE` | No | `5242880` | Tamano maximo de imagen en bytes (5MB) |
| `RATE_LIMIT_RPM` | No | `10` | Limite de requests por minuto por IP |

## Stack tecnologico

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Express + TypeScript
- **IA**: Claude API (Anthropic) - analisis multimodal (texto + vision)
- **Busqueda**: Google Custom Search API
- **Validacion**: Zod

## Estructura del proyecto

```
fastchecker/
├── client/          # Frontend React + Vite
│   └── src/
│       ├── components/   # Componentes UI
│       ├── hooks/        # Custom hooks
│       ├── services/     # Llamadas a la API
│       └── utils/        # Utilidades
├── server/          # Backend Express
│   └── src/
│       ├── config/       # Configuracion del entorno
│       ├── middleware/    # Validacion, rate limiting, errores
│       ├── prompts/      # Prompts de Claude AI
│       ├── routes/       # Endpoints de la API
│       └── services/     # Logica de negocio (pipeline, claude, search)
├── shared/          # Tipos TypeScript compartidos
└── docs/            # Documentacion tecnica
```

## Limitaciones

- Los resultados son generados por IA y **deben ser verificados por el usuario**
- Google Custom Search tiene un limite de 100 consultas gratuitas por dia
- El analisis tarda 15-30 segundos dependiendo del contenido
- La calidad del analisis depende de las fuentes disponibles en internet

## Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/mi-feature`)
3. Haz commit de tus cambios (`git commit -m 'Agregar mi feature'`)
4. Push a la rama (`git push origin feature/mi-feature`)
5. Abre un Pull Request

## Licencia

[MIT](LICENSE)
