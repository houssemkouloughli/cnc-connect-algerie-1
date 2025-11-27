#!/usr/bin/env pwsh
# ========================================
# Supabase Setup Automation Script
# ========================================
# This script automates the entire Supabase setup process

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 CNC Connect Algérie - Supabase Setup Automation" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Configuration
$supabaseProjectId = "jvmnfweammcentqnzage"
$supabaseUrl = "https://$supabaseProjectId.supabase.co"
$setupFilePath = "$PSScriptRoot\supabase\complete_setup_final.sql"

# Check if setup file exists
if (-not (Test-Path $setupFilePath)) {
    Write-Host "❌ ERROR: Setup file not found at $setupFilePath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Setup file found: complete_setup_final.sql" -ForegroundColor Green

# Read the setup file
Write-Host "`n📖 Reading setup script..." -ForegroundColor Yellow
$setupContent = Get-Content -Path $setupFilePath -Raw

Write-Host "✅ Setup script loaded ($(($setupContent | Measure-Object -Character).Characters) characters)" -ForegroundColor Green

# Display instructions
Write-Host "`n📋 INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "`n1. The setup script has been loaded and copied to clipboard" -ForegroundColor White
Write-Host "2. Go to: https://supabase.com/dashboard/project/$supabaseProjectId/sql" -ForegroundColor White
Write-Host "3. Paste the script (Ctrl+V)" -ForegroundColor White
Write-Host "4. Click RUN (green button)" -ForegroundColor White
Write-Host "5. Wait for completion (no errors = success)" -ForegroundColor White

# Copy to clipboard
Write-Host "`n📋 Copying setup script to clipboard..." -ForegroundColor Yellow
$setupContent | Set-Clipboard
Write-Host "✅ Script copied to clipboard!" -ForegroundColor Green

# Display summary
Write-Host "`n📊 SETUP SUMMARY:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✓ Cleans up old tables and functions" -ForegroundColor Green
Write-Host "✓ Creates 6 tables: profiles, partners, quotes, bids, orders, notifications" -ForegroundColor Green
Write-Host "✓ Creates 6 ENUM types" -ForegroundColor Green
Write-Host "✓ Creates 15+ indexes" -ForegroundColor Green
Write-Host "✓ Enables RLS on all tables" -ForegroundColor Green
Write-Host "✓ Inserts 3 sample partners" -ForegroundColor Green

# Next steps
Write-Host "`n🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "1. Open Supabase Dashboard in your browser" -ForegroundColor White
Write-Host "2. Paste the script and click RUN" -ForegroundColor White
Write-Host "3. After setup completes, configure .env.local:" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>" -ForegroundColor Gray
Write-Host "4. Run: npm run dev" -ForegroundColor White
Write-Host "5. Access: http://localhost:3000" -ForegroundColor White

Write-Host "`n✅ Setup preparation complete!" -ForegroundColor Green
Write-Host "The script is ready in your clipboard.`n" -ForegroundColor Cyan

# Ask if user wants to open browser
Write-Host "💡 Tip: You can paste the script now in Supabase SQL Editor" -ForegroundColor Yellow
Write-Host "Press any key to continue..." -ForegroundColor Yellow
[void][System.Console]::ReadKey($true)
