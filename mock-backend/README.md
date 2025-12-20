# Mock Backend - PR Quiz Checker

Backend simulado para testing de la GitHub Action.

## Iniciar el servidor

```bash
npm run mock-backend
```

O directamente:

```bash
node mock-backend/server.js
```

Por defecto corre en `http://localhost:3000`

## Endpoints

### `POST /generate-quiz`

Genera un nuevo cuestionario.

**Request:**

```json
{
  "repoOwner": "owner",
  "repoName": "repo",
  "prNumber": 123,
  "title": "Título del PR",
  "commitSHA": "abc123",
  "filesChanged": [...]
}
```

**Response:**

```json
{
  "quizId": "quiz-1234567890-1",
  "quizUrl": "https://mock-frontend.dev/quiz/quiz-1234567890-1"
}
```

### `GET /quiz-status/:quizId`

Obtiene el estado de un quiz.

**Response:**

```json
{
  "status": "PENDING",
  "attempts": 0,
  "lastAttemptAt": null
}
```

Posibles valores de `status`: `PENDING`, `FAILED`, `PASSED`

### `POST /quiz-status/:quizId/update` (Testing)

Actualiza manualmente el estado de un quiz para testing.

**Request:**

```json
{
  "status": "PASSED",
  "attempts": 1
}
```

### `GET /quizzes` (Debugging)

Lista todos los quizzes en memoria.

### `GET /health`

Health check del servidor.

## Variables de entorno

```bash
# Estado por defecto de nuevos quizzes
MOCK_DEFAULT_STATUS=PENDING

# Auto-aprobar después de N segundos (0 = nunca)
MOCK_AUTO_PASS_SECONDS=30

# Simular N intentos fallidos antes de aprobar
MOCK_FAILED_ATTEMPTS=2

# Puerto del servidor
PORT=3000
```

## Ejemplos de uso

### Escenario 1: Quiz aprobado inmediatamente

```bash
MOCK_DEFAULT_STATUS=PASSED npm run mock-backend
```

### Escenario 2: Auto-aprobar después de 30 segundos

```bash
MOCK_AUTO_PASS_SECONDS=30 npm run mock-backend
```

### Escenario 3: Actualización manual

```bash
# 1. Iniciar servidor
npm run mock-backend

# 2. Generar quiz (guardar el quizId)
curl -X POST http://localhost:3000/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{"prNumber": 123}'

# 3. Actualizar estado manualmente
curl -X POST http://localhost:3000/quiz-status/quiz-1234567890-1/update \
  -H "Content-Type: application/json" \
  -d '{"status": "PASSED", "attempts": 1}'
```
