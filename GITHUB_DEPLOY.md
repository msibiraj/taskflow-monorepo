# 🚀 Deploy TaskFlow to GitHub

## Quick Setup (5 Minutes)

### **Option 1: Using GitHub Web Interface (Easiest)**

#### **Step 1: Create Repository on GitHub**

1. Go to https://github.com/new
2. Repository name: `taskflow-monorepo`
3. Description: `Full-stack MERN task management with analytics, browser extension, and desktop agent`
4. **Visibility:** 
   - ✅ Public (if you want to share)
   - ⚠️ Private (if keeping it personal)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

#### **Step 2: Push Your Code**

```bash
# Navigate to your project
cd ~/Downloads/taskflow-monorepo-professional

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: TaskFlow monorepo with analytics and tracking"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/taskflow-monorepo.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Done!** Your code is now on GitHub! 🎉

---

### **Option 2: Using GitHub Desktop (GUI)**

#### **Step 1: Install GitHub Desktop**
- Download: https://desktop.github.com/
- Install and sign in with GitHub account

#### **Step 2: Add Repository**
1. File → Add Local Repository
2. Choose: `~/Downloads/taskflow-monorepo-professional`
3. Click "Create a Repository"
4. Click "Publish Repository"
5. Choose name: `taskflow-monorepo`
6. Click "Publish"

**Done!** 🎉

---

### **Option 3: Using GitHub CLI (For Developers)**

```bash
# Install GitHub CLI
# Ubuntu/Debian:
sudo apt install gh

# Login
gh auth login

# Navigate to project
cd ~/Downloads/taskflow-monorepo-professional

# Create and push in one command
gh repo create taskflow-monorepo --public --source=. --push

# Or for private:
gh repo create taskflow-monorepo --private --source=. --push
```

**Done!** 🎉

---

## 📋 **Detailed Step-by-Step Guide**

### **Step 1: Prepare Your Project**

```bash
cd ~/Downloads/taskflow-monorepo-professional

# Check current status
pwd
# Should show: /home/sibiraj/Downloads/taskflow-monorepo-professional

# Remove any existing git (if needed)
rm -rf .git

# Initialize fresh git repository
git init
```

### **Step 2: Configure Git (First Time Only)**

```bash
# Set your name
git config --global user.name "Your Name"

# Set your email (use GitHub email)
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

### **Step 3: Review .gitignore**

The package already includes `.gitignore`:

```bash
# Check it exists
cat .gitignore

# Should include:
# node_modules/
# dist/
# build/
# .env
# *.log
```

**✅ Already configured!**

### **Step 4: Stage All Files**

```bash
# Add all files to staging
git add .

# Check what will be committed
git status

# Should show:
# new file: packages/backend/src/server.js
# new file: packages/frontend/src/App.jsx
# ... (many files)
```

### **Step 5: Create First Commit**

```bash
git commit -m "Initial commit: Complete TaskFlow monorepo

- MERN stack task management application
- Real-time collaboration with Socket.io
- Analytics dashboard with live tracking
- Browser extension for website tracking
- Electron desktop agent for app tracking
- JWT authentication
- MongoDB database
- Professional brutalist UI design"
```

### **Step 6: Create GitHub Repository**

**Go to:** https://github.com/new

**Fill in:**
- **Repository name:** `taskflow-monorepo`
- **Description:** `Full-stack productivity tracker with task management, analytics, browser extension, and desktop agent`
- **Public/Private:** Your choice
- **DO NOT check:**
  - ❌ Add README
  - ❌ Add .gitignore  
  - ❌ Add license

**Click:** "Create repository"

### **Step 7: Connect and Push**

GitHub will show you commands. Use these:

```bash
# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/taskflow-monorepo.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

### **Step 8: Verify Upload**

Go to: `https://github.com/YOUR_USERNAME/taskflow-monorepo`

You should see:
- ✅ All files uploaded
- ✅ README.md displayed
- ✅ Folder structure visible

---

## 🔑 **Authentication Options**

### **Option A: HTTPS (Recommended for beginners)**

Uses GitHub username and Personal Access Token (PAT).

