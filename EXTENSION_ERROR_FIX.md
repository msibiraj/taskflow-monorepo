# 🔧 Browser Extension - Troubleshooting Guide

## ❌ **Error: "Extension context invalidated"**

### **What This Means:**

This error happens when:
1. You reload the extension (click reload in chrome://extensions/)
2. You update the extension code
3. You disable/enable the extension
4. Chrome restarts the extension background

### **Why It Happens:**

Chrome invalidates all existing connections and message ports when the extension reloads. Content scripts running on already-open tabs lose their connection to the background script.

---

## ✅ **Solution (ALREADY FIXED!):**

The extension now handles this gracefully:

### **What Happens Now:**

```
Extension Reloaded
   ↓
Content script detects disconnection
   ↓
Shows message: "Extension was reloaded. Please refresh page."
   ↓
Stops trying to send messages (prevents error)
   ↓
User refreshes page → Everything works again ✅
```

### **Code Added:**

```javascript
// 1. Check if extension is still valid
function isExtensionValid() {
  try {
    if (chrome.runtime && chrome.runtime.id) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

// 2. Detect disconnection
chrome.runtime.connect().onDisconnect.addListener(() => {
  extensionValid = false;
  console.log('⚠️ Extension disconnected. Please reload this page.');
});

// 3. Check before sending messages
function sendInteractionData() {
  if (!isExtensionValid()) {
    console.log('⚠️ Extension context invalidated - please reload page');
    return;
  }
  // ... send message
}
```

---

## 🔄 **When You See This Error:**

### **Step 1: Check Console Message**

Open DevTools Console (F12) and look for:
```
⚠️ Extension was reloaded. Please refresh this page.
```

or

```
⚠️ Extension disconnected. Please reload this page.
```

### **Step 2: Refresh the Page**

```
Press F5 or Ctrl+R
```

That's it! The extension will reconnect automatically.

---

## 🎯 **Common Scenarios:**

### **Scenario 1: Developing the Extension**

```
You modify extension code
   ↓
Click "Reload" in chrome://extensions/
   ↓
Console shows: "Extension disconnected"
   ↓
Refresh all open tabs using the extension
   ↓
✅ Works again!
```

### **Scenario 2: Extension Auto-Update**

```
Chrome updates the extension
   ↓
Background script restarts
   ↓
Content scripts on open tabs lose connection
   ↓
User sees message to refresh
   ↓
User refreshes page
   ↓
✅ Works again!
```

### **Scenario 3: Chrome Restarts Extension**

```
Chrome memory management restarts extension
   ↓
Connection lost
   ↓
Extension detects and stops trying
   ↓
No more errors in console!
   ↓
User refreshes when they want to continue
   ↓
✅ Works again!
```

---

## 📊 **What the Fix Does:**

### **Before (ERROR):**

```javascript
// Old code - throws error
chrome.runtime.sendMessage({...});
// ❌ Error: Extension context invalidated
// ❌ Spam console with errors
// ❌ User confused
```

### **After (GRACEFUL):**

```javascript
// New code - handles gracefully
if (!isExtensionValid()) {
  console.log('⚠️ Please reload page');
  return; // Stop trying
}
chrome.runtime.sendMessage({...});
// ✅ No error
// ✅ Clear message
// ✅ User knows what to do
```

---

## 🆕 **New Features Added:**

### **1. Extension Validity Check**
```javascript
isExtensionValid()
```
- Checks if chrome.runtime.id exists
- Returns false if context invalidated
- Prevents errors before they happen

### **2. Disconnection Detection**
```javascript
chrome.runtime.connect().onDisconnect.addListener(...)
```
- Detects when extension disconnects
- Sets extensionValid flag to false
- Shows helpful message

### **3. Graceful Degradation**
```javascript
if (!isExtensionValid()) return;
```
- All functions check validity first
- Stop trying to send messages if invalid
- No more console spam

### **4. User-Friendly Messages**
```
⚠️ Extension was reloaded. Please refresh this page to continue tracking.
```
- Clear instructions
- Emojis for visibility
- Action-oriented

---

## 🎯 **Unified Tracking Messages Added:**

The extension now also handles unified tracking:

### **Messages Supported:**

```javascript
// 1. Start unified tracking
chrome.runtime.sendMessage({
  type: 'START_TASK_TRACKING',
  taskId: '...',
  taskTitle: '...',
  startTime: '...'
});

// 2. Pause tracking (idle)
chrome.runtime.sendMessage({
  type: 'PAUSE_TRACKING'
});

// 3. Resume tracking (active)
chrome.runtime.sendMessage({
  type: 'RESUME_TRACKING'
});

// 4. Stop unified tracking
chrome.runtime.sendMessage({
  type: 'STOP_TASK_TRACKING'
});
```

### **Content Script Responses:**

```javascript
// Content script now handles:
- START_TRACKING → Start interaction tracking
- PAUSE_TRACKING → Pause (idle)
- RESUME_TRACKING → Resume (active)
- STOP_TASK_TRACKING → Stop and send final data
```

---

## 🧪 **Testing the Fix:**

### **Test 1: Reload Extension**

```
1. Open chrome://extensions/
2. Find TaskFlow extension
3. Click "Reload" button
4. Open console on any tab using extension
5. Should see: "⚠️ Extension disconnected"
6. Refresh the page (F5)
7. ✅ Extension works again
8. ❌ NO errors in console!
```

### **Test 2: Rapid Reloads**

```
1. Reload extension multiple times
2. Content script stops trying to send
3. No console errors
4. Refresh page once
5. ✅ Works perfectly
```

### **Test 3: Unified Tracking**

```
1. Start tracking on a task
2. Extension gets START_TASK_TRACKING message
3. Activities tagged with taskId
4. Go idle (5 min)
5. Extension gets PAUSE_TRACKING
6. Move mouse
7. Extension gets RESUME_TRACKING
8. Stop tracking
9. Extension gets STOP_TASK_TRACKING
10. ✅ All messages handled correctly
```

---

## 💡 **Best Practices:**

### **For Users:**

1. **If you reload the extension** → Refresh all tabs using it
2. **If you see "disconnected"** → Just refresh the page
3. **No need to worry** → Data is saved before disconnection

### **For Developers:**

1. **After code changes** → Always reload extension AND refresh test tabs
2. **Use console messages** → Check for disconnection warnings
3. **Test validity** → isExtensionValid() before any chrome.runtime calls

---

## 📝 **Console Messages Guide:**

### **Good Messages (Normal Operation):**

```
✅ TaskFlow content script loaded
✅ Content script: Started tracking interactions
💾 Activity saved: 67abc123...
```

### **Warning Messages (Need Action):**

```
⚠️ Extension was reloaded. Please refresh this page.
⚠️ Extension disconnected. Please reload this page.
⚠️ Extension context invalidated - data not sent.
```

### **What to Do:**

| Message | Action |
|---------|--------|
| "Extension was reloaded" | Refresh page (F5) |
| "Extension disconnected" | Refresh page (F5) |
| "Context invalidated" | Refresh page (F5) |

**Simple:** Just refresh the page! ✅

---

## 🔍 **Advanced Debugging:**

### **Check Extension Status:**

```javascript
// In console on any page
chrome.runtime.id
// If returns undefined → Extension context invalid
// If returns extension ID → Extension valid
```

### **Check Connection:**

```javascript
// In console
try {
  chrome.runtime.sendMessage({ test: true });
  console.log('✅ Extension connected');
} catch (e) {
  console.log('❌ Extension disconnected');
}
```

### **Monitor Background Script:**

```
1. Go to chrome://extensions/
2. Find TaskFlow
3. Click "service worker" or "background page"
4. See background script console
5. Watch for messages being received
```

---

## ✅ **Summary:**

**The error is FIXED!**

- ✅ Extension detects when context is invalidated
- ✅ Stops trying to send messages (no errors)
- ✅ Shows clear message to refresh page
- ✅ Handles unified tracking messages
- ✅ Supports pause/resume (idle detection)

**Just refresh the page after reloading the extension!** 🎉
