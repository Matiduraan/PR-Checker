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
export class BackendClient {
  private quizzes: Map<string, QuizStatusResponse>;
  private quizCounter: number;
  private autoPassAfterSeconds: number;
  private mockBehavior: "PENDING" | "FAILED" | "PASSED" | "AUTO_PASS";

  constructor(mockBehavior: "PENDING" | "FAILED" | "PASSED" | "AUTO_PASS" = "AUTO_PASS", autoPassAfterSeconds: number = 30) {
    this.quizzes = new Map();
    this.quizCounter = 1;
    this.mockBehavior = mockBehavior;
    this.autoPassAfterSeconds = autoPassAfterSeconds;
  }

  /**
   * Genera un nuevo cuestionario simulado basado en la metadata del PR
   * @param prMetadata Metadata del Pull Request
   * @returns Quiz ID y URL del cuestionario mock
   */
  async generateQuiz(prMetadata: PRMetadata): Promise<QuizResponse> {
    // Generar ID único para el quiz
    const quizId = `quiz-${Date.now()}-${this.quizCounter++}`;
    const quizUrl = `https://mock-frontend.dev/quiz/${quizId}`;

    // Crear entrada en el storage mock con estado inicial
    const initialStatus: QuizStatusResponse = {
      status: this.mockBehavior === "AUTO_PASS" ? "PENDING" : this.mockBehavior,
      attempts: 0,
      lastAttemptAt: undefined,
    };

    // Guardar quiz con timestamp de creación
    this.quizzes.set(quizId, {
      ...initialStatus,
      lastAttemptAt: new Date().toISOString(),
    });

    // Simular pequeña latencia de red
    await this.sleep(100);

    return {
      quizId,
      quizUrl,
    };
  }

  /**
   * Consulta el estado actual de un cuestionario simulado
   * @param quizId ID del cuestionario
   * @returns Estado actual del quiz
   */
  async getQuizStatus(quizId: string): Promise<QuizStatusResponse> {
    const quiz = this.quizzes.get(quizId);

    if (!quiz) {
      throw new Error(`Quiz no encontrado: ${quizId}`);
    }

    // Simular auto-aprobación después de cierto tiempo
    if (this.mockBehavior === "AUTO_PASS" && quiz.status === "PENDING") {
      const createdAt = new Date(quiz.lastAttemptAt || Date.now());
      const elapsed = (Date.now() - createdAt.getTime()) / 1000;

      if (elapsed >= this.autoPassAfterSeconds) {
        quiz.status = "PASSED";
        quiz.attempts = 1;
        quiz.lastAttemptAt = new Date().toISOString();
      }
    }

    // Simular pequeña latencia de red
    await this.sleep(100);

    return { ...quiz };
  }

  /**
   * Helper para simular latencia de red
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
