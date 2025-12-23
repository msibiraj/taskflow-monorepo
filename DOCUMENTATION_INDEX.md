# 📚 TaskFlow - Complete Documentation Index

Welcome to TaskFlow! This file helps you navigate all documentation.

---

## 🚀 **Quick Start (Start Here!)**

### **1. Basic Setup**
📖 **File:** `README.md`
- Installation instructions
- Prerequisites
- Running the application
- Basic usage

### **2. Category Setup (IMPORTANT!)**
📖 **File:** `QUICK_SETUP_CATEGORIES.md`
- **Must run:** `node seed-categories.js`
- Creates 14 default categories
- Without this, productivity tracking won't work!

---

## 🎨 **New Features**

### **Feature Documentation**
📖 **File:** `NEW_FEATURES_IMPLEMENTATION.md`

**What's New:**
1. **Rich Text Editor** - Jira-style Markdown editor for task descriptions
2. **Unified Tracking** - One button to control task timer + browser + desktop
3. **Idle Detection** - Auto-pause after 5 minutes of inactivity (admin configurable)
4. **Category Management UI** - Visual page to view all categories

**Integration:** Already integrated! Just use it.

---

## 🔧 **Troubleshooting**

### **Browser Extension Error**
📖 **File:** `EXTENSION_ERROR_FIX.md`

**Error:** "Extension context invalidated"
**Solution:** Refresh the page (F5)
**Fixed:** Extension now handles this gracefully

### **Desktop Agent GPU Error (Linux)**
📖 **File:** `GPU_ERROR_FIX.md`

**Error:** GPU/OpenGL warnings on Linux
**Solution:** Use `npm run start:safe` or disable GPU acceleration
**Already Fixed:** GPU disabled automatically on Linux

---

## 📊 **Analytics & Tracking**

### **Analytics Update Timing**
📖 **File:** `ANALYTICS_UPDATE_TIMING.md`

**When data appears:**
- Browser extension: Every 60 seconds
- Desktop agent: Every 30 seconds
- Task timers: Every 30 seconds
- **Must press F5** to see updates in analytics

### **Productivity Score**
📖 **File:** `PRODUCTIVITY_SCORE_EXPLAINED.md`

**Formula:** `(Productive Time / Total Time) × 100`

**Categories:**
- 🟢 Productive: GitHub, VS Code, docs → Increases score
- 🟡 Neutral: Email, Slack, calendar → No effect
- 🔴 Distracting: Social media, YouTube → Decreases score

---

## 📁 **Documentation Summary**

| File | Purpose | When to Read |
|------|---------|--------------|
| `README.md` | Main documentation | First! |
| `QUICK_SETUP_CATEGORIES.md` | Category setup | Before using analytics |
| `NEW_FEATURES_IMPLEMENTATION.md` | New features guide | Already integrated |
| `EXTENSION_ERROR_FIX.md` | Extension troubleshooting | If you see errors |
| `GPU_ERROR_FIX.md` | Linux GPU errors | If using Linux |
| `ANALYTICS_UPDATE_TIMING.md` | When data updates | Understanding analytics |
| `PRODUCTIVITY_SCORE_EXPLAINED.md` | How scores work | Understanding scores |

---

## 🎯 **Common Questions**

### **Q: Nothing shows in analytics?**
**A:** Run `node seed-categories.js` to create categories

### **Q: Extension shows "context invalidated" error?**
**A:** Just refresh the page (F5)

### **Q: When does analytics update?**
**A:** Every 30-60 seconds, but you must refresh the page

### **Q: How is productivity score calculated?**
**A:** Productive time divided by total time, times 100

### **Q: Can I change idle timeout?**
**A:** Only admins can change it (default: 5 minutes)

---

## 🏃 **Quick Setup Checklist**

```bash
# 1. Install dependencies
npm install

# 2. Start backend
cd packages/backend
npm run dev

# 3. Seed categories (IMPORTANT!)
cd packages/backend
node seed-categories.js

# 4. Start frontend (new terminal)
cd packages/frontend
npm run dev

# 5. Install browser extension
chrome://extensions/ → Load unpacked → packages/browser-extension

# 6. Run desktop agent (optional)
cd packages/desktop-agent
npm start

# 7. Open app
http://localhost:3000
```

---

## 📖 **Full Documentation Links**

### **Setup & Installation:**
- [Main README](README.md) - Complete setup guide
- [Category Setup](QUICK_SETUP_CATEGORIES.md) - Must-read for analytics

### **Features:**
- [New Features](NEW_FEATURES_IMPLEMENTATION.md) - Rich text, unified tracking, idle detection

### **Troubleshooting:**
- [Extension Errors](EXTENSION_ERROR_FIX.md) - Browser extension fixes
- [GPU Errors](GPU_ERROR_FIX.md) - Linux desktop agent fixes

### **Understanding:**
- [Analytics Timing](ANALYTICS_UPDATE_TIMING.md) - When data updates
- [Productivity Score](PRODUCTIVITY_SCORE_EXPLAINED.md) - How scores work

---

## ✅ **What's Already Integrated**

You don't need to integrate anything! These are already working:

✅ Rich Text Editor (in task cards)
✅ Unified Tracking (in task cards)
✅ Idle Detection (5 min default, admin-configurable)
✅ Category Management UI (/categories page)
✅ Browser Extension (fixed context error)
✅ Desktop Agent (GPU fix for Linux)

---

## 🎉 **Ready to Use!**

1. Follow Quick Setup Checklist above
2. Run `node seed-categories.js`
3. Start using TaskFlow!

For detailed info, check the specific documentation files listed above.

**Happy tracking!** 📊🚀
