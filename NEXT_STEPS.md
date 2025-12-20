# 🚀 Instrucciones para Publicar la Action

## El problema está resuelto

El error `File not found: '/home/runner/work/_actions/Matiduraan/PR-Checker/0.0.1/dist/index.js'` ocurría porque el código compilado no estaba en el repositorio.

## ✅ Cambios realizados

1. ✅ Removido `dist/` del `.gitignore`
2. ✅ Compilado el código TypeScript → `dist/index.js`
3. ✅ Agregado `RELEASE.md` con proceso de release
4. ✅ Actualizado `README.md` con advertencia

## 📦 Ahora debes commitear y pushear

Ejecuta estos comandos en orden:

```powershell
# 1. Agregar todos los cambios (incluyendo dist/)
git add .

# 2. Commitear
git commit -m "fix: add compiled dist/index.js for GitHub Actions"

# 3. Pushear al repositorio
git push origin main

# 4. Crear y pushear tag de versión
git tag -a v0.0.2 -m "Release v0.0.2 - Fix missing dist folder"
git push origin v0.0.2

# 5. Actualizar tag mayor (opcional)
git tag -fa v0 -m "Update v0 to v0.0.2"
git push origin v0 --force
```

## 🔍 Verificar en GitHub

Después del push, verifica:

1. Ve a tu repositorio en GitHub
2. Navega a la carpeta `dist/`
3. Deberías ver `dist/index.js` (≈1.5 MB)

## 🎯 Usar la action en workflows

Una vez pusheado, actualiza tu workflow para usar la nueva versión:

```yaml
steps:
  - name: PR Quiz Checker
    uses: Matiduraan/PR-Checker@v0.0.2 # o @v0 para auto-updates
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      mock-backend-url: "http://localhost:3000"
```

## 📝 Para futuros cambios

**SIEMPRE que modifiques código fuente:**

```powershell
# 1. Hacer cambios en src/
code src/main.ts

# 2. Compilar
npm run build

# 3. Commitear TODO (src/ y dist/)
git add .
git commit -m "feat: tu cambio aquí"
git push

# 4. Crear nuevo tag si es un release
git tag -a v0.0.3 -m "Release v0.0.3"
git push origin v0.0.3
```

## ❓ Si el error persiste

1. Verifica que `dist/index.js` exista en GitHub (no solo local)
2. Verifica que el tag de versión apunte al commit correcto
3. En el workflow, usa el tag exacto: `@v0.0.2` en lugar de `@0.0.1`
4. Considera borrar `.github/workflows` del cache:
   - Settings → Actions → Caches → Delete all

## 📚 Documentación adicional

- `README.md` - Documentación de uso
- `RELEASE.md` - Proceso completo de release
- `TESTING.md` - Guía de testing
