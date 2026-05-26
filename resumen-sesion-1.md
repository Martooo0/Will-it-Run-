# Resumen Sesión 1 — Will it Run? (Setup e Infraestructura)

---

## ¿Qué hicimos?

Arrancamos desde cero y dejamos el proyecto con Next.js corriendo, Docker con las 3 bases de datos levantadas, y las conexiones verificadas.

---

## Paso 1 — Crear el proyecto Next.js

**Comando:**
```bash
npx create-next-app@latest will-it-run
```

**¿Qué es `create-next-app`?**
Es una herramienta que genera la estructura base de un proyecto Next.js con todo configurado (TypeScript, Tailwind, ESLint). Es el equivalente a "nuevo proyecto" en otros entornos — no creás los archivos a mano.

**Opciones que elegimos:**
- TypeScript: Sí — agrega tipado estático al JavaScript
- ESLint: Sí — corrector de estilo de código
- React Compiler: No — es experimental, no lo necesitamos
- Tailwind CSS: Sí — framework de estilos
- Carpeta `src/`: Sí — organiza el código fuente separado de la config
- App Router: Sí — el sistema de rutas moderno de Next.js
- Customize import alias: No — dejamos `@/` por defecto
- AGENTS.md: No — no lo necesitamos

---

## Estructura de archivos generada

```
will-it-run/
├── src/
│   └── app/                  → todas las páginas y rutas de la app
│       ├── layout.tsx         → esqueleto HTML que envuelve TODAS las páginas (nav, footer, etc.)
│       ├── page.tsx           → página de inicio (ruta /)
│       ├── globals.css        → estilos CSS globales que aplican a toda la app
│       └── favicon.ico        → ícono de la pestaña del browser
├── public/                   → archivos estáticos (imágenes, íconos) accesibles desde el browser
├── .gitignore                 → le dice a Git qué archivos NO subir al repositorio
├── eslint.config.mjs          → configuración del corrector de estilo
├── next.config.ts             → configuración de Next.js
├── next-env.d.ts              → tipos de TypeScript que genera Next.js automáticamente, no tocar
├── package.json               → lista de dependencias y scripts del proyecto
├── package-lock.json          → versiones exactas de cada paquete instalado (generado automático)
├── postcss.config.mjs         → configuración de PostCSS (necesario para que Tailwind funcione)
├── tailwind.config.ts         → configuración de Tailwind (colores, fuentes, etc.)
└── tsconfig.json              → configuración de TypeScript
```

---

## Paso 2 — Verificar que el proyecto arranca

**Comando:**
```bash
npm run dev
```

Abre `localhost:3000` en el browser. Si ves la pantalla de bienvenida de Next.js, todo funciona.

---

## Paso 3 — Crear el docker-compose.yml

**¿Qué es Docker?**
Docker es una herramienta que corre programas dentro de "contenedores" — cajas aisladas que incluyen todo lo necesario para correr un programa (el programa, su sistema operativo mínimo, su configuración). El contenedor siempre se comporta igual sin importar la máquina donde corra.

**¿Qué es un contenedor?**
Pensalo como una habitación de hotel: tiene su propio espacio aislado pero comparte la infraestructura del edificio (tu sistema operativo). Es más liviano que una máquina virtual (que sería como alquilar un departamento entero) y arranca en segundos.

**¿Qué es docker-compose.yml?**
Es un archivo de configuración (no es código, es como un formulario estructurado) que describe todos los contenedores que necesita el proyecto y cómo se conectan entre ellos. Con un solo comando levantás todo.

**¿Qué es YAML?**
El formato `.yml` no es un lenguaje de programación — no tiene lógica ni bucles. Es solo una forma de escribir configuración legible. La regla más importante: la indentación (espacios a la izquierda) define la jerarquía. Un error de espacio rompe el archivo.

**Contenido del archivo:**
```yaml
services:
  mongo:
    image: mongo:7              # imagen oficial de MongoDB versión 7
    container_name: wir-mongo
    ports:
      - "27017:27017"           # puerto_de_tu_máquina:puerto_del_contenedor
    volumes:
      - mongo-data:/data/db     # guarda los datos en disco para que no se pierdan

  neo4j:
    image: neo4j:5
    container_name: wir-neo4j
    ports:
      - "7474:7474"             # interfaz web de Neo4j
      - "7687:7687"             # protocolo Bolt (conexión desde código)
    environment:
      - NEO4J_AUTH=neo4j/willitrun123   # usuario y contraseña
    volumes:
      - neo4j-data:/data

  redis:
    image: redis:7-alpine
    container_name: wir-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:                        # declara los volúmenes para persistir datos
  mongo-data:
  neo4j-data:
  redis-data:
```

**Comandos usados:**
```bash
docker compose config       # valida el archivo sin levantar nada
docker compose up -d        # levanta todos los contenedores en segundo plano (-d = detached)
docker compose ps           # muestra el estado de los contenedores
```

---

## Paso 4 — Crear la carpeta `src/lib/`

