import { QuizResponse } from "./backend-client";
/**
 * Publica un comentario en el Pull Request con el link al cuestionario
 * @param githubToken Token de autenticación de GitHub
 * @param prNumber Número del Pull Request
 * @param quizResponse Respuesta del backend con quiz ID y URL
 */
export declare function postCommentToPR(githubToken: string, prNumber: number, quizResponse: QuizResponse): Promise<void>;
