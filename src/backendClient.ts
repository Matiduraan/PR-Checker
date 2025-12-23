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
 * URL del backend de trivia.
 * Esta URL NO es configurable por el usuario final.
 * Solo debe modificarse en este archivo para apuntar al backend real.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BACKEND_URL = 'https://api.trivia-validator.example.com';

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
export async function checkTriviaStatus(
  params: TriviaCheckParams
): Promise<TriviaStatusResponse | AuthErrorResponse> {
  const { repository, prNumber, author, apiKey } = params;

  // MOCK: Simulación de diferentes escenarios
  // ==========================================
  // En producción, reemplazar toda esta sección por una llamada HTTP real

  // Simulación de delay de red
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Validación de API Key (mock)
  if (!apiKey || apiKey.trim() === '') {
    return {
      error: 'invalid_api_key',
      message: 'API Key no proporcionada o vacía',
    };
  }

  // Simular diferentes escenarios basados en la API Key
  if (apiKey === 'invalid-key' || apiKey === 'test-invalid') {
    return {
      error: 'invalid_api_key',
      message:
        'API Key inválida. Por favor verifica tu licencia en https://trivia-validator.example.com',
    };
  }

  if (apiKey === 'expired-key') {
    return {
      error: 'expired_api_key',
      message: 'Tu API Key ha expirado. Renueva tu suscripción para continuar.',
    };
  }

  // Simular trivia completada (cuando la key contiene "valid")
  if (apiKey.includes('valid') || apiKey.includes('prod')) {
    return {
      completed: true,
      message: 'Trivia completada exitosamente',
      metadata: {
        completedAt: new Date().toISOString(),
        score: 85,
        attempts: 2,
      },
    };
  }

  // Por defecto: trivia pendiente
  return {
    completed: false,
    message: 'Trivia pendiente de completar',
    triviaUrl: `https://trivia-validator.example.com/complete?repo=${encodeURIComponent(
      repository
    )}&pr=${prNumber}&user=${encodeURIComponent(author)}`,
  };

  // PROD: Implementación real (comentada)
  // ======================================
  /*
  const url = `${BACKEND_URL}/trivia/status`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-Client-Version': '1.0.0',
    },
    body: JSON.stringify({
      repository,
      pr_number: prNumber,
      author,
    }),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const errorData = await response.json();
      return {
        error: 'invalid_api_key',
        message: errorData.message || 'Credenciales inválidas',
      };
    }
    
    if (response.status === 429) {
      return {
        error: 'rate_limited',
        message: 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.',
      };
    }

    throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
  */
}

/**
 * Verifica si una respuesta es un error de autenticación
 */
export function isAuthError(
  response: TriviaStatusResponse | AuthErrorResponse
): response is AuthErrorResponse {
  return 'error' in response;
}
