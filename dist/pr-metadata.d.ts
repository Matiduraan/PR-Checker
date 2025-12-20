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
    status: string;
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
export declare function getPRMetadata(githubToken: string): Promise<PRMetadata>;
