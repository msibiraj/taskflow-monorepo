# 📊 Productivity Score - How It's Calculated

## 🎯 **Quick Answer:**

**Productivity Score = (Productive Time / Total Time) × 100**

**Example:**
- Productive time: 6 hours
- Total time: 8 hours
- **Score: 75%** ✅

---

## 📈 **The Three Categories:**

### **1. Productive** 🟢
Activities that contribute to your work/goals

**Examples:**
- GitHub.com
- VS Code
- Documentation sites
- Work-related tasks
- Stack Overflow (problem solving)

### **2. Neutral** 🟡
Activities that are neither productive nor distracting

**Examples:**
- Email
- Calendar
- Messaging apps (Slack)
- File browsers
- System tools

### **3. Distracting** 🔴
Activities that take you away from work

**Examples:**
- Social media (Facebook, Twitter, Reddit)
- YouTube (entertainment)
- News sites
- Gaming sites
- Shopping sites

---

## 🔍 **How Activities Get Categorized:**

### **Method 1: Automatic (Browser Extension & Desktop Agent)**

When you browse a site or use an app, the system checks if a category rule exists:

```javascript
// Backend automatically categorizes based on domain/app name
// Examples:

GitHub.com → Checks database → Category: "Productive"
Reddit.com → Checks database → Category: "Distracting"
VS Code → Checks database → Category: "Productive"
```

**Location:** `packages/backend/src/server.js` lines 476-491

### **Method 2: Manual (Task Timers)**

When you work on a task, it's automatically marked as "productive":

```javascript
// All task timer activities are productive
{
  type: 'task',
  category: 'productive',  // ← Direct string assignment
  duration: 1800
}
```

**Location:** `packages/frontend/src/components/CardDetailsModal.jsx` line 41

---

## 🎯 **Productivity Score Calculation:**

### **Formula:**

```javascript
productivityScore = (productiveTime / totalTime) × 100

// Example:
// Productive: 360 minutes (6 hours)
// Neutral: 60 minutes (1 hour)
// Distracting: 180 minutes (3 hours)
// Total: 600 minutes (10 hours)

productivityScore = (360 / 600) × 100 = 60%
```

**Location:** `packages/frontend/src/pages/Analytics.jsx` lines 169-171

---

## 📊 **Real Example:**

### **Your Day:**

```
Morning (9am - 12pm):
  VS Code: 2 hours → Productive
  GitHub: 30 min → Productive
  Stack Overflow: 30 min → Productive
  Total: 3 hours productive

Lunch Break (12pm - 1pm):
  YouTube: 30 min → Distracting
  Reddit: 30 min → Distracting
  Total: 1 hour distracting

Afternoon (1pm - 5pm):
  VS Code: 2 hours → Productive
  Slack: 1 hour → Neutral
  Twitter: 1 hour → Distracting
  Total: 2 hours productive, 1 hour neutral, 1 hour distracting
```

### **Calculation:**

```
Productive: 3h + 2h = 5 hours = 300 minutes
Neutral: 1 hour = 60 minutes
Distracting: 1h + 1h = 2 hours = 120 minutes
Total: 8 hours = 480 minutes

Productivity Score = (300 / 480) × 100 = 62.5% ≈ 63%
```

---

## 🎨 **Visual Breakdown in Analytics:**

### **Category Bars:**

```
Productive    [████████████████████░░░░] 75%  (6h)
Neutral       [████░░░░░░░░░░░░░░░░░░░] 15%  (1.2h)
Distracting   [██░░░░░░░░░░░░░░░░░░░░░] 10%  (48m)
```

**Colors:**
- 🟢 Green = Productive
- 🟡 Yellow = Neutral
- 🔴 Pink/Red = Distracting

---

## 🔧 **How to Improve Your Score:**

### **Option 1: Add More Productive Sites**

Create categories for sites you use for work:

```bash
# Go to Analytics page
# Click "Manage Categories" (if available)
# Or add via API:

POST /api/categories
{
  "name": "Documentation",
  "type": "productive",
  "domains": ["docs.microsoft.com", "developer.mozilla.org"],
  "applications": []
}
```

### **Option 2: Categorize Uncategorized Activities**

Activities without categories count as "neutral". Categorize them!

### **Option 3: Use Task Timers**

