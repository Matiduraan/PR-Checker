import { PRMetadata } from "./pr-metadata";
/**
 * Response del endpoint de generación de quiz
 */
export interface QuizResponse {
    quizId: string;
    quizUrl: string;
}
/**
 * Response del endpoint de estado del quiz
 */
export interface QuizStatusResponse {
    status: "PENDING" | "FAILED" | "PASSED";
    attempts: number;
    lastAttemptAt?: string;
}
/**
 * Cliente mock que simula respuestas del backend
 * No requiere backend real, todas las respuestas son generadas localmente
 */
export declare class BackendClient {
    private quizzes;
    private quizCounter;
    private autoPassAfterSeconds;
    private mockBehavior;
    constructor(mockBehavior?: "PENDING" | "FAILED" | "PASSED" | "AUTO_PASS", autoPassAfterSeconds?: number);
    /**
     * Genera un nuevo cuestionario simulado basado en la metadata del PR
     * @param prMetadata Metadata del Pull Request
     * @returns Quiz ID y URL del cuestionario mock
     */
    generateQuiz(prMetadata: PRMetadata): Promise<QuizResponse>;
    /**
     * Consulta el estado actual de un cuestionario simulado
     * @param quizId ID del cuestionario
     * @returns Estado actual del quiz
     */
    getQuizStatus(quizId: string): Promise<QuizStatusResponse>;
    /**
     * Helper para simular latencia de red
     */
    private sleep;
}
