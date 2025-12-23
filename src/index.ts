import * as core from '@actions/core';
import * as github from '@actions/github';
import { checkTriviaStatus, isAuthError, TriviaCheckParams } from './backendClient';

/**
 * Identificador único para detectar comentarios de esta Action.
 * Se usa como marker oculto en el comentario para evitar duplicados.
 */
const COMMENT_MARKER = '<!-- pr-trivia-checker-comment -->';

/**
 * Genera el cuerpo del comentario cuando la trivia está pendiente.
 */
function generatePendingComment(triviaUrl: string): string {
  return `${COMMENT_MARKER}
## ⏸️ Pull Request en espera

Este PR requiere completar una validación externa antes de poder ser mergeado.

### 📝 ¿Qué necesito hacer?

Por favor, completa la trivia de validación haciendo clic en el siguiente enlace:

**[➡️ Completar Trivia](${triviaUrl})**

Una vez completada la trivia, vuelve a ejecutar esta Action (puedes hacer un push vacío o re-ejecutar el workflow manualmente).

---
*Esta validación es requerida para todos los Pull Requests en este repositorio.*`;
}

/**
 * Genera el cuerpo del comentario cuando hay un error de autenticación.
 */
function generateAuthErrorComment(errorMessage: string): string {
  return `${COMMENT_MARKER}
## ❌ Error de autenticación

Hubo un problema al verificar la API Key configurada:

**${errorMessage}**

### 🔧 ¿Cómo resolverlo?

1. Verifica que la API Key esté correctamente configurada en el workflow
2. Asegúrate de que la key no haya expirado
3. Contacta al administrador si el problema persiste

---
*Esta Action requiere una API Key válida para funcionar correctamente.*`;
}

/**
 * Busca un comentario existente de esta Action en el PR.
 *
 * @param octokit - Cliente de GitHub
 * @param owner - Owner del repositorio
 * @param repo - Nombre del repositorio
 * @param issueNumber - Número del PR
 * @returns ID del comentario si existe, null si no
 */
async function findExistingComment(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  issueNumber: number
): Promise<number | null> {
  try {
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: issueNumber,
    });

    const existingComment = comments.find((comment) => comment.body?.includes(COMMENT_MARKER));

    return existingComment?.id || null;
  } catch (error) {
    core.warning(
      `No se pudo buscar comentarios existentes: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return null;
  }
}

/**
 * Publica o actualiza un comentario en el PR.
 *
 * @param octokit - Cliente de GitHub
 * @param owner - Owner del repositorio
 * @param repo - Nombre del repositorio
 * @param issueNumber - Número del PR
 * @param body - Contenido del comentario
 */
async function postOrUpdateComment(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string
): Promise<void> {
  const existingCommentId = await findExistingComment(octokit, owner, repo, issueNumber);

  try {
    if (existingCommentId) {
      // Actualizar comentario existente
      await octokit.rest.issues.updateComment({
        owner,
        repo,
        comment_id: existingCommentId,
        body,
      });
      core.info(`✏️ Comentario actualizado (ID: ${existingCommentId})`);
    } else {
      // Crear nuevo comentario
      const { data } = await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body,
      });
      core.info(`💬 Nuevo comentario creado (ID: ${data.id})`);
    }
  } catch (error) {
    core.error(
      `Error al publicar comentario: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

/**
 * Función principal de la GitHub Action.
 */
async function run(): Promise<void> {
  try {
    // 1. Leer inputs
    const apiKey = core.getInput('api-key', { required: true });
    const githubToken = core.getInput('github-token', { required: true });

    core.info('🚀 Iniciando PR Trivia Checker...');

    // 2. Obtener contexto del PR
    const context = github.context;

    if (!context.payload.pull_request) {
      core.setFailed('Esta Action solo puede ejecutarse en eventos de pull_request');
      return;
    }

    const prNumber = context.payload.pull_request.number;
    const author = context.payload.pull_request.user.login;
    const repository = context.payload.repository?.full_name;

    if (!repository) {
      core.setFailed('No se pudo obtener el nombre del repositorio');
      return;
    }

    core.info(`📋 PR #${prNumber} por @${author} en ${repository}`);

    // 3. Preparar parámetros para el backend
    const params: TriviaCheckParams = {
      repository,
      prNumber,
      author,
      apiKey,
    };

    // 4. Consultar estado de la trivia
    core.info('🔍 Consultando estado de la trivia...');
    const response = await checkTriviaStatus(params);

    // 5. Crear cliente de GitHub para comentarios
    const octokit = github.getOctokit(githubToken);
    const [owner, repo] = repository.split('/');

    // 6. Manejar errores de autenticación
    if (isAuthError(response)) {
      core.error(`❌ Error de autenticación: ${response.message}`);

      const errorComment = generateAuthErrorComment(response.message);
      await postOrUpdateComment(octokit, owner, repo, prNumber, errorComment);

      core.setFailed(`Error de autenticación: ${response.message}`);
      return;
    }

    // 7. Manejar estado de la trivia
    if (!response.completed) {
      // Trivia NO completada - bloquear PR
      core.warning('⏸️ Trivia pendiente de completar');

      const triviaUrl = response.triviaUrl || 'https://trivia-validator.example.com/complete';

      const pendingComment = generatePendingComment(triviaUrl);
      await postOrUpdateComment(octokit, owner, repo, prNumber, pendingComment);

      core.setFailed(`La trivia debe ser completada antes de mergear este PR. URL: ${triviaUrl}`);
      return;
    }

    // 8. Trivia completada - éxito
    core.info('✅ Trivia completada exitosamente!');
    core.info(`   Mensaje: ${response.message}`);

    if (response.metadata) {
      core.info(`   Completada: ${response.metadata.completedAt || 'N/A'}`);
      core.info(`   Score: ${response.metadata.score || 'N/A'}`);
    }

    // No dejamos comentario en caso exitoso (según requerimientos)
    core.info('🎉 PR aprobado - puede continuar con el merge');
  } catch (error) {
    // Manejo de errores inesperados
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.error(`💥 Error inesperado: ${errorMessage}`);

    if (error instanceof Error && error.stack) {
      core.debug(error.stack);
    }

    core.setFailed(`Error al ejecutar la Action: ${errorMessage}`);
  }
}

// Ejecutar la Action
run();