Task timers are ALWAYS productive:

```
Click "Start Timer" on a task
→ 100% productive time ✅
```

---

## 📋 **Default Categories:**

**IMPORTANT:** Categories are **NOT** created automatically! 

You need to create them by running the seed script:

```bash
cd packages/backend
node seed-categories.js
```

This will create categories for:

### **Productive:**
- github.com, stackoverflow.com
- docs.* (documentation sites)
- localhost (development)
- VS Code, WebStorm (IDEs)

### **Neutral:**
- gmail.com, calendar.google.com
- slack.com
- File Explorer, Finder

### **Distracting:**
- facebook.com, twitter.com, reddit.com
- youtube.com (entertainment)
- instagram.com

**Without running the seed script, all activities will be marked as "neutral"!**

---

## 🛠️ **Creating Categories:**

### **Via Backend API:**

```bash
# Create a category
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Development",
    "type": "productive",
    "domains": ["github.com", "gitlab.com"],
    "applications": ["Visual Studio Code", "Code"]
  }'
```

### **Category Structure:**

```javascript
{
  name: "Development",           // Display name
  type: "productive",            // productive | neutral | distracting
  domains: [                     // Website domains
    "github.com",
    "stackoverflow.com"
  ],
  applications: [                // Desktop app names
    "Visual Studio Code",
    "WebStorm"
  ]
}
```

---

## 🎯 **What Counts Toward Score:**

| Activity | Category | Counts? |
|----------|----------|---------|
| Task timer | Always "productive" | ✅ Yes |
| GitHub.com (with category) | Productive | ✅ Yes |
| Reddit.com (with category) | Distracting | ✅ Yes (negatively) |
| VS Code (with category) | Productive | ✅ Yes |
| Unknown site (no category) | Neutral | ⚠️ Yes (neutral) |
| Email (with category) | Neutral | ⚠️ Yes (neutral) |

---

## 📊 **Score Interpretation:**

| Score | Rating | What It Means |
|-------|--------|---------------|
| 90-100% | 🟢 Excellent | Highly focused, minimal distractions |
| 70-89% | 🟢 Good | Productive with some breaks |
| 50-69% | 🟡 Average | Equal work and distractions |
| 30-49% | 🟠 Below Average | More distracted than productive |
| 0-29% | 🔴 Poor | Mostly distractions |

---

## 🔍 **Check Your Current Score:**

### **Step 1: Open Analytics**
```
http://localhost:3000/analytics
```

### **Step 2: Look for Big Number**
```
Productivity Score
      75%          ← This is your score!
```

### **Step 3: Check Breakdown**
```
Productive:    6h 30m  (75%)
Neutral:       1h 15m  (15%)
Distracting:   45m     (10%)
```

---

## 🚀 **Quick Tips:**

### **To Increase Score:**

1. **Use task timers** → Always productive ✅
2. **Categorize work sites** → Mark as productive
3. **Block distracting sites** → Or mark them honestly
4. **Review uncategorized** → Assign proper categories

### **To Get Accurate Score:**

1. **Create categories** for your common sites/apps
2. **Be honest** about what's productive for YOU
3. **Review weekly** and adjust categories
4. **Don't game the system** → It's for YOUR benefit!

---

## 💡 **Pro Tips:**

### **Custom Categories:**

Your "productive" might be different:

**For a YouTuber:**
- YouTube Studio → Productive ✅
- Premiere Pro → Productive ✅
- Twitter (marketing) → Productive ✅

**For a Researcher:**
- Academic journals → Productive ✅
- Google Scholar → Productive ✅
- Reddit (research) → Neutral ⚠️

**Customize categories to match YOUR work!**

---

## 📝 **Summary:**

**Productivity Score Formula:**
```
Score = (Productive Time ÷ Total Time) × 100
```

**Three Categories:**
- 🟢 Productive → Increases score
- 🟡 Neutral → No effect on score numerator
- 🔴 Distracting → Decreases score

**Task Timers:**
- Always count as 100% productive ✅

**Website/App Tracking:**
- Requires categories to be created
- Auto-matches based on domain/app name
- Uncategorized = neutral

**To improve score:**
- Create productive categories
- Use task timers
- Minimize distracting sites

---

**Your productivity score is based on how much productive time you have compared to total tracked time!** 📊
