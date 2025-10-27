# Setup script for dating app backend
# Run this script in PowerShell from the backend directory

Write-Host "🚀 Setting up Dating App Backend..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "✅ Dependencies installed!" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure PostgreSQL is installed and running" -ForegroundColor White
Write-Host "2. Create the database:" -ForegroundColor White
Write-Host "   psql -U postgres" -ForegroundColor Gray
Write-Host "   CREATE DATABASE dating_app_db;" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Run the schema:" -ForegroundColor White
Write-Host "   psql -U postgres -d dating_app_db -f database/schema.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Create .env file:" -ForegroundColor White
Write-Host "   cp .env.example .env" -ForegroundColor Gray
Write-Host "   # Edit .env with your database credentials" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Start the server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