**¿Para qué sirve `lib/`?**
Es una convención de Next.js. Acá va toda la lógica que corre en el servidor pero que no es una página ni un componente visual: conexiones a bases de datos, funciones utilitarias, helpers. No es una carpeta mágica — es simplemente donde se pone ese código por organización.

---

## Paso 5 — Conexión a MongoDB (`src/lib/mongodb.ts`)

**Concepto clave: singleton con cache global**
Next.js en modo desarrollo recarga los módulos cada vez que guardás un archivo. Si la conexión fuera un módulo normal, abriría una conexión nueva en cada recarga y MongoDB tiene un límite de conexiones simultáneas. Para evitarlo, guardamos la conexión en `global` — un objeto que persiste siempre, sin importar cuántas veces se recarguen los módulos.

**Conceptos de TypeScript que aparecieron:**
- `|` → "o esto o lo otro": `string | null` significa "puede ser string o puede ser null"
- `!` al final de una variable → "confiá en mí, esto nunca va a ser undefined"
- `as unknown as { ... }` → forma de decirle a TypeScript la forma exacta de un objeto que él no conoce
- `export` → hace que la función pueda ser importada desde otros archivos
- `async function` → función que puede pausarse a esperar algo (con `await`) sin bloquear el resto de la app

**Patrón singleton:** garantiza que siempre haya una sola conexión abierta. La lógica es: si ya tengo conexión guardada → la devuelvo. Si no → la creo, la guardo, la devuelvo.

---

## Paso 6 — Conexión a Neo4j (`src/lib/neo4j.ts`)

Mismo patrón singleton pero más simple. Expone `getNeo4jDriver()` que devuelve el driver de conexión. El driver es el objeto que sabe hablar el protocolo Bolt con Neo4j.

**Estructura de una función en TypeScript:**
```ts
export function nombre(parámetros): TipoDeRetorno { ... }
```
El `: Driver` al final le dice a TypeScript qué tipo devuelve la función. Si intentás devolver otra cosa, te avisa con error.

---

## Paso 7 — Conexión a Redis (`src/lib/redis.ts`)

Mismo patrón. Expone `getRedis()` que devuelve el cliente de ioredis listo para usar.

---

## Paso 8 — Variables de entorno (`.env.local`)

**¿Qué son las variables de entorno?**
Son valores de configuración que viven fuera del código — contraseñas, URLs, credenciales. Así el mismo código puede conectarse a diferentes bases según el entorno (desarrollo, producción) sin cambiar nada del código. Next.js las lee automáticamente de `.env.local`.

**Contenido:**
```
MONGODB_URI=mongodb://localhost:27017/willitrun
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=willitrun123
REDIS_URL=redis://localhost:6379
```

**Importante:** `.env.local` NO se sube a Git (está en `.gitignore`) porque contiene contraseñas.

---

## Paso 9 — Instalar los drivers

```bash
npm install mongoose          # driver de MongoDB
npm install neo4j-driver ioredis   # drivers de Neo4j y Redis
```

Los drivers son librerías que saben cómo hablar con cada base de datos. Sin ellos, el código no sabe conectarse.

---

## Paso 10 — Endpoint de healthcheck (`src/app/api/health/route.ts`)

**¿Qué es un endpoint?**
Una URL de la app que devuelve datos (no una página con diseño). Por ejemplo `localhost:3000/api/health`.

**¿Qué es un healthcheck?**
Un endpoint cuyo único trabajo es verificar que todo lo que la app necesita esté disponible. Abrís la URL y ves si las 3 bases responden.

**Convención de Next.js App Router:**
- Las rutas de API viven en `src/app/api/`
- Cada carpeta es una ruta
- El archivo siempre se llama `route.ts`
- Una función `export async function GET()` responde a requests GET

**Resultado:**
```
localhost:3000/api/health → {"mongo":"ok","neo4j":"ok","redis":"ok"}
```

---

## Estructura final al terminar la sesión

```
will-it-run/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── health/
│   │   │       └── route.ts    → endpoint que verifica las 3 conexiones
│   │   ├── globals.css          → estilos globales
│   │   ├── layout.tsx           → estructura HTML base de todas las páginas
│   │   └── page.tsx             → página de inicio (/)
│   └── lib/
│       ├── mongodb.ts           → función connectMongo() — conexión singleton a MongoDB
│       ├── neo4j.ts             → función getNeo4jDriver() — conexión singleton a Neo4j
│       └── redis.ts             → función getRedis() — conexión singleton a Redis
├── .env.local                   → variables de entorno (contraseñas, URIs) — NO se sube a Git
├── docker-compose.yml           → define los 3 contenedores (mongo, neo4j, redis)
├── package.json                 → dependencias del proyecto
└── [archivos de config varios]
```

---

## Comandos importantes para recordar

| Comando | Para qué sirve |
|---|---|
| `npm run dev` | Arranca el servidor de desarrollo en localhost:3000 |
| `docker compose up -d` | Levanta las 3 bases en segundo plano |
| `docker compose down` | Para los contenedores (los datos se conservan) |
| `docker compose down -v` | Para los contenedores Y borra todos los datos |
| `docker compose ps` | Muestra estado de los contenedores |
| `npm install <paquete>` | Instala una nueva dependencia |
