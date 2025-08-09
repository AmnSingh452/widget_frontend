Write-Host "Checking Jarvis Widget Deployment..." -ForegroundColor Green

# Check GitHub repository
Write-Host "1. Checking GitHub Repository..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "WARNING: Uncommitted changes found" -ForegroundColor Yellow
    git status --short
} else {
    Write-Host "OK: Local repository is clean" -ForegroundColor Green
}

# Check if latest commit is pushed
$localCommit = git rev-parse HEAD
$remoteCommit = git rev-parse origin/master
if ($localCommit -eq $remoteCommit) {
    Write-Host "OK: Latest commit is pushed to origin" -ForegroundColor Green
} else {
    Write-Host "WARNING: Local commits not pushed" -ForegroundColor Yellow
}

# Check live deployment
Write-Host "2. Checking Live Deployment..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://widget-frontend-6mo6.onrender.com/shopify_chatbot_widget.js" -Method HEAD
    if ($response.StatusCode -eq 200) {
        Write-Host "OK: Widget is live and accessible" -ForegroundColor Green
        Write-Host "File size: $($response.Headers['Content-Length']) bytes" -ForegroundColor Cyan
    }
} catch {
    Write-Host "ERROR: Widget deployment failed" -ForegroundColor Red
}

Write-Host "Deployment URLs:" -ForegroundColor Green
Write-Host "  Widget JS: https://widget-frontend-6mo6.onrender.com/shopify_chatbot_widget.js" -ForegroundColor Cyan
Write-Host "  Widget CSS: https://widget-frontend-6mo6.onrender.com/shopify_chatbot_widget.css" -ForegroundColor Cyan
Write-Host "Deployment check complete!" -ForegroundColor Green
