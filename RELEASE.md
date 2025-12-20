# Release Process

## ⚠️ Importante: Commitear archivos compilados

Para que esta GitHub Action funcione, el directorio `dist/` **debe estar commiteado** en el repositorio.

## Proceso de Release

### 1. Hacer cambios en el código fuente

Edita archivos en `src/`:

```bash
# Editar archivos TypeScript
code src/main.ts
```

### 2. Compilar

```bash
npm run build
```

Esto genera `dist/index.js` que es el archivo que GitHub Actions ejecuta.

### 3. Commitear TODO (incluyendo dist/)

```bash
git add .
git commit -m "feat: descripción del cambio"
git push
```

### 4. Crear tag de versión

```bash
# Crear y pushear tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Actualizar tag mayor (opcional pero recomendado)
git tag -fa v1 -m "Update v1 to v1.0.0"
git push origin v1 --force
```

### 5. Crear GitHub Release (opcional)

Ve a GitHub → Releases → New Release:
- Tag: `v1.0.0`
- Title: `v1.0.0`
- Description: Changelog de cambios

## Versionado

Seguir [Semantic Versioning](https://semver.org/):

- **MAJOR** (v2.0.0): Cambios incompatibles con versiones anteriores
- **MINOR** (v1.1.0): Nueva funcionalidad compatible
- **PATCH** (v1.0.1): Bug fixes

## Tags recomendados

Mantener dos tags por release:

```bash
# Tag específico (nunca mover)
git tag v1.0.0

# Tag mayor (mover con cada minor/patch)
git tag -f v1
```

Esto permite a los usuarios:

```yaml
# Fijar versión exacta (recomendado para producción)
- uses: Matiduraan/PR-Checker@v1.0.0

# Usar última versión de v1 (auto-updates en patches)
- uses: Matiduraan/PR-Checker@v1
```

## Checklist pre-release

- [ ] Código compila sin errores: `npm run build`
- [ ] Tests pasan (cuando se implementen)
- [ ] README.md actualizado
- [ ] CHANGELOG.md actualizado (si existe)
- [ ] `dist/index.js` commiteado
- [ ] Version en `package.json` actualizada
- [ ] Tag creado y pusheado

## Troubleshooting

### Error: "File not found: dist/index.js"

**Causa:** El directorio `dist/` está en `.gitignore` o no fue commiteado.

**Solución:**
```bash
# Verificar que dist/ NO esté en .gitignore
# Compilar
npm run build

# Commitear
git add dist/
git commit -m "chore: add compiled code"
git push
```

### Error: "Cannot find module '@actions/core'"

**Causa:** Dependencies no fueron empaquetadas correctamente.

**Solución:**
```bash
# Limpiar y recompilar
rm -rf dist/ lib/ node_modules/
npm install
npm run build
```

## Automated Release (futuro)

Considerar implementar GitHub Actions para automatizar releases:

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - run: npm test
      - uses: actions/create-release@v1
        # ...
```
