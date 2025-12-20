# PR Quiz Checker - GitHub Action

GitHub Action que bloquea el merge de un Pull Request hasta que al menos un desarrollador complete correctamente un cuestionario de comprensión del código.

## 🎯 Características

- ✅ Bloquea el merge hasta completar el cuestionario
- 🔄 Permite múltiples intentos (fallar y reintentar)
- 📊 Obtiene automáticamente metadata del PR (archivos, commits, etc.)
- 💬 Comenta automáticamente en el PR con el link al quiz
- ⏱️ Polling automático del estado del cuestionario
- 🎭 Incluye backend mock completo para testing

## 📋 Requisitos

- Node.js 20+
- GitHub Actions environment
- Backend que implemente los endpoints requeridos (o usar el mock incluido)

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
          mock-backend-url: "http://localhost:3000"
          polling-interval: "10"
          max-polling-attempts: "30"
```

### 3. Configuración

#### Inputs

| Input                  | Descripción                     | Requerido | Default                 |
| ---------------------- | ------------------------------- | --------- | ----------------------- |
| `github-token`         | Token de GitHub                 | Sí        | `${{ github.token }}`   |
| `mock-backend-url`     | URL del backend                 | No        | `http://localhost:3000` |
| `polling-interval`     | Intervalo de polling (segundos) | No        | `10`                    |
| `max-polling-attempts` | Máximo de intentos de polling   | No        | `30`                    |

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

### Testing local

1. **Iniciar backend mock:**

```bash
npm run mock-backend
```

2. **Configurar diferentes escenarios:**

```bash
# Auto-aprobar después de 30 segundos
MOCK_AUTO_PASS_SECONDS=30 npm run mock-backend

# Quiz aprobado por defecto
MOCK_DEFAULT_STATUS=PASSED npm run mock-backend

# Simular intentos fallidos
MOCK_FAILED_ATTEMPTS=2 MOCK_AUTO_PASS_SECONDS=60 npm run mock-backend
```

3. **Probar la action** (requiere contexto de PR real o mock)

### Estructura del proyecto

```
action/
├── src/
│   ├── index.ts              # Entry point
│   ├── main.ts               # Lógica principal
│   ├── pr-metadata.ts        # Extracción de metadata del PR
│   ├── backend-client.ts     # Cliente HTTP para backend
│   ├── comment-handler.ts    # Publicar comentarios en PR
│   └── quiz-poller.ts        # Polling del estado del quiz
├── mock-backend/
│   ├── server.js             # Servidor Express mock
│   └── README.md             # Documentación del backend
├── dist/                     # Código compilado (generado)
├── action.yml                # Metadata de la action
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 Integración con Backend Real

Para usar un backend real en producción, implementa estos endpoints:

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

**Response:**

```json
{
  "quizId": "string",
  "quizUrl": "string"
}
```

### `GET /quiz-status/:quizId`

**Response:**

```json
{
  "status": "PENDING" | "FAILED" | "PASSED",
  "attempts": number,
  "lastAttemptAt": "ISO 8601 string" (opcional)
}
```

## 🎭 Backend Mock

El backend mock incluido soporta:

- ✅ Generación de quizzes con IDs únicos
- ✅ Consulta de estado
- ✅ Auto-aprobación configurable
- ✅ Actualización manual de estado (testing)
- ✅ Listado de todos los quizzes
- ✅ Health check

Ver `mock-backend/README.md` para más detalles.

## 🔒 Seguridad

- El `github-token` debe tener permisos de escritura en PRs
- El backend debe validar la procedencia de las requests
- No almacenar secretos en el código
- Usar HTTPS en producción

## 📝 Flujo Completo

1. Se abre/actualiza un Pull Request
2. La action se ejecuta automáticamente
3. Obtiene metadata del PR (archivos, commits, etc.)
4. Envía metadata al backend
5. Backend genera un cuestionario y devuelve URL
6. Action publica comentario en el PR con el link
7. Action hace polling del estado cada X segundos
8. Si el quiz se aprueba → Action pasa ✅
9. Si no se aprueba en el tiempo límite → Action falla ❌
10. El PR permanece bloqueado hasta que la action pase

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

### El backend no responde

Verifica que:

- El backend esté corriendo
- La URL sea correcta
- No haya firewalls bloqueando la conexión

### El polling nunca termina

Aumenta `max-polling-attempts` o reduce `polling-interval`:

```yaml
with:
  polling-interval: "5"
  max-polling-attempts: "60" # 5 minutos total
```
