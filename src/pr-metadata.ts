import * as github from "@actions/github";

/**
 * Interface que representa la metadata de un Pull Request
 */
export interface PRMetadata {
  repoOwner: string;
  repoName: string;
  prNumber: number;
  title: string;
  description: string;
  commitSHA: string;
  baseBranch: string;
  headBranch: string;
  author: string;
  filesChanged: FileChange[];
}

/**
 * Interface para archivos modificados
 */
export interface FileChange {
  filename: string;
  status: string; // 'added' | 'modified' | 'removed' | 'renamed'
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

/**
 * Obtiene toda la metadata relevante del Pull Request actual
 * @param githubToken Token de autenticación de GitHub
 * @returns Objeto con toda la información del PR
 */
export async function getPRMetadata(githubToken: string): Promise<PRMetadata> {
  const octokit = github.getOctokit(githubToken);
  const context = github.context;

  const pr = context.payload.pull_request!;

  // Obtener lista de archivos modificados
  const { data: files } = await octokit.rest.pulls.listFiles({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pr.number,
  });

  const filesChanged: FileChange[] = files.map((file) => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    changes: file.changes,
    patch: file.patch,
  }));

  return {
    repoOwner: context.repo.owner,
    repoName: context.repo.repo,
    prNumber: pr.number,
    title: pr.title,
    description: pr.body || "",
    commitSHA: pr.head.sha,
    baseBranch: pr.base.ref,
    headBranch: pr.head.ref,
    author: pr.user.login,
    filesChanged,
  };
}
