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

```
will-it-run/
├── src/
│   ├── app/
│   │   ├── api/           → endpoints (route.ts) — capa de orquestación
│   │   │   └── health/    → healthcheck de las tres bases
│   │   └── ...            → páginas (catalog, product, bench, account)
│   └── lib/
│       ├── mongodb.ts     → conexión a MongoDB
│       ├── neo4j.ts       → conexión a Neo4j
│       └── redis.ts       → conexión a Redis
├── docker-compose.yml     → define los tres contenedores
├── .env.example           → template de variables de entorno
└── ...
```

> **Pendiente (próximas etapas):** el dataset inicial va a vivir en `data/` (archivos JSON) y los scripts de seed en `scripts/`, que se correrán para poblar MongoDB y Neo4j. Cuando estén listos, se agregan acá los pasos de carga.

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
