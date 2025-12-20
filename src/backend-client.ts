import fetch from "node-fetch";
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
export class BackendClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Remover trailing slash
  }

  /**
   * Genera un nuevo cuestionario enviando la metadata del PR al backend
   * @param prMetadata Metadata del Pull Request
   * @returns Quiz ID y URL del cuestionario
   */
  async generateQuiz(prMetadata: PRMetadata): Promise<QuizResponse> {
    const url = `${this.baseUrl}/generate-quiz`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repoOwner: prMetadata.repoOwner,
        repoName: prMetadata.repoName,
        prNumber: prMetadata.prNumber,
        title: prMetadata.title,
        description: prMetadata.description,
        commitSHA: prMetadata.commitSHA,
        baseBranch: prMetadata.baseBranch,
        headBranch: prMetadata.headBranch,
        author: prMetadata.author,
        filesChanged: prMetadata.filesChanged,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Backend error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as QuizResponse;
    return data;
  }

  /**
   * Consulta el estado actual de un cuestionario
   * @param quizId ID del cuestionario
   * @returns Estado actual del quiz
   */
  async getQuizStatus(quizId: string): Promise<QuizStatusResponse> {
    const url = `${this.baseUrl}/quiz-status/${quizId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Backend error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as QuizStatusResponse;
    return data;
  }
}
