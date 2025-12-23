# 🚀 Quick Setup - Enable Productivity Tracking

## ⚠️ **IMPORTANT: Categories Must Be Created!**

By default, TaskFlow **does NOT** have any categories. This means:
- ❌ All websites/apps count as "neutral"
- ❌ Productivity score will be 0% (unless using task timers)
- ❌ No automatic categorization

**To fix this, you MUST run the seed script!**

---

## ✅ **Step-by-Step Setup:**

### **Step 1: Start Backend**

```bash
cd packages/backend
npm run dev
```

Keep this running!

###  **Step 2: Run Seed Script (NEW TERMINAL)**

```bash
cd packages/backend
node seed-categories.js
```

**Expected output:**
```
✅ Connected to MongoDB
📦 Inserting 14 default categories...

✅ Successfully created default categories!

📊 Summary:
   🟢 Productive: 6 categories
   🟡 Neutral: 3 categories
   🔴 Distracting: 5 categories

📋 Categories created:
   🟢 Development (5 domains, 9 apps)
   🟢 Documentation (8 domains, 0 apps)
   🟢 Design & Creative (4 domains, 5 apps)
   🟢 Project Management (6 domains, 0 apps)
   🟢 Cloud & DevOps (6 domains, 6 apps)
   🟢 Learning (7 domains, 0 apps)
   🟡 Communication (4 domains, 7 apps)
   🟡 File Management (3 domains, 4 apps)
   🟡 System Tools (0 domains, 5 apps)
   🔴 Social Media (8 domains, 0 apps)
   🔴 Entertainment (7 domains, 4 apps)
   🔴 News & Media (7 domains, 0 apps)
   🔴 Shopping (6 domains, 0 apps)
   🔴 Gaming (4 domains, 4 apps)

🎉 Setup complete!
```

### **Step 3: Verify Categories Were Created**

```bash
# Connect to MongoDB
mongosh

# Switch to database
use taskflow

# Check categories
db.categories.find().pretty()

# Should show 14 categories
db.categories.countDocuments()
```

---

## 📊 **What Gets Created:**

### **🟢 Productive Categories (6):**

1. **Development**
   - Domains: github.com, gitlab.com, stackoverflow.com
   - Apps: VS Code, WebStorm, PyCharm, IntelliJ, Sublime Text

2. **Documentation**
   - Domains: docs.microsoft.com, developer.mozilla.org, reactjs.org
   - Apps: None

3. **Design & Creative**
   - Domains: figma.com, canva.com
   - Apps: Figma, Photoshop, Illustrator

4. **Project Management**
   - Domains: trello.com, asana.com, notion.so
   - Apps: None

5. **Cloud & DevOps**
   - Domains: AWS, Google Cloud, Azure consoles
   - Apps: Docker, Terminal, Postman

6. **Learning**
   - Domains: udemy.com, coursera.org, codecademy.com
   - Apps: None

### **🟡 Neutral Categories (3):**

7. **Communication**
   - Domains: gmail.com, outlook.com
   - Apps: Slack, Teams, Discord, Zoom

8. **File Management**
   - Domains: Google Drive, Dropbox, OneDrive
   - Apps: Finder, File Explorer

9. **System Tools**
   - Domains: None
   - Apps: Settings, System Preferences

### **🔴 Distracting Categories (5):**

10. **Social Media**
    - Domains: facebook.com, twitter.com, reddit.com, instagram.com
    - Apps: None

11. **Entertainment**
    - Domains: youtube.com, netflix.com, spotify.com
    - Apps: Spotify, iTunes, VLC

12. **News & Media**
    - Domains: cnn.com, nytimes.com, techcrunch.com
    - Apps: None

13. **Shopping**
    - Domains: amazon.com, ebay.com
    - Apps: None

14. **Gaming**
    - Domains: steampowered.com, epicgames.com
    - Apps: Steam, Epic Games, Minecraft

---

## 🧪 **Test It Works:**

### **Test 1: Browse GitHub**

```
1. Install browser extension
2. Login to extension
3. Visit github.com
4. Wait 65 seconds
5. Check Developer Console (F12)
   Should see: "Activity saved: 67abc..."
6. Refresh Analytics page
7. Should show: GitHub.com (Productive) ✅
```

### **Test 2: Desktop App**

```
1. Run desktop agent
2. Open VS Code
3. Wait 35 seconds
4. Check Analytics page
5. Should show: Visual Studio Code (Productive) ✅
```

### **Test 3: Check Productivity Score**

```
1. Do some productive work (GitHub, VS Code)
2. Do some browsing (Reddit, YouTube)
3. Refresh Analytics page
4. Productivity Score should be > 0% ✅
```

---

## ❌ **If Seed Script Fails:**

### **Error: "ECONNREFUSED"**

```bash
# MongoDB is not running
sudo systemctl start mongod

# Then run seed again
node seed-categories.js
```

### **Error: "Categories already exist"**

```bash
# Delete existing categories
mongosh

use taskflow
db.categories.deleteMany({})
exit

# Run seed again
node seed-categories.js
```

### **Error: "Cannot find module"**

```bash
# Install dependencies first
npm install

# Then run seed
node seed-categories.js
```

---

## 🎯 **After Setup:**

### **Your productivity tracking will now:**

✅ **Automatically categorize:**
- github.com → Productive
- reddit.com → Distracting
- VS Code → Productive
- YouTube → Distracting

✅ **Calculate productivity score:**
- Based on productive vs total time
- Visible in Analytics dashboard

✅ **Show detailed breakdown:**
- Top productive sites/apps
- Top distracting sites/apps
- Time spent in each category

---

## 📝 **Customize Categories:**

### **Add Your Own Site:**

```bash
# Add your company's domain as productive
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Company Work",
    "type": "productive",
    "domains": ["mycompany.com", "jira.mycompany.com"],
    "applications": []
  }'
```

### **Modify Existing Category:**

```bash
# Get category ID
mongosh
use taskflow
db.categories.find({ name: "Entertainment" })

# Update it
db.categories.updateOne(
  { name: "Entertainment" },
  { $addToSet: { domains: "mynewsite.com" } }
)
```

---

## ✅ **Checklist:**

- [ ] Backend running (`npm run dev`)
- [ ] MongoDB running (`sudo systemctl start mongod`)
- [ ] Seed script executed (`node seed-categories.js`)
- [ ] 14 categories created (verify in MongoDB)
- [ ] Browser extension installed & logged in
- [ ] Desktop agent running (optional)
- [ ] Test browsing GitHub → Shows as productive ✅
- [ ] Productivity score > 0% ✅

---

## 🎉 **You're Ready!**

Your productivity tracking is now fully configured! 

**Next steps:**
1. Browse some sites / use some apps
2. Wait for auto-sync (60s for browser, 30s for desktop)
3. Refresh Analytics page
4. See your productivity score! 📊

---

**Remember:** Without running `seed-categories.js`, everything will be "neutral" and your productivity score will be 0%!
