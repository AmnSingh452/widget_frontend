# Quick Deployment Check Script
# Run this after pushing changes to verify deployment

Write-Host "Checking Jarvis Widget Deployment..." -ForegroundColor Green

# Check GitHub repository
Write-Host "`n1. Checking GitHub Repository..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "WARNING: Uncommitted changes found:" -ForegroundColor Yellow
    git status --short
    Write-Host "`nRun: git checkout main && git merge master && git push origin main" -ForegroundColor Cyan
} else {
    Write-Host "OK: Local repository is clean" -ForegroundColor Green
}

# Check if latest commit is pushed to main branch (used by Render)
$localCommit = git rev-parse HEAD
$remoteMainCommit = git rev-parse origin/main
if ($localCommit -eq $remoteMainCommit) {
    Write-Host "✅ Latest commit is pushed to origin/main (deployed)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Local commits not in main branch. Run: git push origin main" -ForegroundColor Yellow
}

# Check live deployment
Write-Host "`n2. Checking Live Deployment..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://widget-frontend-6mo6.onrender.com/shopify_chatbot_widget.js" -Method HEAD
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Widget is live and accessible" -ForegroundColor Green
        $size = $response.Headers["Content-Length"]
        $lastModified = $response.Headers["Last-Modified"]
        Write-Host "File size: $size bytes" -ForegroundColor Cyan
        Write-Host "Last updated: $lastModified" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Widget deployment failed or not accessible" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Check API endpoints
Write-Host "`n3. Checking API Connectivity..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "https://jarvis2-0-djg1.onrender.com/api/widget-settings?shop=test-store.myshopify.com" -Method GET
    if ($apiResponse.StatusCode -eq 200) {
        Write-Host "✅ Jarvis API is responding" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  API connectivity issue (expected for test shop)" -ForegroundColor Yellow
}

Write-Host "`n🎯 Deployment URLs:" -ForegroundColor Green
Write-Host "   Widget JS: https://widget-frontend-6mo6.onrender.com/shopify_chatbot_widget.js" -ForegroundColor Cyan
Write-Host "   Widget CSS: https://widget-frontend-6mo6.onrender.com/shopify_chatbot_widget.css" -ForegroundColor Cyan
Write-Host "   Test Page: https://widget-frontend-6mo6.onrender.com/test_deployment.html" -ForegroundColor Cyan

Write-Host "`n✅ Deployment check complete!" -ForegroundColor Green
