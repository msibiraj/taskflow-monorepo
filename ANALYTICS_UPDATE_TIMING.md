# ⏱️ Analytics Update Timing - When Data Appears

## 📊 **How Often Analytics Updates:**

### **Browser Extension (Website Tracking):**

| Event | Update Timing | Details |
|-------|---------------|---------|
| Tab switch | **Immediately** | Saves previous site activity |
| Every minute | **60 seconds** | Auto-sync while on same site |
| Browser close | **Immediately** | Saves current activity |
| Idle (60s) | **After 60s idle** | Saves and pauses |

### **Task Timer (Frontend):**

| Event | Update Timing | Details |
|-------|---------------|---------|
| Every 30 seconds | **30 seconds** | While timer running |
| Stop timer | **Immediately** | Saves total time |
| Switch card | **Immediately** | Saves previous card |
| Browser close | **Immediately** | Uses sendBeacon API |

### **Desktop Agent:**

| Event | Update Timing | Details |
|-------|---------------|---------|
| App switch | **Immediately** | Saves previous app |
| Every 30 seconds | **30 seconds** | Auto-sync while using app |
| Agent close | **Immediately** | Saves current activity |

---

## ⏰ **Timeline Example:**

### **Scenario: Browsing Google for 2 minutes**

```
00:00 - Open google.com
        ✅ Extension starts tracking
        
00:60 - Still on google.com (1 minute passed)
        ✅ Auto-sync: Saves 60 seconds
        📊 Analytics shows: Google.com (1 min)
        
01:20 - Still on google.com
        ⏳ No update yet (waiting for next minute)
        
01:60 - Still on google.com (2 minutes total)
        ✅ Auto-sync: Updates to 120 seconds
        📊 Analytics shows: Google.com (2 min)
        
02:15 - Switch to github.com
        ✅ Immediate save: Google 135 seconds
        📊 Analytics shows: Google.com (2 min 15 sec)
```

---

## 🔄 **Analytics Dashboard Refresh:**

### **Auto-Refresh:**
- **Default:** Dashboard does NOT auto-refresh
- **Manual refresh:** Click browser refresh or reload page
- **Data is saved:** Just need to refresh to see it

### **To See Latest Data:**

**Option 1: Manual Refresh**
```
Press F5 or Ctrl+R
```

**Option 2: Auto-Refresh Feature** (Can be added)
```javascript
// Frontend can auto-refresh every 10 seconds
setInterval(() => {
  fetchAnalytics();
}, 10000);
```

---

## 📊 **Minimum Duration to Appear:**

### **Browser Extension:**
- **Minimum:** 10 seconds on a site
- **Reason:** Filters out accidental clicks
- **Code location:** `background.js` line 178

```javascript
if (duration >= 10) {  // Only saves if 10+ seconds
  saveActivity(activityUpdate);
}
```

### **Desktop Agent:**
- **Minimum:** 5 seconds in an app
- **Reason:** Avoids tracking quick switches
- **Code location:** `tracker.js` line 118

```javascript
if (duration >= 5) {  // Only saves if 5+ seconds
  this.saveActivity(this.currentActivity);
}
```

### **Task Timer:**
- **Minimum:** 5 seconds
- **Reason:** Meaningful work tracking

---

## 🧪 **Quick Test to Verify It's Working:**

### **Test 1: Browser Extension**

```
1. Open google.com
2. Wait 65 seconds (1 minute + 5 seconds buffer)
3. Open Developer Console (F12)
4. Look for: "Activity saved: 67abc123..."
5. Refresh Analytics page
6. Should see: Google.com activity
```

### **Test 2: Check Backend Logs**

```bash
# Terminal running backend should show:
📊 POST /api/activities received: {
  type: 'website',
  url: 'https://google.com',
  duration: 60,
  ...
}
✅ Activity saved: { _id: '67abc123...' }
```

### **Test 3: Check Database Directly**

```bash
# Connect to MongoDB
mongosh

# Switch to database
use taskflow

# Check recent activities
db.activities.find().sort({startTime: -1}).limit(5).pretty()

# Should show your recent browsing
```

---

## ⚡ **Real-Time Update Times:**

| Action | Backend Save | Analytics Visible |
|--------|--------------|-------------------|
| Switch tabs | < 1 second | After page refresh |
| 1 minute browsing | Exactly at 60s | After page refresh |
| Close browser | < 1 second | After page refresh |
| Stop task timer | < 1 second | After page refresh |
| Desktop app switch | < 1 second | After page refresh |

---

## 🎯 **Expected Behavior:**

### **Typical Usage Pattern:**

```
09:00 - Start work
        Open Chrome, browse reddit.com (5 min)
        
09:05 - Switch to work
        Open github.com (30 min)
        Click TaskFlow extension icon
        Shows: "Currently tracking: github.com"
        
09:35 - Check analytics
        Refresh Analytics page
        See:
          - Reddit.com: 5 minutes
          - GitHub.com: 30 minutes
        
09:45 - Continue work
        Still on github.com (10 more min)
        
09:46 - Auto-sync triggers (1 min interval)
        Updates github.com to 31 minutes
        
09:55 - Check analytics again
        Refresh page
        See: GitHub.com: 40 minutes
```

---

## 🔍 **Why You Might Not See Updates:**

### **Issue 1: Not Refreshing Page**
**Solution:** Press F5 to refresh analytics

### **Issue 2: Too Quick**
**Solution:** Stay on site for at least 10 seconds

### **Issue 3: Backend Not Running**
**Solution:** 
```bash
cd packages/backend
npm run dev
```

### **Issue 4: Extension Not Logged In**
**Solution:** Click extension icon → Login

### **Issue 5: Wrong Date Range**
**Solution:** Check date filter in analytics dashboard

---

## 📱 **Check Current Activity:**

### **Browser Extension:**
1. Click extension icon
2. Shows current site being tracked
3. Shows login status

### **Desktop Agent:**
1. Check system tray icon
2. Click → Shows current app
3. Dashboard shows stats

---

## 🚀 **Add Auto-Refresh to Analytics (Optional):**

If you want the analytics to update automatically without manual refresh:

**Edit:** `packages/frontend/src/pages/Analytics.jsx`

**Add this code:**
```javascript
// Add inside Analytics component
useEffect(() => {
  // Auto-refresh every 10 seconds
  const interval = setInterval(() => {
    fetchActivities(); // Your existing fetch function
  }, 10000);
  
  return () => clearInterval(interval);
}, []);
```

---

## ✅ **Summary:**

| Tracker | Save Interval | Minimum Duration | Auto-Refresh Dashboard |
|---------|---------------|------------------|----------------------|
| Browser | 60 seconds | 10 seconds | ❌ Manual (F5) |
| Desktop | 30 seconds | 5 seconds | ❌ Manual (F5) |
| Tasks | 30 seconds | 5 seconds | ❌ Manual (F5) |

**To see updates:** Just refresh the analytics page (F5)!

**Data is saved in real-time, but dashboard must be manually refreshed to display it.**

---

## 🎯 **Quick Answer:**

**Q: When will my website usage appear in analytics?**

**A:** 
1. **After 10 seconds** on a website (minimum)
2. **After 1 minute** auto-sync trigger
3. **When you refresh** the analytics page (F5)

**So:** Browse for 1+ minute → Press F5 on analytics page → See your data! ✅