**Create PAT:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Name: `taskflow-monorepo-access`
4. Scopes: Check `repo` (full control)
5. Click "Generate token"
6. **Copy token** (you won't see it again!)

**When pushing:**
```bash
git push -u origin main

# Username: your-github-username
# Password: paste-your-PAT-token-here
```

### **Option B: SSH (Recommended for frequent use)**

**Generate SSH key:**
```bash
# Generate key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Press Enter 3 times (default location, no passphrase)

# Copy public key
cat ~/.ssh/id_ed25519.pub
```

**Add to GitHub:**
1. GitHub → Settings → SSH and GPG keys
2. Click "New SSH key"
3. Title: `Linux Desktop`
4. Paste the key
5. Click "Add SSH key"

**Use SSH URL:**
```bash
git remote set-url origin git@github.com:YOUR_USERNAME/taskflow-monorepo.git
git push -u origin main
```

---

## 📝 **Create Great README on GitHub**

Add badges and description:

```bash
# Edit README
nano README.md
```

Add at the top:

```markdown
# 📊 TaskFlow - Complete Productivity Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://www.mongodb.com/)

> Full-stack MERN task management application with real-time analytics, browser extension, and desktop tracking agent.

![TaskFlow Screenshot](docs/screenshot.png)

## ✨ Features

- 🎯 **Kanban Boards** - Drag & drop task management
- ⏱️ **Time Tracking** - Built-in timer with live analytics
- 📊 **Analytics Dashboard** - Real-time productivity insights
- 🌐 **Browser Extension** - Track website usage automatically
- 💻 **Desktop Agent** - Monitor application usage
- 👥 **Team Collaboration** - Real-time updates with Socket.io
- 🔒 **Secure Authentication** - JWT-based auth system
- 🎨 **Beautiful UI** - Professional brutalist design

## 🚀 Quick Start

\`\`\`bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/taskflow-monorepo.git
cd taskflow-monorepo

# Install dependencies
npm install

# Start development servers
npm run dev

# Access at http://localhost:3000
\`\`\`

## 📦 Tech Stack

- **Frontend:** React, Vite, Socket.io Client
- **Backend:** Node.js, Express, MongoDB, Socket.io
- **Desktop:** Electron, active-win
- **Browser:** Chrome Extension (Manifest V3)
- **Authentication:** JWT, bcrypt

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

Created by [Your Name](https://github.com/YOUR_USERNAME)
```

Save and commit:
```bash
git add README.md
git commit -m "docs: Enhanced README with badges and features"
git push
```

---

## 🔒 **Protect Sensitive Files**

### **Verify .gitignore:**

```bash
# Check .gitignore includes:
cat .gitignore | grep -E "\.env|node_modules|\.log"

# Should show:
# .env
# .env.local
# node_modules/
# *.log
```

### **Check for secrets:**

```bash
# Search for sensitive data
grep -r "password\|secret\|token" packages/ --include="*.js" --include="*.json" | grep -v node_modules

# If you find real secrets, remove them!
```

### **Environment variables:**

Make sure `.env` files are NOT in git:

```bash
# Check
git status

# Should NOT show .env files
# Should show .env.example ✅
```

---

## 🌟 **Add GitHub Topics**

On your GitHub repository page:

1. Click "⚙️ Settings" (repository settings, not account)
2. Under "Topics", add:
   - `mern-stack`
   - `task-management`
   - `productivity`
   - `analytics`
   - `electron`
   - `chrome-extension`
   - `real-time`
   - `mongodb`
   - `react`
   - `nodejs`

---

## 📸 **Add Screenshots**

### **Create docs folder:**

```bash
mkdir -p docs
```

### **Add screenshots:**

1. Take screenshots of:
   - Dashboard
   - Board view
   - Analytics page
   - Desktop agent
   
2. Save as:
   - `docs/dashboard.png`
   - `docs/board.png`
   - `docs/analytics.png`
   - `docs/desktop-agent.png`

3. Commit:
```bash
git add docs/
git commit -m "docs: Add application screenshots"
git push
```

---

## 🤝 **Collaboration Setup**

### **Invite collaborators:**

1. Repository → Settings → Collaborators
2. Click "Add people"
3. Enter GitHub username or email
4. Send invitation

### **Branch protection:**

1. Settings → Branches → Add rule
2. Branch name: `main`
3. Check:
   - ✅ Require pull request before merging
   - ✅ Require status checks to pass

---

## 📊 **Add GitHub Actions (Optional)**

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd packages/backend
          npm install
          cd ../frontend
          npm install
      
      - name: Validate structure
        run: npm run validate
```

---

## 🎉 **Common Commands**

```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "feat: Add new feature"

# Push
git push

# Pull latest
git pull

# Create branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# View history
git log --oneline

# Clone on another machine
git clone https://github.com/YOUR_USERNAME/taskflow-monorepo.git
```

---

## 🐛 **Troubleshooting**

### **"Permission denied (publickey)"**

**Fix:**
```bash
# Use HTTPS instead
git remote set-url origin https://github.com/YOUR_USERNAME/taskflow-monorepo.git
```

### **"Large files detected"**

**Fix:**
```bash
# Remove node_modules if accidentally added
git rm -r --cached node_modules
git commit -m "fix: Remove node_modules"
git push
```

### **"Failed to push"**

**Fix:**
```bash
# Pull first
git pull origin main --rebase

# Then push
git push
```

---

## ✅ **Checklist**

Before pushing:

- [x] `.gitignore` includes node_modules, .env, dist
- [x] No `.env` files in git (only `.env.example`)
- [x] No `node_modules/` directories
- [x] README.md is complete
- [x] All sensitive data removed
- [x] Commit message is descriptive

After pushing:

- [ ] Repository is visible on GitHub
- [ ] README displays correctly
- [ ] All files uploaded
- [ ] Topics added
- [ ] Description added
- [ ] License chosen

---

## 🚀 **Quick Command Reference**

```bash
# FIRST TIME SETUP
cd ~/Downloads/taskflow-monorepo-professional
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/taskflow-monorepo.git
git push -u origin main

# DAILY WORKFLOW
git add .
git commit -m "your message"
git push

# CLONE ON NEW MACHINE
git clone https://github.com/YOUR_USERNAME/taskflow-monorepo.git
cd taskflow-monorepo
npm install
npm run dev
```

---

**That's it! Your TaskFlow project is now on GitHub!** 🎉

Share the link: `https://github.com/YOUR_USERNAME/taskflow-monorepo` 🌟
