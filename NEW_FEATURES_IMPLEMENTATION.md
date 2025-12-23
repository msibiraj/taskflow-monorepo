# 🚀 New Features Implementation Guide

## ✨ **4 New Features Added:**

1. **Rich Text Editor** (Jira-style markdown editor)
2. **Unified Start/Stop Tracking** (Controls browser extension + desktop agent from task card)
3. **Idle Detection** (Auto-pause after 5 minutes of inactivity, admin-configurable)
4. **Category Management UI** (View productive/neutral/distracting categories)

---

## 📦 **Files Created:**

### **1. Rich Text Editor Component**
- `packages/frontend/src/components/RichTextEditor.jsx`
- `packages/frontend/src/components/RichTextEditor.css`

### **2. Unified Tracking with Idle Detection**
- `packages/frontend/src/components/UnifiedTracking.jsx`
- `packages/frontend/src/components/UnifiedTracking.css`
- `packages/frontend/src/hooks/useIdleDetection.js`

### **3. Category Management Page**
- `packages/frontend/src/pages/CategoryManagement.jsx`
- `packages/frontend/src/pages/CategoryManagement.css`

---

## 🆕 **IDLE DETECTION FEATURE:**

### **Default Settings:**
- **Idle Timeout:** 5 minutes (300,000 ms)
- **Auto-pause:** Tracking pauses after 5 minutes of no mouse/keyboard activity
- **Auto-resume:** Tracking resumes when user moves mouse or presses any key
- **Configuration:** Only admins can change timeout setting

### **How It Works:**
```
User working on task (tracking active)
   ↓
No mouse/keyboard for 5 minutes
   ↓
System detects idle
   ↓
Pauses: Task timer + Browser extension + Desktop agent
   ↓
Shows idle overlay with timer
   ↓
User moves mouse or presses key
   ↓
Automatically resumes tracking
   ↓
Idle time is NOT counted in total
```

### **Admin Controls:**
Only users with `role: 'admin'` can:
- Change idle timeout (30s, 1min, 2min, 5min, 10min, 15min, or Never)
- Access settings via gear icon in tracking section
- Settings are saved per-user in localStorage

### **User Experience:**
```
Non-Admin Users:
  • See: "Auto-pause after 5 minutes of inactivity"
  • See: "(Contact admin to change)"
  • Cannot access settings

Admin Users:
  • See gear icon for settings
  • Can change timeout
  • Changes apply immediately
  • Setting persists across sessions
```

---

## 🔧 **How to Integrate:**

### **Step 1: Add Rich Text Editor to Card Details**

**Edit:** `packages/frontend/src/components/CardDetailsModal.jsx`

**Find this (around line 302-311):**
```jsx
{/* Description */}
<div className="mb-3">
  <label className="form-label">Description</label>
  <textarea
    className="form-control form-control-custom"
    rows="3"
    value={editedCard.description || ''}
    onChange={(e) => handleUpdateBasicInfo('description', e.target.value)}
  ></textarea>
</div>
```

**Replace with:**
```jsx
{/* Description with Rich Text Editor */}
<div className="mb-3">
  <label className="form-label">Description</label>
  <RichTextEditor 
    value={editedCard.description || ''}
    onChange={(value) => handleUpdateBasicInfo('description', value)}
    placeholder="Add a detailed description... Supports Markdown!"
  />
</div>
```

**Add import at top of file (around line 3):**
```jsx
import RichTextEditor from './RichTextEditor';
```

---

### **Step 2: Add Unified Tracking with Idle Detection**

**Edit:** `packages/frontend/src/components/CardDetailsModal.jsx`

**Add import at top:**
```jsx
import UnifiedTracking from './UnifiedTracking';
```

**Add in the modal body (in the timer section, around line 360-400):**
```jsx
{/* Unified Tracking with Idle Detection */}
<UnifiedTracking 
  task={editedCard}
  onTrackingChange={(isTracking) => {
    console.log('Tracking state changed:', isTracking);
  }}
/>
```

**That's it!** The component handles everything:
- Start/Stop button
- Task timer integration
- Browser extension control
- Desktop agent control  
- Idle detection (5 min default)
- Admin settings
- Auto-save every 30 seconds

---

### **Step 3: Add Category Management to Navigation**

**Edit:** `packages/frontend/src/App.jsx`

**Add import:**
```jsx
import CategoryManagement from './pages/CategoryManagement';
```

**Add route (in your routes section):**
```jsx
<Route path="/categories" element={<CategoryManagement />} />
```

**Edit:** `packages/frontend/src/components/Navbar.jsx` (or wherever your navigation is)

**Add link:**
```jsx
<Nav.Link as={Link} to="/categories">
  <i className="bi bi-tags me-2"></i>
  Categories
</Nav.Link>
```

---

## 🎨 **Rich Text Editor Features:**

