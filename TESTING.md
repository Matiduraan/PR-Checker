# Guía de Testing - PR Quiz Checker

Esta guía explica cómo probar la GitHub Action localmente y en diferentes escenarios.

## Testing del Backend Mock

### 1. Iniciar servidor

```bash
npm install
npm run mock-backend
```

### 2. Probar endpoints manualmente

```bash
# Health check
curl http://localhost:3000/health

# Generar quiz
curl -X POST http://localhost:3000/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "repoOwner": "test-org",
    "repoName": "test-repo",
    "prNumber": 123,
    "title": "Test PR",
    "description": "Testing quiz generation",
    "commitSHA": "abc123",
    "baseBranch": "main",
    "headBranch": "feature/test",
    "author": "testuser",
    "filesChanged": [
      {
        "filename": "src/test.ts",
        "status": "modified",
        "additions": 10,
        "deletions": 5,
        "changes": 15
      }
    ]
  }'

# Guardar el quizId del response anterior, ejemplo: quiz-1234567890-1

# Verificar estado
curl http://localhost:3000/quiz-status/quiz-1234567890-1

# Actualizar estado manualmente
curl -X POST http://localhost:3000/quiz-status/quiz-1234567890-1/update \
  -H "Content-Type: application/json" \
  -d '{"status": "PASSED", "attempts": 1}'

# Listar todos los quizzes
curl http://localhost:3000/quizzes
```

## Escenarios de Testing

### Escenario 1: Quiz aprobado inmediatamente

```bash
MOCK_DEFAULT_STATUS=PASSED npm run mock-backend
```

**Resultado esperado:** La action pasa inmediatamente en el primer polling.

### Escenario 2: Quiz pendiente indefinidamente

```bash
MOCK_DEFAULT_STATUS=PENDING npm run mock-backend
```

**Resultado esperado:** La action falla por timeout después de `max-polling-attempts`.

### Escenario 3: Auto-aprobación después de 30 segundos

```bash
MOCK_AUTO_PASS_SECONDS=30 npm run mock-backend
```

**Resultado esperado:** La action hace polling y pasa después de ~30 segundos.

### Escenario 4: Simular intentos fallidos

```bash
MOCK_FAILED_ATTEMPTS=2 MOCK_AUTO_PASS_SECONDS=45 npm run mock-backend
```

**Resultado esperado:** El quiz muestra 2 intentos fallidos antes de aprobar.

## Testing en GitHub Actions (Local con Act)

[Act](https://github.com/nektos/act) permite ejecutar GitHub Actions localmente.

### 1. Instalar Act

```bash
# Windows (con Chocolatey)
choco install act-cli

# O descargar desde https://github.com/nektos/act/releases
```

### 2. Crear evento de PR mock

Crear `test-event.json`:

```json
{
  "pull_request": {
    "number": 123,
    "title": "Test PR for Action",
    "body": "Testing the quiz checker action",
    "head": {
      "ref": "feature/test",
      "sha": "abc123def456"
    },
    "base": {
      "ref": "main"
    },
    "user": {
      "login": "testuser"
    }
  },
  "repository": {
    "owner": {
      "login": "test-org"
    },
    "name": "test-repo"
  }
}
```

### 3. Ejecutar con Act

```bash
# Compilar la action primero
npm run build

# Ejecutar el workflow
act pull_request -e test-event.json -W .github/workflows/pr-quiz-check.yml
```

## Testing del Código TypeScript

### 1. Compilación

```bash
npm run build
```

Verifica que no haya errores de TypeScript.

### 2. Lint (opcional, agregar eslint si es necesario)

```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npx eslint src/**/*.ts
```

## Checklist de Testing

- [ ] Backend mock inicia correctamente
- [ ] Endpoint `/generate-quiz` devuelve quizId y quizUrl válidos
- [ ] Endpoint `/quiz-status/:id` devuelve estados correctos
- [ ] Auto-aprobación funciona según configuración
- [ ] Actualización manual de estado funciona
- [ ] Código TypeScript compila sin errores
- [ ] La action se ejecuta en un PR real (o con Act)
- [ ] Comentario se publica correctamente en el PR
- [ ] Polling termina cuando el quiz se aprueba
- [ ] Polling hace timeout cuando corresponde
- [ ] Outputs de la action son correctos

## Variables de Entorno Útiles

```bash
# Backend Mock
MOCK_DEFAULT_STATUS=PENDING|FAILED|PASSED
MOCK_AUTO_PASS_SECONDS=30
MOCK_FAILED_ATTEMPTS=2
PORT=3000

# GitHub Actions (cuando uses Act)
GITHUB_TOKEN=tu_token_de_testing
```

## Debugging

### Habilitar logs detallados en GitHub Actions

En el workflow:

```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

### Ver logs del backend

El servidor mock imprime logs detallados de cada request:

```
📝 Generando quiz para PR #123
   Repo: test-org/test-repo
   Archivos modificados: 3
   ✅ Quiz creado: quiz-1234567890-1

📊 Estado de quiz-1234567890-1: PENDING (intentos: 0)
```

### Errores comunes

**Error: "Esta action solo funciona en eventos de pull_request"**

- Verifica que estás ejecutando en contexto de PR
- Con Act, asegúrate de usar `-e test-event.json`

**Error: "Backend error: 404"**

- El backend no está corriendo
- URL incorrecta en `mock-backend-url`

**Error: "ECONNREFUSED"**

- El backend no inició correctamente
- Firewall bloqueando conexión local

## Testing en Producción

Para hacer testing seguro en un repositorio real:

1. Crea un repositorio de testing
2. Configura branch protection rules
3. Abre un PR de prueba
4. Observa los logs de la action
5. Verifica que el comentario se publique
6. Prueba aprobar/fallar el quiz manualmente

## Próximos pasos

Una vez validado el funcionamiento:

1. Implementar backend real con IA para generar preguntas
2. Implementar frontend real para mostrar el cuestionario
3. Agregar persistencia en base de datos
4. Agregar autenticación/autorización
5. Agregar tests unitarios con Jest
6. Configurar CI/CD para la action
