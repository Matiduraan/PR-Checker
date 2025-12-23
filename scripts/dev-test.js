#!/usr/bin/env node

/**
 * Script de desarrollo para testing local de la Action
 *
 * Uso:
 *   node scripts/dev-test.js [scenario]
 *
 * Escenarios disponibles:
 *   - success: Simula trivia completada
 *   - pending: Simula trivia pendiente
 *   - invalid: Simula API key inválida
 *   - expired: Simula API key expirada
 */

const scenarios = {
  success: {
    apiKey: 'valid-test-key',
    description: '✅ Trivia completada - PR aprobado',
  },
  pending: {
    apiKey: 'pending-test-key',
    description: '⏸️ Trivia pendiente - PR bloqueado',
  },
  invalid: {
    apiKey: 'invalid-key',
    description: '❌ API Key inválida - Error de auth',
  },
  expired: {
    apiKey: 'expired-key',
    description: '❌ API Key expirada - Error de auth',
  },
};

function printUsage() {
  console.log('\n📖 Uso: node scripts/dev-test.js [scenario]\n');
  console.log('Escenarios disponibles:\n');
  Object.entries(scenarios).forEach(([name, config]) => {
    console.log(`  ${name.padEnd(10)} - ${config.description}`);
  });
  console.log('\nEjemplo:');
  console.log('  node scripts/dev-test.js success\n');
}

function main() {
  const scenario = process.argv[2];

  if (!scenario || !scenarios[scenario]) {
    console.error('❌ Escenario no válido\n');
    printUsage();
    process.exit(1);
  }

  const config = scenarios[scenario];

  console.log('\n🧪 Ejecutando escenario de testing...\n');
  console.log(`📋 Escenario: ${scenario}`);
  console.log(`📝 Descripción: ${config.description}`);
  console.log(`🔑 API Key: ${config.apiKey}\n`);

  // Configurar variables de entorno
  process.env.INPUT_API_KEY = config.apiKey;
  process.env.INPUT_GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'mock-token';

  // Mock del contexto de GitHub
  process.env.GITHUB_EVENT_NAME = 'pull_request';
  process.env.GITHUB_REPOSITORY = 'test-org/test-repo';
  process.env.GITHUB_EVENT_PATH = require('path').join(__dirname, 'mock-event.json');

  // Crear mock event si no existe
  const fs = require('fs');
  const mockEventPath = process.env.GITHUB_EVENT_PATH;

  if (!fs.existsSync(mockEventPath)) {
    const mockEvent = {
      pull_request: {
        number: 1,
        user: {
          login: 'test-user',
        },
      },
      repository: {
        full_name: 'test-org/test-repo',
      },
    };
    fs.writeFileSync(mockEventPath, JSON.stringify(mockEvent, null, 2));
    console.log(`✅ Creado mock event en: ${mockEventPath}\n`);
  }

  console.log('🚀 Ejecutando Action...\n');
  console.log('─'.repeat(60));

  // Ejecutar la Action
  try {
    require('../dist/index.js');
  } catch (error) {
    console.error('\n❌ Error al ejecutar la Action:', error.message);
    process.exit(1);
  }
}

main();
