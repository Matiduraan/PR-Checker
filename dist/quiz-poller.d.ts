import { BackendClient, QuizStatusResponse } from "./backend-client";
/**
 * Realiza polling del estado del cuestionario hasta que sea completado o se alcance el timeout
 * @param backendClient Cliente del backend
 * @param quizId ID del cuestionario
 * @param intervalSeconds Intervalo entre consultas en segundos
 * @param maxAttempts Número máximo de intentos de polling
 * @returns Estado final del cuestionario
 */
export declare function pollQuizStatus(backendClient: BackendClient, quizId: string, intervalSeconds: number, maxAttempts: number): Promise<QuizStatusResponse>;
