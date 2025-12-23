/**
 * Cliente para comunicación con el backend de trivia.
 *
 * ESTADO ACTUAL: MOCK
 * -----------------
 * Esta implementación NO realiza llamadas HTTP reales.
 * Todas las respuestas están simuladas para permitir desarrollo y testing.
 *
 * MIGRACIÓN A PRODUCCIÓN:
 * ----------------------
 * Para habilitar la integración real:
 * 1. Descomentar las líneas marcadas con "// PROD:"
 * 2. Eliminar o comentar las líneas marcadas con "// MOCK:"
 * 3. Asegurarse de que BACKEND_URL apunte al endpoint correcto
 * 4. Verificar el formato de requests/responses con el backend real
 */
/**
 * Respuesta del endpoint de validación de trivia
 */
export interface TriviaStatusResponse {
    /** Indica si la trivia fue completada */
    completed: boolean;
    /** Mensaje descriptivo del estado */
    message: string;
    /** URL pública donde el usuario puede completar la trivia */
    triviaUrl?: string;
    /** Información adicional sobre el estado de la trivia */
    metadata?: {
        completedAt?: string;
        score?: number;
        attempts?: number;
    };
}
/**
 * Respuesta en caso de error de autenticación
 */
export interface AuthErrorResponse {
    error: 'invalid_api_key' | 'expired_api_key' | 'rate_limited';
    message: string;
}
/**
 * Parámetros para consultar el estado de la trivia
 */
export interface TriviaCheckParams {
    /** Nombre completo del repositorio (owner/repo) */
    repository: string;
    /** Número del Pull Request */
    prNumber: number;
    /** Username del autor del PR */
    author: string;
    /** API Key de autenticación */
    apiKey: string;
}
/**
 * Consulta el estado de la trivia para un PR específico.
 *
 * @param params - Parámetros de la consulta
 * @returns Estado de la trivia o error de autenticación
 * @throws Error si ocurre un problema de red o servidor
 */
export declare function checkTriviaStatus(params: TriviaCheckParams): Promise<TriviaStatusResponse | AuthErrorResponse>;
/**
 * Verifica si una respuesta es un error de autenticación
 */
export declare function isAuthError(response: TriviaStatusResponse | AuthErrorResponse): response is AuthErrorResponse;
