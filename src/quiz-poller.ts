import * as core from "@actions/core";
import { BackendClient, QuizStatusResponse } from "./backend-client";

/**
 * Realiza polling del estado del cuestionario hasta que sea completado o se alcance el timeout
 * @param backendClient Cliente del backend
 * @param quizId ID del cuestionario
 * @param intervalSeconds Intervalo entre consultas en segundos
 * @param maxAttempts Número máximo de intentos de polling
 * @returns Estado final del cuestionario
 */
export async function pollQuizStatus(
  backendClient: BackendClient,
  quizId: string,
  intervalSeconds: number,
  maxAttempts: number
): Promise<QuizStatusResponse> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    core.info(
      `   Intento ${attempts}/${maxAttempts} - Consultando estado del quiz...`
    );

    const status = await backendClient.getQuizStatus(quizId);

    core.info(
      `   Estado: ${status.status} | Intentos del usuario: ${status.attempts}`
    );

    // Si el quiz fue aprobado, retornamos inmediatamente
    if (status.status === "PASSED") {
      core.info(`   ✅ Quiz aprobado en el intento ${status.attempts}`);
      return status;
    }

    // Si el quiz falló (pero puede reintentarse), continuamos polling
    if (status.status === "FAILED") {
      core.info(`   ⚠️  Quiz fallido, esperando reintento del usuario...`);
    }

    // Si aún está pendiente, informamos
    if (status.status === "PENDING") {
      core.info(`   ⏳ Quiz aún no iniciado o en progreso...`);
    }

    // Si no hemos llegado al límite, esperamos antes del próximo intento
    if (attempts < maxAttempts) {
      core.info(
        `   Esperando ${intervalSeconds} segundos antes del próximo intento...`
      );
      await sleep(intervalSeconds * 1000);
    }
  }

  // Si llegamos aquí, alcanzamos el máximo de intentos sin aprobación
  core.warning(
    `Timeout alcanzado después de ${maxAttempts} intentos (${
      maxAttempts * intervalSeconds
    }s)`
  );

  // Hacemos una última consulta para retornar el estado final
  return await backendClient.getQuizStatus(quizId);
}

/**
 * Función helper para pausar la ejecución
 * @param ms Milisegundos a esperar
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
