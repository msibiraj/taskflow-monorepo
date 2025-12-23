# 🚀 TaskFlow Monorepo

> **Professional full-stack productivity & project management system**

A complete MERN stack application with real-time collaboration, time tracking, analytics dashboard, browser extension, and desktop agent - all professionally organized in a monorepo.

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📦 Packages

| Package | Description | Technology |
|---------|-------------|------------|
| **frontend** | React web application | React 18, Vite, Bootstrap 5 |
| **backend** | Express REST API | Node.js, Express, MongoDB, Socket.io |
| **browser-extension** | Activity tracker | Manifest V3, Chrome/Firefox |
| **desktop-agent** | Desktop app monitor | Electron, active-win |

---

## ✨ Features

### 🎯 **Core Features**
- ✅ Real-time collaborative Kanban boards
- ✅ Drag & drop task management  
- ✅ Team member management
- ✅ Time tracking with start/stop timers
- ✅ File attachments & comments
- ✅ Activity logs & notifications

### 📊 **Productivity Tracking**
- ✅ Website usage monitoring (browser extension)
- ✅ Application time tracking (desktop agent)
- ✅ Analytics dashboard with charts
- ✅ Productivity scores & insights
- ✅ Category-based time breakdown

### 🔐 **Security**
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Protected API routes
- ✅ CORS configuration

---

## 🚀 Quick Start

### **Prerequisites**

- Node.js v16 or higher
- MongoDB v4.4 or higher
- npm v8 or higher

### **Installation**

```bash
# Clone or extract the monorepo
cd taskflow-monorepo-professional

# Install all dependencies (this will check prerequisites first)
npm install

# Setup all packages
npm run setup

# Validate installation
npm run validate

# Start development servers
npm run dev
```

That's it! 🎉

---

## 📖 Detailed Setup

### **1. Backend Setup**

```bash
cd packages/backend

# Create environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Required environment variables:**
```env
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your-secret-key-change-this
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
# Start backend
npm run dev
```

### **2. Frontend Setup**

```bash
cd packages/frontend

# Create environment file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
EOF

# Start frontend
npm run dev
```

### **3. Browser Extension**

1. Open Chrome → `chrome://extensions/`
2. Enable **"Developer mode"** (top right)
3. Click **"Load unpacked"**
4. Select `packages/browser-extension` folder
5. Pin the extension and click to use

### **4. Desktop Agent (Optional)**

```bash
# Install system dependencies (Linux)
sudo apt-get install build-essential python3 libx11-dev libxtst-dev

# Install and start
cd packages/desktop-agent
npm install
npm start
```

---

## 🏗️ Architecture

```
taskflow-monorepo-professional/
│
├── packages/
│   ├── frontend/                # React Web Application
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── pages/          # Page-level components
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── BoardView.jsx
│   │   │   │   ├── Analytics.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── contexts/       # React Context providers
│   │   │   ├── services/       # API service layer
│   │   │   └── utils/          # Helper functions
│   │   ├── public/             # Static assets
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   └── package.json
│   │
│   ├── backend/                # Express API Server
│   │   ├── src/
│   │   │   ├── config/        # Configuration files
│   │   │   ├── controllers/   # Request handlers
│   │   │   ├── models/        # MongoDB schemas
│   │   │   ├── routes/        # API routes
│   │   │   ├── middleware/    # Express middleware
│   │   │   ├── services/      # Business logic
│   │   │   ├── utils/         # Utilities
│   │   │   └── server.js      # Main entry point
│   │   ├── tests/             # Test files
│   │   ├── .env.example
│   │   └── package.json
│   │
│   ├── browser-extension/     # Chrome/Firefox Extension
│   │   ├── scripts/
│   │   │   ├── background.js  # Background service worker
│   │   │   └── content.js     # Content script
│   │   ├── icons/             # Extension icons (16/48/128px)
│   │   ├── manifest.json      # Extension manifest
│   │   ├── popup.html         # Extension popup UI
│   │   └── popup.js           # Popup logic
│   │
│   └── desktop-agent/         # Electron Desktop App
│       ├── src/               # Source files
│       ├── assets/            # App assets
│       ├── main.js            # Electron main process
│       ├── tracker.js         # Activity tracker
│       ├── api-client.js      # API communication
│       └── package.json
│
├── scripts/                   # Build & utility scripts
│   ├── validate.js           # Structure validator
│   └── check-prerequisites.js # Prerequisites checker
│
├── docs/                      # Documentation
├── .github/                   # GitHub Actions CI/CD
├── package.json              # Root package.json (workspaces)
├── .gitignore
└── README.md                 # This file
```

---

## 🎯 Available Commands

### **Root Level**

```bash
npm install              # Install all dependencies
npm run setup            # Setup all packages
npm run validate         # Validate structure
npm run dev              # Start backend + frontend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run dev:agent        # Start desktop agent
npm run build:all        # Build all packages
npm run clean            # Clean node_modules
npm run reset            # Clean and reinstall
```

### **Individual Packages**

```bash
# Backend
cd packages/backend
npm run dev              # Development with nodemon
npm start                # Production start
npm test                 # Run tests

# Frontend
cd packages/frontend
npm run dev              # Vite dev server
npm run build            # Production build
npm run preview          # Preview production build

# Desktop Agent
cd packages/desktop-agent
npm start                # Start Electron app
npm run build            # Build distributables
npm run build:win        # Build for Windows
npm run build:mac        # Build for macOS
npm run build:linux      # Build for Linux
```

---

## 🌐 Access URLs

After starting all services:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Analytics Dashboard:** http://localhost:3000/analytics
- **API Documentation:** http://localhost:5000/api/health

---

## 🔧 Troubleshooting

### **"Module not found" errors**
```bash
npm run clean
npm install
npm run setup
```

### **Port already in use**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in backend/.env
```

### **MongoDB connection failed**
```bash
# Check MongoDB status
systemctl status mongodb

# Start MongoDB
sudo systemctl start mongodb

# Or use Docker
docker run -d -p 27017:27017 mongo:latest
```

### **Desktop agent build fails**
```bash
# Install build tools (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install build-essential python3 libx11-dev libxtst-dev libpng-dev

# Install build tools (macOS)
xcode-select --install
```

### **Extension not loading**
- Ensure all three icon files exist in `icons/` folder
- Check Chrome console for errors (`chrome://extensions/`)
- Try reloading the extension

---

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md) - Detailed setup instructions
- [API Documentation](docs/API.md) - REST API endpoints
- [Development Guide](docs/DEVELOPMENT.md) - Development workflow
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Test individual package
cd packages/backend
npm test
```

---

## 🚢 Deployment

### **Frontend (Vercel/Netlify)**
```bash
cd packages/frontend
npm run build
# Deploy dist/ folder
```

### **Backend (Heroku/Railway)**
```bash
cd packages/backend
# Set environment variables
# Deploy as Node.js app
```

### **Browser Extension (Chrome Web Store)**
```bash
cd packages/browser-extension
# Create ZIP file
zip -r extension.zip * -x "*.git*" "node_modules/*"
# Upload to Chrome Web Store
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- React team for amazing framework
- MongoDB for flexible database
- Electron for desktop capabilities
- All open-source contributors

---

## 📞 Support

- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/taskflow-monorepo/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/taskflow-monorepo/discussions)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ for learning and portfolio demonstration

</div>
