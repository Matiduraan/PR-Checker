# PR Trivia Checker

GitHub Action para bloquear Pull Requests hasta que el autor complete una trivia externa, usada como mecanismo de validación (pagos, permisos, verificaciones, etc.).

## 🎯 Características

- ✅ Bloquea PRs hasta completar validación externa
- 🔐 Autenticación vía API Key
- 💬 Comentarios automáticos con instrucciones
- 🎭 **Backend completamente mockeado** (sin llamadas HTTP reales)
- 🔧 Arquitectura extensible lista para migración a producción
- 📝 Detección inteligente de comentarios duplicados

## 🚀 Instalación

### 1. Agregar la Action a tu repositorio

Crea el archivo `.github/workflows/pr-check.yml`:

```yaml
name: PR Trivia Check

on:
  pull_request:
    types: [opened, reopened, synchronize]
  workflow_dispatch:

jobs:
  check-trivia:
    runs-on: ubuntu-latest
    name: Verificar Trivia de Validación

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Ejecutar PR Trivia Checker
        uses: your-org/pr-trivia-checker@v1
        with:
          api-key: ${{ secrets.TRIVIA_API_KEY }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### 2. Configurar la API Key

1. Obtén tu API Key en `https://trivia-validator.example.com/dashboard`
2. Ve a Settings → Secrets and variables → Actions
3. Crea un nuevo secret llamado `TRIVIA_API_KEY`
4. Pega tu API Key

## 📋 Inputs

| Input          | Descripción              | Requerido | Default               |
| -------------- | ------------------------ | --------- | --------------------- |
| `api-key`      | API Key de autenticación | Sí        | -                     |
| `github-token` | Token para comentarios   | Sí        | `${{ github.token }}` |

## 🎭 Estado Mock (Desarrollo)

**⚠️ IMPORTANTE:** Esta versión usa un backend **completamente mockeado**. No se realizan llamadas HTTP reales.

### Escenarios simulados por API Key:

- `test-invalid` o `invalid-key` → ❌ Error de autenticación
- `expired-key` → ❌ Key expirada
- Cualquier key con `valid` o `prod` → ✅ Trivia completada
- Cualquier otra key → ⏸️ Trivia pendiente

### Ejemplo de prueba:

```yaml
# Probar escenario de éxito
with:
  api-key: 'valid-test-key'

# Probar escenario de error
with:
  api-key: 'invalid-key'

# Probar escenario pendiente
with:
  api-key: 'any-other-key'
```

## 🔄 Migración a Producción

Para habilitar las llamadas reales al backend:

1. Abre [`src/backendClient.ts`](src/backendClient.ts)
2. Busca la sección `// PROD: Implementación real`
3. Descomenta el código de producción
4. Comenta o elimina el código marcado con `// MOCK:`
5. Actualiza `BACKEND_URL` con tu endpoint real
6. Recompila: `npm run build`

## 🛠️ Desarrollo

### Requisitos

- Node.js 20+
- npm

### Instalación local

```bash
npm install
```

### Build

```bash
npm run build
```

### Formato

```bash
npm run format
```

### Lint

```bash
npm run lint
```

## 📁 Estructura del Proyecto

```
.
├── action.yml                 # Definición de la Action
├── src/
│   ├── index.ts              # Punto de entrada principal
│   └── backendClient.ts      # Cliente backend (MOCK)
├── dist/
│   └── index.js              # Código compilado (generado)
├── .github/
│   └── workflows/
│       └── pr-check.yml      # Workflow de ejemplo
├── package.json
├── tsconfig.json
└── README.md
```

## 🔍 Funcionamiento

### Cuando se abre/actualiza un PR:

1. La Action lee la API Key desde los inputs
2. Consulta el backend (mock) para verificar el estado
3. **Si la trivia NO está completa:**
   - ❌ Falla el workflow
   - 💬 Deja un comentario con la URL de la trivia
   - 🚫 Bloquea el merge del PR
4. **Si la trivia está completa:**
   - ✅ Aprueba el workflow
   - Permite continuar con el merge

### Detección de duplicados:

Los comentarios incluyen un marker invisible para evitar spam. Si ya existe un comentario de la Action, se actualiza en lugar de crear uno nuevo.

## 🧪 Testing

Para probar la Action localmente sin hacer PRs reales:

```bash
# 1. Build
npm run build

# 2. Configurar variables de entorno
export INPUT_API-KEY='valid-test-key'
export INPUT_GITHUB-TOKEN='ghp_...'
export GITHUB_REPOSITORY='owner/repo'
# ... (más variables según sea necesario)

# 3. Ejecutar
node dist/index.js
```

## 📄 Licencia

MIT

## 🤝 Contribuir

¿Encontraste un bug? ¿Tienes una sugerencia? Abre un issue o envía un PR.

---

**Nota:** Esta es una versión MVP con backend mockeado. Diseñada como base arquitectónica para una plataforma comercial de PR validation.
