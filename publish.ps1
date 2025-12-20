# Script de ayuda para publicar la action
# Uso: .\publish.ps1 "v0.0.2" "Fix: add compiled dist folder"

param(
    [Parameter(Mandatory=$true)]
    [string]$Version,
    
    [Parameter(Mandatory=$true)]
    [string]$Message
)

Write-Host "🚀 Publicando GitHub Action - $Version" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que estamos en la rama correcta
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "📍 Rama actual: $currentBranch" -ForegroundColor Yellow

if ($currentBranch -ne "main") {
    Write-Host "⚠️  Advertencia: No estás en la rama 'main'" -ForegroundColor Red
    $continue = Read-Host "¿Continuar de todos modos? (s/n)"
    if ($continue -ne "s") {
        exit 1
    }
}

# 2. Compilar
Write-Host ""
Write-Host "🔨 Compilando código TypeScript..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en la compilación" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Compilación exitosa" -ForegroundColor Green

# 3. Verificar que dist/index.js existe
if (-not (Test-Path "dist/index.js")) {
    Write-Host "❌ Error: dist/index.js no fue generado" -ForegroundColor Red
    exit 1
}

$distSize = (Get-Item "dist/index.js").Length / 1KB
Write-Host "📦 Tamaño de dist/index.js: $([math]::Round($distSize, 2)) KB" -ForegroundColor Yellow

# 4. Git add
Write-Host ""
Write-Host "📝 Agregando cambios al staging..." -ForegroundColor Cyan
git add .

# 5. Mostrar status
Write-Host ""
Write-Host "📊 Estado de Git:" -ForegroundColor Cyan
git status --short

# 6. Confirmar
Write-Host ""
$confirm = Read-Host "¿Proceder con el commit y tag '$Version'? (s/n)"
if ($confirm -ne "s") {
    Write-Host "❌ Publicación cancelada" -ForegroundColor Red
    exit 0
}

# 7. Commit
Write-Host ""
Write-Host "💾 Creando commit..." -ForegroundColor Cyan
git commit -m $Message

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el commit" -ForegroundColor Red
    exit 1
}

# 8. Tag
Write-Host ""
Write-Host "🏷️  Creando tag $Version..." -ForegroundColor Cyan
git tag -a $Version -m "Release $Version"

# Tag mayor (ejemplo: v0.0.2 -> v0)
$majorVersion = $Version -replace '(\d+)\..*', 'v$1'
Write-Host "🏷️  Actualizando tag mayor $majorVersion..." -ForegroundColor Cyan
git tag -fa $majorVersion -m "Update $majorVersion to $Version"

# 9. Push
Write-Host ""
Write-Host "🚀 Pusheando a origin..." -ForegroundColor Cyan
git push origin $currentBranch

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al pushear rama" -ForegroundColor Red
    exit 1
}

git push origin $Version

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al pushear tag $Version" -ForegroundColor Red
    exit 1
}

git push origin $majorVersion --force

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Advertencia: No se pudo pushear tag $majorVersion" -ForegroundColor Yellow
}

# 10. Éxito
Write-Host ""
Write-Host "✅ ¡Publicación exitosa!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Version: $Version" -ForegroundColor Cyan
Write-Host "🏷️  Tags pusheados: $Version, $majorVersion" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Puedes usar la action con:" -ForegroundColor Yellow
Write-Host "   uses: Matiduraan/PR-Checker@$Version" -ForegroundColor White
Write-Host "   uses: Matiduraan/PR-Checker@$majorVersion (auto-updates)" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Ver en GitHub:" -ForegroundColor Yellow
Write-Host "   https://github.com/Matiduraan/PR-Checker/releases" -ForegroundColor White
