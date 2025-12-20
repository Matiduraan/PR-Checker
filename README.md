# PR Quiz Checker - GitHub Action

GitHub Action que bloquea el merge de un Pull Request hasta que al menos un desarrollador complete correctamente un cuestionario de comprensión del código.

## 🎯 Características

- ✅ Bloquea el merge hasta completar el cuestionario
- 🔄 Permite múltiples intentos (fallar y reintentar)
- 📊 Obtiene automáticamente metadata del PR (archivos, commits, etc.)
- 💬 Comenta automáticamente en el PR con el link al quiz
- ⏱️ Polling automático del estado del cuestionario
- 🎭 **Sin backend necesario** - Todo funciona con respuestas mock integradas
- ⚙️ Configurable: auto-aprobar, mantener pendiente, aprobar/rechazar instantáneo

## 📋 Requisitos

- Node.js 20+
- GitHub Actions environment
- **No requiere backend externo** - Funciona completamente standalone

## ⚠️ Importante para Desarrolladores

Si modificas el código fuente, **debes compilar y commitear** el directorio `dist/`:

```bash
npm run build
git add dist/
git commit -m "chore: update compiled code"
```

Ver [RELEASE.md](RELEASE.md) para más detalles sobre el proceso de release.

## 🚀 Uso

### 1. Estructura del repositorio

Coloca esta action en tu repositorio:

```
.github/
  workflows/
    pr-quiz-check.yml
```

### 2. Workflow de ejemplo

Crea `.github/workflows/pr-quiz-check.yml`:

```yaml
name: PR Quiz Check

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  quiz-check:
    runs-on: ubuntu-latest
    name: Verificar Comprensión del PR

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: PR Quiz Checker
        uses: ./ # O tu-org/pr-quiz-checker@v1 si está publicado
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          mock-behavior: "AUTO_PASS" # PENDING, FAILED, PASSED, AUTO_PASS
          auto-pass-seconds: "30" # Auto-aprobar después de 30 segundos
          polling-interval: "10"
          max-polling-attempts: "30"
```

### 3. Configuración

#### Inputs

| Input                  | Descripción                                                         | Requerido | Default               |
| ---------------------- | ------------------------------------------------------------------- | --------- | --------------------- |
| `github-token`         | Token de GitHub                                                     | Sí        | `${{ github.token }}` |
| `mock-behavior`        | Comportamiento del quiz: `PENDING`, `FAILED`, `PASSED`, `AUTO_PASS` | No        | `AUTO_PASS`           |
| `auto-pass-seconds`    | Segundos antes de auto-aprobar (solo con `AUTO_PASS`)               | No        | `30`                  |
| `polling-interval`     | Intervalo de polling (segundos)                                     | No        | `10`                  |
| `max-polling-attempts` | Máximo de intentos de polling                                       | No        | `30`                  |

#### Outputs

| Output        | Descripción                                  |
| ------------- | -------------------------------------------- |
| `quiz-url`    | URL del cuestionario generado                |
| `quiz-status` | Estado final (`PASSED`, `FAILED`, `PENDING`) |

## 🏗️ Desarrollo

### Instalación

```bash
npm install
```

### Build

```bash
npm run build
```

Esto compila TypeScript y empaqueta todo en `dist/index.js` usando `@vercel/ncc`.

### Comportamientos Mock Disponibles

La action funciona completamente sin backend. Puedes configurar diferentes comportamientos:

#### `AUTO_PASS` (default)

Auto-aprueba el quiz después de N segundos (configurable con `auto-pass-seconds`):

```yaml
with:
  mock-behavior: "AUTO_PASS"
  auto-pass-seconds: "30" # Aprueba después de 30 segundos
```

#### `PASSED`

Aprueba inmediatamente (útil para testing):

```yaml
with:
  mock-behavior: "PASSED"
```

#### `FAILED`

Rechaza inmediatamente:

```yaml
with:
  mock-behavior: "FAILED"
```

#### `PENDING`

Permanece pendiente indefinidamente (fallará por timeout):

```yaml
with:
  mock-behavior: "PENDING"
  max-polling-attempts: "10" # Fallará después de 10 intentos
```

### Estructura del proyecto

```
action/
├── src/
│   ├── index.ts              # Entry point
│   ├── main.ts               # Lógica principal
│   ├── pr-metadata.ts        # Extracción de metadata del PR
│   ├── backend-client.ts     # Cliente mock (sin backend real)
│   ├── comment-handler.ts    # Publicar comentarios en PR
│   └── quiz-poller.ts        # Polling del estado del quiz
├── dist/                     # Código compilado (generado)
├── action.yml                # Metadata de la action
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 Migración a Backend Real (Futuro)

Actualmente la action funciona completamente sin backend usando respuestas mock.

Para integrar con un backend real que genere preguntas con IA:

1. **Modificar `src/backend-client.ts`** para hacer llamadas HTTP reales
2. **Implementar endpoints** en tu backend:
   - `POST /generate-quiz` - Recibe metadata del PR, genera preguntas
   - `GET /quiz-status/:id` - Retorna estado actual del quiz
3. **Implementar frontend** para mostrar el cuestionario en la URL generada
4. **Actualizar inputs** del `action.yml` para aceptar URL de backend real

Ver `mock-backend/` para un ejemplo de referencia de cómo debería ser la estructura de respuestas.

### `POST /generate-quiz`

**Request:**

```json
{
  "repoOwner": "string",
  "repoName": "string",
  "prNumber": number,
  "title": "string",
  "description": "string",
  "commitSHA": "string",
  "baseBranch": "string",
  "headBranch": "string",
  "author": "string",
  "filesChanged": [
    {
      "filename": "string",
      "status": "added|modified|removed|renamed",
      "additions": number,
      "deletions": number,
      "changes": number,
      "patch": "string"
    }
  ]
}
```

Ver `mock-backend/` para un ejemplo de referencia de cómo debería ser la estructura de respuestas.

## 🔒 Seguridad

- El `github-token` debe tener permisos de escritura en PRs
- No almacenar secretos en el código
- Si migras a backend real, usar HTTPS y validar origen de requests

## 📝 Flujo Completo

1. Se abre/actualiza un Pull Request
2. La action se ejecuta automáticamente
3. Obtiene metadata del PR (archivos, commits, etc.)
4. **Genera quiz mock localmente** (sin backend externo)
5. Publica comentario en el PR con el link al cuestionario
6. Hace polling del estado cada X segundos
7. Según configuración:
   - **AUTO_PASS**: Aprueba después de N segundos → Action pasa ✅
   - **PASSED**: Aprueba inmediatamente → Action pasa ✅
   - **FAILED**: Rechaza inmediatamente → Action falla ❌
   - **PENDING**: Permanece pendiente → Action falla por timeout ❌
8. El PR permanece bloqueado hasta que la action pase

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT

## 🆘 Troubleshooting

### La action falla con "Esta action solo funciona en eventos de pull_request"

Asegúrate de que el workflow se ejecuta en eventos de PR:

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
```

### El quiz nunca se aprueba

Si usas `mock-behavior: "PENDING"`, el quiz nunca se aprobará. Cambia a:

```yaml
with:
  mock-behavior: "AUTO_PASS"
  auto-pass-seconds: "30"
```

### El polling termina muy rápido

Aumenta `max-polling-attempts` o reduce `polling-interval`:

```yaml
with:
  polling-interval: "5"
  max-polling-attempts: "60" # 5 minutos total
```
