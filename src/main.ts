import * as core from "@actions/core";
import * as github from "@actions/github";
import { getPRMetadata } from "./pr-metadata";
import { BackendClient } from "./backend-client";
import { postCommentToPR } from "./comment-handler";
import { pollQuizStatus } from "./quiz-poller";

/**
 * Función principal de la GitHub Action
 * Orquesta todo el flujo: obtener metadata, generar quiz, comentar en PR, y polling
 */
export async function run(): Promise<void> {
  try {
    core.info("🚀 Iniciando PR Quiz Checker Action...");

    // 1. Validar que estamos en un contexto de Pull Request
    const context = github.context;
    if (!context.payload.pull_request) {
      throw new Error("Esta action solo funciona en eventos de pull_request");
    }

    // 2. Obtener inputs
    const githubToken = core.getInput("github-token", { required: true });
    const backendUrl =
      core.getInput("mock-backend-url", { required: false }) ||
      "http://localhost:3000";
    const pollingInterval = parseInt(
      core.getInput("polling-interval", { required: false }) || "10",
      10
    );
    const maxPollingAttempts = parseInt(
      core.getInput("max-polling-attempts", { required: false }) || "30",
      10
    );

    core.info(`📊 Configuración:`);
    core.info(`   Backend URL: ${backendUrl}`);
    core.info(`   Polling interval: ${pollingInterval}s`);
    core.info(`   Max polling attempts: ${maxPollingAttempts}`);

    // 3. Obtener metadata del PR
    core.info("📝 Obteniendo metadata del Pull Request...");
    const prMetadata = await getPRMetadata(githubToken);
    core.info(`   PR #${prMetadata.prNumber}: ${prMetadata.title}`);
    core.info(`   Archivos modificados: ${prMetadata.filesChanged.length}`);

    // 4. Enviar metadata al backend y obtener quiz
    core.info("🎯 Generando cuestionario en el backend...");
    const backendClient = new BackendClient(backendUrl);
    const quizResponse = await backendClient.generateQuiz(prMetadata);

    core.info(`   Quiz ID: ${quizResponse.quizId}`);
    core.info(`   Quiz URL: ${quizResponse.quizUrl}`);

    // 5. Publicar comentario en el PR con el link al quiz
    core.info("💬 Publicando comentario en el PR...");
    await postCommentToPR(githubToken, prMetadata.prNumber, quizResponse);
    core.info("   Comentario publicado exitosamente");

    // 6. Polling del estado del quiz
    core.info("⏳ Iniciando polling del estado del cuestionario...");
    const finalStatus = await pollQuizStatus(
      backendClient,
      quizResponse.quizId,
      pollingInterval,
      maxPollingAttempts
    );

    // 7. Evaluar resultado final
    core.setOutput("quiz-url", quizResponse.quizUrl);
    core.setOutput("quiz-status", finalStatus.status);

    if (finalStatus.status === "PASSED") {
      core.info("✅ Cuestionario completado exitosamente");
      core.info(`   Intentos totales: ${finalStatus.attempts}`);
    } else if (finalStatus.status === "FAILED") {
      core.setFailed(
        "❌ El cuestionario fue completado pero no fue aprobado. El desarrollador puede reintentarlo."
      );
    } else {
      core.setFailed(
        "⏰ Timeout: El cuestionario no fue completado en el tiempo esperado. El PR permanece bloqueado."
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Error en PR Quiz Checker: ${error.message}`);
    } else {
      core.setFailed("Error desconocido en PR Quiz Checker");
    }
    throw error;
  }
}
