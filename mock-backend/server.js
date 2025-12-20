/**
 * Backend Mock para PR Quiz Checker
 *
 * Este servidor simula un backend que:
 * 1. Recibe metadata de PRs y genera cuestionarios
 * 2. Mantiene el estado de los cuestionarios
 * 3. Permite consultar el estado de un quiz
 *
 * Para testing, el estado puede controlarse con variables de entorno
 */

const express = require("express");
const app = express();

// Middleware
app.use(express.json());

// Storage en memoria para los quizzes
const quizzes = new Map();

// Contador para IDs únicos
let quizCounter = 1;

/**
 * Configuración del comportamiento mock
 * Puede ser controlado por variables de entorno
 */
const MOCK_CONFIG = {
  // Comportamiento por defecto: PENDING, PASSED, FAILED
  defaultStatus: process.env.MOCK_DEFAULT_STATUS || "PENDING",

  // Auto-aprobar después de N segundos (0 = nunca)
  autoPassAfterSeconds: parseInt(process.env.MOCK_AUTO_PASS_SECONDS || "0", 10),

  // Simular intentos fallidos antes de aprobar
  failedAttemptsBeforePass: parseInt(
    process.env.MOCK_FAILED_ATTEMPTS || "0",
    10
  ),
};

console.log("🎭 Mock Backend Configuration:");
console.log("   Default Status:", MOCK_CONFIG.defaultStatus);
console.log("   Auto-pass after:", MOCK_CONFIG.autoPassAfterSeconds, "seconds");
console.log(
  "   Failed attempts before pass:",
  MOCK_CONFIG.failedAttemptsBeforePass
);

/**
 * POST /generate-quiz
 * Genera un nuevo cuestionario basado en la metadata del PR
 */
app.post("/generate-quiz", (req, res) => {
  const metadata = req.body;

  console.log(`\n📝 Generando quiz para PR #${metadata.prNumber}`);
  console.log(`   Repo: ${metadata.repoOwner}/${metadata.repoName}`);
  console.log(`   Archivos modificados: ${metadata.filesChanged?.length || 0}`);

  const quizId = `quiz-${Date.now()}-${quizCounter++}`;
  const quizUrl = `https://mock-frontend.dev/quiz/${quizId}`;

  // Crear entrada en el storage
  quizzes.set(quizId, {
    id: quizId,
    prMetadata: metadata,
    status: MOCK_CONFIG.defaultStatus,
    attempts: 0,
    createdAt: new Date().toISOString(),
    lastAttemptAt: null,
  });

  console.log(`   ✅ Quiz creado: ${quizId}`);

  res.json({
    quizId,
    quizUrl,
  });
});

/**
 * GET /quiz-status/:quizId
 * Obtiene el estado actual de un cuestionario
 */
app.get("/quiz-status/:quizId", (req, res) => {
  const { quizId } = req.params;

  const quiz = quizzes.get(quizId);

  if (!quiz) {
    console.log(`❌ Quiz no encontrado: ${quizId}`);
    return res.status(404).json({ error: "Quiz no encontrado" });
  }

  // Simular auto-aprobación después de cierto tiempo
  if (MOCK_CONFIG.autoPassAfterSeconds > 0) {
    const elapsed = (Date.now() - new Date(quiz.createdAt).getTime()) / 1000;
    if (
      elapsed >= MOCK_CONFIG.autoPassAfterSeconds &&
      quiz.status !== "PASSED"
    ) {
      quiz.status = "PASSED";
      quiz.attempts = MOCK_CONFIG.failedAttemptsBeforePass + 1;
      quiz.lastAttemptAt = new Date().toISOString();
      console.log(`   🎯 Auto-aprobación activada para ${quizId}`);
    }
  }

  console.log(
    `   📊 Estado de ${quizId}: ${quiz.status} (intentos: ${quiz.attempts})`
  );

  res.json({
    status: quiz.status,
    attempts: quiz.attempts,
    lastAttemptAt: quiz.lastAttemptAt,
  });
});

/**
 * POST /quiz-status/:quizId/update
 * Endpoint auxiliar para actualizar manualmente el estado (solo para testing)
 */
app.post("/quiz-status/:quizId/update", (req, res) => {
  const { quizId } = req.params;
  const { status, attempts } = req.body;

  const quiz = quizzes.get(quizId);

  if (!quiz) {
    return res.status(404).json({ error: "Quiz no encontrado" });
  }

  if (status) quiz.status = status;
  if (attempts !== undefined) quiz.attempts = attempts;
  quiz.lastAttemptAt = new Date().toISOString();

  console.log(
    `   🔄 Estado actualizado manualmente: ${quizId} -> ${quiz.status}`
  );

  res.json({
    status: quiz.status,
    attempts: quiz.attempts,
    lastAttemptAt: quiz.lastAttemptAt,
  });
});

/**
 * GET /quizzes
 * Lista todos los quizzes (útil para debugging)
 */
app.get("/quizzes", (req, res) => {
  const allQuizzes = Array.from(quizzes.values()).map((q) => ({
    id: q.id,
    status: q.status,
    attempts: q.attempts,
    prNumber: q.prMetadata.prNumber,
    createdAt: q.createdAt,
  }));

  res.json(allQuizzes);
});

/**
 * GET /health
 * Health check endpoint
 */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    quizzes: quizzes.size,
    timestamp: new Date().toISOString(),
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Mock Backend Server corriendo en http://localhost:${PORT}`);
  console.log(`\nEndpoints disponibles:`);
  console.log(`   POST   /generate-quiz`);
  console.log(`   GET    /quiz-status/:quizId`);
  console.log(`   POST   /quiz-status/:quizId/update (testing)`);
  console.log(`   GET    /quizzes (debugging)`);
  console.log(`   GET    /health`);
  console.log(`\n`);
});

module.exports = app;
