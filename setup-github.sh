#!/bin/bash

# TaskFlow - Automated GitHub Setup
# Run this script to push your project to GitHub

echo "🚀 TaskFlow GitHub Setup"
echo "======================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed!"
    echo "Install with: sudo apt install git"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Username cannot be empty!"
    exit 1
fi

# Get repository name
read -p "Enter repository name (default: taskflow-monorepo): " REPO_NAME
REPO_NAME=${REPO_NAME:-taskflow-monorepo}

echo ""
echo "📝 Configuration:"
echo "   Username: $GITHUB_USERNAME"
echo "   Repository: $REPO_NAME"
echo ""

# Confirm
read -p "Is this correct? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "🔧 Setting up Git..."

# Configure git (if not already configured)
if [ -z "$(git config --global user.name)" ]; then
    read -p "Enter your name for Git commits: " GIT_NAME
    git config --global user.name "$GIT_NAME"
fi

if [ -z "$(git config --global user.email)" ]; then
    read -p "Enter your email for Git commits: " GIT_EMAIL
    git config --global user.email "$GIT_EMAIL"
fi

echo "✅ Git configured"
echo ""

# Remove existing git if present
if [ -d ".git" ]; then
    echo "⚠️  Existing .git folder found"
    read -p "Remove and reinitialize? (y/n): " REMOVE_GIT
    if [ "$REMOVE_GIT" = "y" ]; then
        rm -rf .git
        echo "✅ Removed existing .git"
    fi
fi

# Initialize git
if [ ! -d ".git" ]; then
    echo "🔧 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
fi

echo ""
echo "📦 Adding files..."
git add .

echo ""
echo "💾 Creating commit..."
git commit -m "Initial commit: Complete TaskFlow monorepo

- MERN stack task management application
- Real-time collaboration with Socket.io
- Analytics dashboard with live tracking  
- Browser extension for website tracking
- Electron desktop agent for app tracking
- JWT authentication
- MongoDB database
- Professional brutalist UI design"

echo "✅ Commit created"
echo ""

# Add remote
REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

if git remote | grep -q origin; then
    echo "⚠️  Remote 'origin' already exists"
    git remote set-url origin "$REPO_URL"
    echo "✅ Updated remote URL"
else
    git remote add origin "$REPO_URL"
    echo "✅ Added remote: $REPO_URL"
fi

echo ""
echo "🚀 Ready to push!"
echo ""
echo "⚠️  IMPORTANT:"
echo "   1. Create the repository on GitHub first:"
echo "      https://github.com/new"
echo "   2. Name it: $REPO_NAME"
echo "   3. DO NOT initialize with README, .gitignore, or license"
echo ""

read -p "Have you created the repository on GitHub? (y/n): " CREATED

if [ "$CREATED" != "y" ]; then
    echo ""
    echo "📝 Please create the repository on GitHub:"
    echo "   1. Go to: https://github.com/new"
    echo "   2. Repository name: $REPO_NAME"
    echo "   3. Click 'Create repository'"
    echo ""
    echo "Then run this script again or manually run:"
    echo "   git push -u origin main"
    exit 0
fi

echo ""
echo "🚀 Pushing to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Your project is now on GitHub!"
    echo ""
    echo "🌟 View at: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Add a description on GitHub"
    echo "   2. Add topics: mern-stack, task-management, productivity"
    echo "   3. Add screenshots in docs/ folder"
    echo "   4. Share your repository!"
else
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "Common issues:"
    echo "   1. Repository doesn't exist on GitHub"
    echo "   2. Authentication failed (need to set up PAT or SSH)"
    echo "   3. Network issues"
    echo ""
    echo "📝 Manual commands:"
    echo "   git remote -v"
    echo "   git push -u origin main"
    echo ""
    echo "See GITHUB_DEPLOY.md for detailed help"
fi
