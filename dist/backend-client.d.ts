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
 * Cliente para interactuar con el backend mock
 */
export declare class BackendClient {
    private baseUrl;
    constructor(baseUrl: string);
    /**
     * Genera un nuevo cuestionario enviando la metadata del PR al backend
     * @param prMetadata Metadata del Pull Request
     * @returns Quiz ID y URL del cuestionario
     */
    generateQuiz(prMetadata: PRMetadata): Promise<QuizResponse>;
    /**
     * Consulta el estado actual de un cuestionario
     * @param quizId ID del cuestionario
     * @returns Estado actual del quiz
     */
    getQuizStatus(quizId: string): Promise<QuizStatusResponse>;
}
