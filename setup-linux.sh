#!/bin/bash

# TaskFlow - Linux Setup Script
# Automatically installs dependencies and sets up the project

echo "🐧 TaskFlow - Linux Setup"
echo "========================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Please don't run as root/sudo${NC}"
   echo "   Run as normal user: ./setup-linux.sh"
   exit 1
fi

echo "📋 System Information:"
echo "   OS: $(lsb_release -ds 2>/dev/null || cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "   Kernel: $(uname -r)"
echo "   Architecture: $(uname -m)"
echo ""

# Detect package manager
if command -v apt &> /dev/null; then
    PKG_MANAGER="apt"
    INSTALL_CMD="sudo apt install -y"
    UPDATE_CMD="sudo apt update"
elif command -v dnf &> /dev/null; then
    PKG_MANAGER="dnf"
    INSTALL_CMD="sudo dnf install -y"
    UPDATE_CMD="sudo dnf check-update"
elif command -v yum &> /dev/null; then
    PKG_MANAGER="yum"
    INSTALL_CMD="sudo yum install -y"
    UPDATE_CMD="sudo yum check-update"
elif command -v pacman &> /dev/null; then
    PKG_MANAGER="pacman"
    INSTALL_CMD="sudo pacman -S --noconfirm"
    UPDATE_CMD="sudo pacman -Sy"
else
    echo -e "${RED}❌ Unsupported package manager${NC}"
    echo "   Please install build-essential and python3 manually"
    exit 1
fi

echo -e "${GREEN}✅ Detected package manager: $PKG_MANAGER${NC}"
echo ""

# Check Node.js
echo "🔍 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js $NODE_VERSION installed${NC}"
else
    echo -e "${YELLOW}⚠️  Node.js not found${NC}"
    echo ""
    echo "Please install Node.js first:"
    echo "   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "   sudo apt install -y nodejs"
    echo ""
    read -p "Do you want me to install it? (y/n): " INSTALL_NODE
    if [ "$INSTALL_NODE" = "y" ]; then
        if [ "$PKG_MANAGER" = "apt" ]; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt install -y nodejs
        else
            echo "Please install Node.js manually for your distribution"
            exit 1
        fi
    else
        exit 1
    fi
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

echo ""
echo "📦 Installing system dependencies..."
echo ""

# Update package lists
echo "Updating package lists..."
$UPDATE_CMD

# Install build tools based on package manager
if [ "$PKG_MANAGER" = "apt" ]; then
    echo "Installing build-essential, python3..."
    $INSTALL_CMD build-essential python3 python3-dev
    
elif [ "$PKG_MANAGER" = "dnf" ] || [ "$PKG_MANAGER" = "yum" ]; then
    echo "Installing development tools, python3..."
    sudo $PKG_MANAGER groupinstall -y "Development Tools"
    $INSTALL_CMD python3 python3-devel
    
elif [ "$PKG_MANAGER" = "pacman" ]; then
    echo "Installing base-devel, python..."
    $INSTALL_CMD base-devel python
fi

echo ""
echo -e "${GREEN}✅ System dependencies installed${NC}"
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
    echo "   Backend: $(cd packages/backend && npm list --depth=0 2>/dev/null | grep -c '─'|| echo '0') packages"
    echo "   Frontend: $(cd packages/frontend && npm list --depth=0 2>/dev/null | grep -c '─' || echo '0') packages"
    echo "   Desktop Agent: $(cd packages/desktop-agent && npm list --depth=0 2>/dev/null | grep -c '─' || echo '0') packages"
    echo ""
    echo "🚀 Next steps:"
    echo ""
    echo "   1. Set up MongoDB:"
    echo "      sudo systemctl start mongod"
    echo "      sudo systemctl enable mongod"
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
    echo "   1. Folder name has spaces - rename without spaces"
    echo "   2. Missing build tools - install build-essential"
    echo "   3. Permission issues - check folder permissions"
    echo ""
    echo "For detailed troubleshooting, see:"
    echo "   CROSS_PLATFORM_INSTALL.md"
    echo "   INSTALLATION_FIX.md"
    exit 1
fi
