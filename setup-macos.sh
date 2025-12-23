#!/bin/bash

# TaskFlow - macOS Setup Script
# Automatically installs dependencies and sets up the project

echo "🍎 TaskFlow - macOS Setup"
echo "========================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📋 System Information:"
echo "   macOS: $(sw_vers -productVersion)"
echo "   Architecture: $(uname -m)"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ This script is for macOS only${NC}"
    echo "   Use setup-linux.sh for Linux"
    echo "   Use setup-windows.ps1 for Windows"
    exit 1
fi

# Check Homebrew
echo "🔍 Checking Homebrew..."
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}⚠️  Homebrew not found${NC}"
    echo ""
    read -p "Install Homebrew? (y/n): " INSTALL_BREW
    if [ "$INSTALL_BREW" = "y" ]; then
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    else
        echo "Homebrew is required for this script"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Homebrew installed${NC}"
fi

echo ""

# Check Xcode Command Line Tools
echo "🔍 Checking Xcode Command Line Tools..."
if ! xcode-select -p &> /dev/null; then
    echo -e "${YELLOW}⚠️  Xcode Command Line Tools not found${NC}"
    echo ""
    echo "Installing Xcode Command Line Tools..."
    xcode-select --install
    echo ""
    echo "⏳ Please complete the Xcode installation in the popup window"
    echo "   Press Enter when installation is complete..."
    read
else
    echo -e "${GREEN}✅ Xcode Command Line Tools installed${NC}"
fi

echo ""

# Check Node.js
echo "🔍 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found${NC}"
    echo ""
    read -p "Install Node.js via Homebrew? (y/n): " INSTALL_NODE
    if [ "$INSTALL_NODE" = "y" ]; then
        brew install node
    else
        echo "Please install Node.js manually"
        exit 1
    fi
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js $NODE_VERSION installed${NC}"
fi

echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found${NC}"
    echo "   Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing Node.js dependencies..."
echo ""
echo "   This may take a few minutes..."
echo ""

# Install npm dependencies
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Installation successful!${NC}"
    echo ""
    echo "📊 Installed packages:"
    echo "   Backend: $(cd packages/backend && npm list --depth=0 2>/dev/null | grep -c '─' || echo '0') packages"
    echo "   Frontend: $(cd packages/frontend && npm list --depth=0 2>/dev/null | grep -c '─' || echo '0') packages"
    echo "   Desktop Agent: $(cd packages/desktop-agent && npm list --depth=0 2>/dev/null | grep -c '─' || echo '0') packages"
    echo ""
    echo "⚠️  Desktop Agent Permissions:"
    echo "   The desktop agent needs Accessibility permissions to track windows."
    echo "   On first run, you'll see a prompt:"
    echo "   → Go to System Preferences → Security & Privacy → Privacy → Accessibility"
    echo "   → Check the box for 'TaskFlow Desktop Agent'"
    echo ""
    echo "🚀 Next steps:"
    echo ""
    echo "   1. Install MongoDB:"
    echo "      brew tap mongodb/brew"
    echo "      brew install mongodb-community"
    echo "      brew services start mongodb-community"
    echo ""
    echo "   2. Configure environment:"
    echo "      cp packages/backend/.env.example packages/backend/.env"
    echo "      nano packages/backend/.env"
    echo ""
    echo "   3. Start development:"
    echo "      npm run dev"
    echo ""
    echo "   Or start services individually:"
    echo "      cd packages/backend && npm run dev    # Terminal 1"
    echo "      cd packages/frontend && npm run dev   # Terminal 2"
    echo "      cd packages/desktop-agent && npm start # Terminal 3"
    echo ""
    echo -e "${GREEN}✨ Setup complete! Happy coding!${NC}"
else
    echo ""
    echo -e "${RED}❌ Installation failed${NC}"
    echo ""
    echo "Common issues:"
    echo "   1. Xcode Command Line Tools not installed"
    echo "   2. Permissions issues - try: sudo chown -R \$(whoami) ~/.npm"
    echo "   3. Folder name has spaces - rename without spaces"
    echo ""
    echo "For detailed troubleshooting, see:"
    echo "   CROSS_PLATFORM_INSTALL.md"
    exit 1
fi
