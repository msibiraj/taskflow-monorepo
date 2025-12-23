# 📊 Analytics Integration - Complete Data Flow Guide

## 🎯 **Where Analytics Data Comes From**

Your analytics dashboard (`/analytics`) pulls data from **three sources**:

### **1. Task Time Tracking** (Cards)
- **Location**: Card details modal → Start/Stop timer
- **Storage**: Card object in MongoDB
- **Issue**: ❌ Data NOT sent to analytics endpoint

### **2. Browser Extension**
- **Location**: Chrome extension tracking websites
- **Endpoint**: `/api/activities` (POST)
- **Status**: ✅ Working

### **3. Desktop Agent**
- **Location**: Electron app tracking applications  
- **Endpoint**: `/api/activities` (POST)
- **Status**: ✅ Working

---

## 🐛 **Current Problem**

**When you start/stop timer on a card:**
1. ✅ Timer runs and shows elapsed time
2. ✅ Time is logged to card object
3. ❌ **Time NOT sent to analytics API**
4. ❌ **Analytics dashboard shows NO data**

**Result:** Analytics only shows browser/desktop tracking, NOT card time tracking!

---

## ✅ **Solution: Send Card Time to Analytics**

We need to modify the `handleStopTimer` function to ALSO send data to analytics endpoint.

### **File to Update:**
`packages/frontend/src/components/CardDetailsModal.jsx`

### **Add this after line 65:**

\`\`\`javascript
// AFTER updating the card, ALSO send to analytics
const activityData = {
  type: 'task',
  title: editedCard.title,
  taskId: editedCard._id,
  boardId: board._id,
  duration: hoursWorked * 3600, // Convert hours to seconds
  startTime: editedCard.timeTracking.timerStartedAt,
  endTime: end.toISOString(),
  category: 'productive' // Tasks are productive
};

// Send to analytics API
try {
  await api.post('/activities', activityData);
  console.log('✅ Activity logged to analytics');
} catch (error) {
  console.error('❌ Failed to log activity:', error);
}
\`\`\`

---

## 📝 **Complete Updated Code**

Replace the `handleStopTimer` function with this:

\`\`\`javascript
const handleStopTimer = async () => {
  if (editedCard.timeTracking?.timerStartedAt) {
    const start = new Date(editedCard.timeTracking.timerStartedAt);
    const end = new Date();
    const hoursWorked = (end - start) / 1000 / 60 / 60;
    
    const updatedCard = {
      ...editedCard,
      timeTracking: {
        ...editedCard.timeTracking,
        isTimerRunning: false,
        loggedHours: (editedCard.timeTracking?.loggedHours || 0) + hoursWorked,
        timerStartedAt: null,
        timerStartedBy: null,
        timeLogs: [
          ...(editedCard.timeTracking?.timeLogs || []),
          {
            user: user.id,
            hours: hoursWorked,
            description: 'Timer tracked',
            date: new Date(),
          },
        ],
      },
    };
    
    // Update card in database
    setEditedCard(updatedCard);
    onUpdate(updatedCard, listId);
    setElapsedTime(0);
    
    // 🆕 SEND TO ANALYTICS API
    try {
      await api.post('/activities', {
        type: 'task',
        title: editedCard.title,
        description: \`Worked on: \${editedCard.title}\`,
        taskId: editedCard._id,
        boardId: board._id,
        duration: Math.round(hoursWorked * 3600), // hours → seconds
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        category: 'productive',
        metadata: {
          listId: listId,
          boardName: board.name,
          cardTitle: editedCard.title
        }
      });
      console.log('✅ Task time logged to analytics');
    } catch (error) {
      console.error('❌ Failed to log to analytics:', error);
    }
  }
};
\`\`\`

---

## 🔧 **Backend API Endpoint Needed**

Make sure your backend has this route:

\`\`\`javascript
// packages/backend/src/routes/activities.js

router.post('/activities', authenticateToken, async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      taskId,
      boardId,
      duration,
      startTime,
      endTime,
      category,
      metadata
    } = req.body;
    
    const activity = new Activity({
      user: req.user.id,
      type,
      title,
      description,
      taskId,
      boardId,
      duration,
      startTime,
      endTime,
      category,
      metadata,
      createdAt: new Date()
    });
    
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
\`\`\`

---

## 📊 **Data Flow After Fix**

\`\`\`
User clicks "Start Timer" on Card
         ↓
Timer runs (shows elapsed time)
         ↓
User clicks "Stop Timer"
         ↓
    ┌─────────────────────────┐
    │   Two things happen:    │
    └─────────────────────────┘
            ↓           ↓
    Update Card     Send to Analytics API
    in MongoDB      (/api/activities)
         ↓                 ↓
    Card shows      Analytics Dashboard
    logged time     shows the activity
\`\`\`

---

## 🎯 **Analytics Dashboard Shows**

After this fix, analytics will display:

### **Task Time Tracking:**
- ✅ Tasks you worked on
- ✅ Time spent per task  
- ✅ Task titles and boards
- ✅ Productive time (green)

### **Website Tracking:**
- ✅ Websites visited (from extension)
- ✅ Time per website
- ✅ Categorized time

### **Application Tracking:**
- ✅ Desktop apps used (from agent)
- ✅ Time per application
- ✅ Application names

---

## 🚀 **Quick Fix Steps**

1. **Update CardDetailsModal.jsx** (add API call to handleStopTimer)
2. **Add `api` import** at top: `import api from '../services/api';`
3. **Make function async**: `const handleStopTimer = async () => {`
4. **Restart frontend**: `npm run dev`
5. **Test**: Start timer → Stop timer → Check analytics!

---

## 🧪 **Testing**

1. Open a card
2. Click "Start Timer"
3. Wait 10-30 seconds
4. Click "Stop Timer"
5. Go to `/analytics`
6. **Should see**: Task activity in "Time by Category" and total time!

---

## 💡 **Pro Tip**

You can also manually log time with the same endpoint:

\`\`\`javascript
await api.post('/activities', {
  type: 'task',
  title: 'Manual work entry',
  duration: 3600, // 1 hour in seconds
  startTime: new Date(Date.now() - 3600000).toISOString(),
  endTime: new Date().toISOString(),
  category: 'productive'
});
\`\`\`

---

## 📈 **Expected Analytics Output**

After working for 30 minutes on "Fix bugs" task:

**Analytics Dashboard Shows:**
- 📊 Total Time: 0h 30m
- 🟢 Productive: 0h 30m (100%)
- 📝 Recent Activities: "Fix bugs" - 30 minutes

---

**Apply this fix and your analytics will show complete data from all three sources!** 🎉
