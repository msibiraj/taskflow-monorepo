# TaskFlow - Windows Setup Script
# Run in PowerShell as Administrator

Write-Host "🪟 TaskFlow - Windows Setup" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ Please run PowerShell as Administrator" -ForegroundColor Red
    Write-Host "   Right-click PowerShell → Run as Administrator" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "📋 System Information:" -ForegroundColor White
Write-Host "   Windows: $([System.Environment]::OSVersion.Version)" -ForegroundColor Gray
Write-Host "   Architecture: $env:PROCESSOR_ARCHITECTURE" -ForegroundColor Gray
Write-Host ""

# Check Node.js
Write-Host "🔍 Checking Node.js..." -ForegroundColor White
$nodeVersion = $null
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Node.js not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please install Node.js:" -ForegroundColor Yellow
    Write-Host "   1. Download from: https://nodejs.org/" -ForegroundColor White
    Write-Host "   2. Install LTS version (20.x)" -ForegroundColor White
    Write-Host "   3. Restart PowerShell" -ForegroundColor White
    Write-Host "   4. Run this script again" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check npm
Write-Host "🔍 Checking npm..." -ForegroundColor White
try {
    $npmVersion = npm -v
    Write-Host "✅ npm $npmVersion installed" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check Python
Write-Host "🔍 Checking Python..." -ForegroundColor White
$pythonVersion = $null
try {
    $pythonVersion = python --version
    Write-Host "✅ Python installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Python not found" -ForegroundColor Yellow
    Write-Host ""
    $installPython = Read-Host "Install Python 3? (y/n)"
    if ($installPython -eq 'y') {
        Write-Host "Downloading Python installer..." -ForegroundColor White
        $pythonUrl = "https://www.python.org/ftp/python/3.11.0/python-3.11.0-amd64.exe"
        $pythonInstaller = "$env:TEMP\python-installer.exe"
        Invoke-WebRequest -Uri $pythonUrl -OutFile $pythonInstaller
        Start-Process -FilePath $pythonInstaller -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait
        Remove-Item $pythonInstaller
        Write-Host "✅ Python installed" -ForegroundColor Green
    }
}

Write-Host ""

# Check Visual Studio Build Tools
Write-Host "🔍 Checking Visual Studio Build Tools..." -ForegroundColor White
$vsBuildTools = Get-Command cl.exe -ErrorAction SilentlyContinue

if (-not $vsBuildTools) {
    Write-Host "⚠️  Visual Studio Build Tools not found" -ForegroundColor Yellow
    Write-Host ""
    $installBuildTools = Read-Host "Install windows-build-tools? (y/n)"
    
    if ($installBuildTools -eq 'y') {
        Write-Host "Installing windows-build-tools (this may take 10-15 minutes)..." -ForegroundColor White
        npm install --global --production windows-build-tools
        Write-Host "✅ Build tools installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: Native modules may fail to build" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Visual Studio Build Tools found" -ForegroundColor Green
}

Write-Host ""

# Check if in correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found" -ForegroundColor Red
    Write-Host "   Please run this script from the project root directory" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor White
Write-Host ""
Write-Host "   This may take a few minutes..." -ForegroundColor Gray
Write-Host ""

# Install npm dependencies
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Installation successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Installed packages:" -ForegroundColor White
    
    # Count packages (simplified for Windows)
    Write-Host "   All dependencies installed successfully" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "🚀 Next steps:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   1. Install MongoDB:" -ForegroundColor White
    Write-Host "      Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Gray
    Write-Host "      Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Configure environment:" -ForegroundColor White
    Write-Host "      copy packages\backend\.env.example packages\backend\.env" -ForegroundColor Gray
    Write-Host "      notepad packages\backend\.env" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Start development:" -ForegroundColor White
    Write-Host "      npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Or start services individually (in separate PowerShell windows):" -ForegroundColor White
    Write-Host "      cd packages\backend && npm run dev    # Window 1" -ForegroundColor Gray
    Write-Host "      cd packages\frontend && npm run dev   # Window 2" -ForegroundColor Gray
    Write-Host "      cd packages\desktop-agent && npm start # Window 3" -ForegroundColor Gray
    Write-Host ""
    Write-Host "✨ Setup complete! Happy coding!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Installation failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "   1. Not running as Administrator" -ForegroundColor White
    Write-Host "   2. Build tools not installed - install windows-build-tools" -ForegroundColor White
    Write-Host "   3. Folder path has spaces - rename without spaces" -ForegroundColor White
    Write-Host "   4. Antivirus blocking npm - add exclusion" -ForegroundColor White
    Write-Host ""
    Write-Host "For detailed troubleshooting, see:" -ForegroundColor Yellow
    Write-Host "   CROSS_PLATFORM_INSTALL.md" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Read-Host "Press Enter to exit"