### **Markdown Support:**
- **Bold:** `**text**` or click Bold button
- **Italic:** `*text*` or click Italic button
- **Heading:** `## text` or click H2 button
- **Code:** `` `code` `` or click Code button
- **Code Block:** ` ```code``` ` or click Code Block button
- **Link:** `[text](url)` or click Link button
- **Bullet List:** `- item` or click Bullet button
- **Numbered List:** `1. item` or click Number button
- **Task List:** `- [ ] task` or click Task button
- **Quote:** `> text` or click Quote button
- **Horizontal Rule:** `---` or click HR button

### **Preview Mode:**
- Click "Preview" to see formatted output
- Click "Edit" to return to editing
- Supports all standard Markdown syntax

---

## 📊 **Category Management Page:**

### **Features:**
1. **Summary Cards** - Shows count of each category type
2. **Filterable Tabs** - Filter by All/Productive/Neutral/Distracting
3. **Category Cards** - Visual display of all categories
4. **Domain/App Lists** - Shows what's included in each category
5. **Information Panel** - Explains how categories work

### **What Users See:**

```
📊 Category Management
Manage how activities are categorized for productivity tracking

[🟢 6 Productive] [🟡 3 Neutral] [🔴 5 Distracting]

Tabs: [All (14)] [🟢 Productive (6)] [🟡 Neutral (3)] [🔴 Distracting (5)]

Cards showing:
- Development (github.com, VS Code, etc.)
- Social Media (facebook.com, twitter.com, etc.)
- Communication (gmail.com, Slack, etc.)
- ...
```

---

## 🔄 **Unified Tracking Flow:**

### **When User Clicks "Start Tracking Everything":**

```
1. Starts task timer
   ↓
2. Sends message to browser extension
   → Extension starts tracking with task context
   → All websites tagged with taskId
   ↓
3. Sends message to desktop agent (via backend)
   → Desktop agent starts tracking with task context
   → All applications tagged with taskId
   ↓
4. Button changes to "Stop All Tracking"
```

### **When User Clicks "Stop All Tracking":**

```
1. Stops task timer
   → Saves final time to task
   ↓
2. Sends stop message to browser extension
   → Extension resumes normal tracking
   ↓
3. Sends stop message to desktop agent
   → Agent resumes normal tracking
   ↓
4. Button changes back to "Start Tracking Everything"
```

---

## 🎯 **User Benefits:**

### **Before (Current System):**
```
User has to:
1. Manually start task timer
2. Browser extension tracks independently
3. Desktop agent tracks independently
4. No connection between task and activities
```

### **After (New System):**
```
User clicks one button:
1. Everything starts tracking
2. All activities linked to task
3. Can see: "Worked on Bug Fix for 2 hours"
   - Visited: stackoverflow.com (30 min)
   - Used: VS Code (1.5 hours)
   - Task timer: 2 hours
4. One button to stop everything
```

---

## 📝 **Backend Changes Needed (Optional):**

To fully support unified tracking, add these endpoints:

**File:** `packages/backend/src/server.js`

```javascript
// Start unified tracking
app.post('/api/tracking/start', authenticateToken, async (req, res) => {
  const { taskId, taskTitle } = req.body;
  
  // Broadcast to desktop agent via Socket.IO
  io.to(req.user.id).emit('start-task-tracking', {
    taskId,
    taskTitle
  });
  
  res.json({ success: true });
});

// Stop unified tracking
app.post('/api/tracking/stop', authenticateToken, async (req, res) => {
  const { taskId } = req.body;
  
  // Broadcast to desktop agent via Socket.IO
  io.to(req.user.id).emit('stop-task-tracking', {
    taskId
  });
  
  res.json({ success: true });
});
```

---

## 🧪 **Testing:**

### **Test Rich Text Editor:**
```
1. Open any task card
2. Click in description field
3. Use toolbar buttons to format text
4. Click "Preview" to see formatted output
5. Save card
6. Reopen card - formatting should be preserved
```

### **Test Category Management:**
```
1. Navigate to /categories
2. Should see 14 default categories (if seeded)
3. Click tabs to filter
4. See domains and applications for each
```

### **Test Unified Tracking:**
```
1. Open task card
2. Click "Start Tracking Everything"
3. Button should turn red "Stop All Tracking"
4. Browse websites / use apps
5. Click "Stop All Tracking"
6. Check analytics - should show task + websites + apps
```

---

## ⚠️ **Important Notes:**

1. **Rich Text Editor** works standalone - integrate it first
2. **Category Management** requires seed script to be run
3. **Unified Tracking** requires backend Socket.IO setup
4. All features are **optional** - you can implement one at a time

---

## 🚀 **Quick Implementation:**

### **Just Want Rich Text Editor?**
1. Copy RichTextEditor.jsx and .css to components
2. Update CardDetailsModal as shown in Step 1
3. Done! ✅

### **Just Want Category UI?**
1. Copy CategoryManagement files to pages
2. Add route to App.jsx
3. Add navigation link
4. Run seed script
5. Done! ✅

### **Want Everything?**
Follow all steps above + add backend endpoints

---

## 📖 **Documentation:**

- Rich Text Editor supports full Markdown
- Category Management shows all seeded categories
- Unified Tracking links task to all activities
- All features are brutalist-styled to match TaskFlow

**Integration is modular - pick what you need!** 🎯
