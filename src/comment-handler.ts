import * as github from "@actions/github";
import { QuizResponse } from "./backend-client";

/**
 * Publica un comentario en el Pull Request con el link al cuestionario
 * @param githubToken Token de autenticación de GitHub
 * @param prNumber Número del Pull Request
 * @param quizResponse Respuesta del backend con quiz ID y URL
 */
export async function postCommentToPR(
  githubToken: string,
  prNumber: number,
  quizResponse: QuizResponse
): Promise<void> {
  const octokit = github.getOctokit(githubToken);
  const context = github.context;

  const commentBody = generateCommentBody(quizResponse);

  await octokit.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: prNumber,
    body: commentBody,
  });
}

/**
 * Genera el cuerpo del comentario en formato Markdown
 * @param quizResponse Respuesta del backend con quiz ID y URL
 * @returns String con el comentario formateado
 */
function generateCommentBody(quizResponse: QuizResponse): string {
  return `## 📋 Cuestionario de Comprensión de Código

Este Pull Request requiere que **al menos un desarrollador** complete un cuestionario para verificar que el código fue revisado correctamente.

### 🎯 Instrucciones

1. Haz clic en el siguiente enlace para acceder al cuestionario
2. Lee cuidadosamente el código del PR
3. Responde las preguntas basándote en los cambios realizados
4. Puedes fallar y reintentar las veces que necesites

### 🔗 Acceder al Cuestionario

**[👉 Completar Cuestionario](${quizResponse.quizUrl})**

### ℹ️ Información

- **Quiz ID:** \`${quizResponse.quizId}\`
- El PR permanecerá bloqueado hasta que el cuestionario sea aprobado
- Cualquier desarrollador con permisos para mergear puede responder

---

*Este comentario fue generado automáticamente por PR Quiz Checker Action*`;
}
