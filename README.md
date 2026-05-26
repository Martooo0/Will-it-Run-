# Will It Run?

Plataforma de diseño, validación y predicción de rendimiento de configuraciones de PC. No solo valida la compatibilidad entre componentes: estima cómo va a rendir la build en juegos y aplicaciones reales. Trabajo práctico de **Ingeniería de Datos II** (UADE, 2026).

## Stack

- **Next.js 16** (App Router + TypeScript + Tailwind) — frontend y capa de API (`route.ts`).
- **MongoDB** (documental) — catálogo de componentes, ensambles, juegos, apps, reviews.
- **Neo4j** (grafo) — motor de compatibilidad, recomendaciones y advisories.
- **Redis** (clave-valor) — caché y rankings.
- **Docker Compose** — levanta las tres bases.

## Requisitos previos

Antes de empezar, instalá:

- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — tiene que estar **abierto y corriendo**.
- [Git](https://git-scm.com/)

## Puesta en marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/Martooo0/Will-it-Run-.git
cd Will-it-Run-
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear tu archivo de entorno

Las URLs y contraseñas de conexión viven en `.env.local`, que **no se sube a Git**. Copiá el template incluido:

- **Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env.local
  ```
- **Mac / Linux:**
  ```bash
  cp .env.example .env.local
  ```

Los valores por defecto ya coinciden con `docker-compose.yml`, así que para desarrollo local **no hace falta cambiar nada**.

### 4. Levantar las bases de datos con Docker

```bash
docker compose up -d
```

Esto levanta tres contenedores en segundo plano:

| Servicio | Puerto(s) | Para qué |
|---|---|---|
| MongoDB | 27017 | datos documentales |
| Neo4j | 7474 (web) · 7687 (bolt) | grafo de compatibilidad |
| Redis | 6379 | caché |

Verificá que estén arriba:

```bash
docker compose ps
```

### 5. Arrancar la aplicación

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### 6. Verificar que todo conecta

Abrí [http://localhost:3000/api/health](http://localhost:3000/api/health). Tenés que ver:

```json
{"mongo":"ok","neo4j":"ok","redis":"ok"}
```

Si alguna devuelve `"error"`, revisá que Docker esté corriendo y que los contenedores estén arriba (`docker compose ps`).

## Comandos útiles de Docker

| Comando | Qué hace |
|---|---|
| `docker compose up -d` | Levanta las tres bases en segundo plano |
| `docker compose ps` | Muestra el estado de los contenedores |
| `docker compose logs -f mongo` | Ver los logs de un servicio (`mongo` / `neo4j` / `redis`) |
| `docker compose down` | Para los contenedores (los datos **se conservan**) |
| `docker compose down -v` | Para los contenedores **y borra todos los datos** |

## Acceso directo a las bases (para debugging)

- **Neo4j Browser:** [http://localhost:7474](http://localhost:7474) — usuario `neo4j`, contraseña `willitrun123`
- **MongoDB:** `mongodb://localhost:27017` — base `willitrun`
- **Redis:** `localhost:6379`

## Notas importantes para el equipo

- **Nunca subas tu `.env.local`** — está ignorado a propósito. Si agregás una variable nueva, sumala también a `.env.example` (sin valores secretos reales) para que el resto la tenga.
- **Las bases arrancan vacías.** Los datos no viajan por Git: cada uno levanta su propio Docker local. La carga del dataset inicial se hace con scripts de *seed* (ver más abajo).
- **Redis no se siembra:** es la capa de caché, se llena sola a medida que la app la usa. Es normal que arranque vacía.

## Estructura del proyecto

Cada carpeta tiene un dueño según el rol del equipo. La flecha indica a qué base de datos pega cada endpoint.

```
will-it-run/
├── data/                        → dataset inicial en JSON (fuente de los seeds)        [Lorenzo]
├── scripts/                     → scripts de seed: leen data/ e insertan en las bases   [Juan · Facundo · Tiziano]
├── src/
│   ├── app/
│   │   ├── api/                 → capa de orquestación (cada carpeta = un route.ts)
│   │   │   ├── health/          → healthcheck de las tres bases (ya implementado)
│   │   │   ├── components/      → catálogo de componentes             → MongoDB
│   │   │   ├── builds/          → ensambles (crear, score)            → MongoDB + Redis
│   │   │   ├── compat/          → validación + advisories             → Neo4j (cache Redis)
│   │   │   ├── performance/     → estimación de FPS y apps            → simulación + Redis
│   │   │   ├── recommendations/ → recomendaciones y builds similares  → Neo4j
│   │   │   └── community/       → community builds, reviews, rankings → MongoDB + Redis
│   │   ├── catalog/             → página de catálogo        (diseño: Catalog.html)
│   │   ├── products/[id]/       → detalle de producto       (diseño: Product.html)
│   │   ├── bench/               → simulador "Will it Run?"  (diseño: Bench.html)
│   │   ├── account/             → cuenta de usuario         (diseño: Account.html)
│   │   └── layout.tsx · page.tsx · globals.css
│   ├── components/              → componentes React reutilizables (sugerencia: subcarpetas por página + ui/)
│   ├── types/                   → tipos TypeScript compartidos (Componente, Build, Game, App…)
│   └── lib/
│       ├── mongodb.ts · neo4j.ts · redis.ts → conexiones singleton (ya implementadas)
│       ├── models/              → schemas de Mongoose                  [Juan]
│       ├── queries/             → queries Cypher de Neo4j              [Facundo]
│       ├── cache/               → helpers de Redis (claves, TTL)       [Tiziano]
│       └── simulation/          → scoring, simulateFps, simulateApp    [Lorenzo]
├── docker-compose.yml           → define los tres contenedores
├── .env.example                 → template de variables de entorno
└── README.md
```

> Las carpetas nuevas tienen un archivo `.gitkeep` (un placeholder vacío) para que Git las trackee aun estando vacías. Cuando agregues archivos reales a una carpeta, podés borrar su `.gitkeep`.
>
> **Pendiente:** `data/` y `scripts/` todavía están vacías — la construcción del dataset y los seeds se implementan en la etapa de desarrollo. Cuando los seeds estén listos, se agrega el paso de carga acá en "Puesta en marcha".

## Equipo y roles

| Integrante | Rol |
|---|---|
| Martin Ferreira | Líder Técnico — infraestructura, repositorio, integración |
| Juan Fan | Modelador Documental — MongoDB / Mongoose |
| Facundo Alvarez | Modelador de Grafos — Neo4j / Cypher |
| Tiziano Rodriguez | Modelador de Redis — caché y rankings |
| Lorenzo Graglia | Datos y Backend — dataset, scoring, integración |
| Maximo Peña | Documentación y Pruebas |

## Flujo de trabajo

Las contribuciones van por **pull request** revisado por el líder técnico antes de mergear a `main`.
