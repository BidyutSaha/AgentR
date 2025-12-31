# Quick Environment Setup Script
# This script helps you update your .env file with the database URL

Write-Host "=== Literature Review System - Environment Setup ===" -ForegroundColor Cyan
Write-Host ""

$envPath = ".env"
$envExamplePath = ".env.example"

# Check if .env exists
if (-not (Test-Path $envPath)) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item $envExamplePath $envPath
    Write-Host "✓ .env file created" -ForegroundColor Green
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Database Configuration ===" -ForegroundColor Cyan
Write-Host "Your Render PostgreSQL database URL has been added to .env.example" -ForegroundColor Green
Write-Host ""
Write-Host "Database Details:" -ForegroundColor Yellow
Write-Host "  Host: dpg-d58h10ali9vc73a2g3dg-a.singapore-postgres.render.com"
Write-Host "  Database: agent_r"
Write-Host "  Region: Singapore"
Write-Host ""

Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Generate JWT Secrets:" -ForegroundColor Yellow
Write-Host "   Run these commands and copy the output to your .env file:"
Write-Host ""
Write-Host "   node -e `"console.log(require('crypto').randomBytes(32).toString('hex'))`"" -ForegroundColor White
Write-Host ""
Write-Host "2. Setup Email (Gmail):" -ForegroundColor Yellow
Write-Host "   - Enable 2-Step Verification on your Google Account"
Write-Host "   - Create App Password: https://myaccount.google.com/apppasswords"
Write-Host "   - Add to .env: SMTP_USER and SMTP_PASSWORD"
Write-Host ""
Write-Host "3. Edit your .env file:" -ForegroundColor Yellow
Write-Host "   - Open: $envPath"
Write-Host "   - Update JWT secrets (from step 1)"
Write-Host "   - Update email settings (from step 2)"
Write-Host "   - Keep your existing OPENAI_API_KEY"
Write-Host ""
Write-Host "4. Test Database Connection:" -ForegroundColor Yellow
Write-Host "   npm install prisma @prisma/client"
Write-Host "   npx prisma generate"
Write-Host "   npx prisma migrate dev --name init"
Write-Host ""
Write-Host "=== Documentation ===" -ForegroundColor Cyan
Write-Host "For detailed setup instructions, see:" -ForegroundColor Yellow
Write-Host "  - documentation/ENV_SETUP.md"
Write-Host "  - documentation/QUICK_START.md"
Write-Host ""
Write-Host "=== Generate JWT Secrets Now ===" -ForegroundColor Cyan
Write-Host ""
$response = Read-Host "Generate JWT secrets now? (y/n)"

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "Generating JWT Access Secret..." -ForegroundColor Yellow
    $accessSecret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    Write-Host "JWT_ACCESS_SECRET=`"$accessSecret`"" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Generating JWT Refresh Secret..." -ForegroundColor Yellow
    $refreshSecret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    Write-Host "JWT_REFRESH_SECRET=`"$refreshSecret`"" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Copy these values to your .env file!" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "Setup complete! Edit your .env file to continue." -ForegroundColor Green
Write-Host ""
