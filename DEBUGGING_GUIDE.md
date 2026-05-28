# 🐛 WebDB Manager - Debugging Guide

## ✅ Quick Start (Fixed Version)

### **Setup:**
1. Place all three files in the same folder:
   - `webdb.html`
   - `webdb.css`
   - `webdb.js`

2. Open `webdb.html` in your browser

### **What Should Happen:**
- ✅ Page loads without errors
- ✅ "WebDB" sidebar appears with a "+" button
- ✅ "Files" sidebar appears on the left
- ✅ Main table appears with column headers
- ✅ Console shows: "DOM loaded" → "Initializing default database..." → "WebDB Manager initialized successfully!"

---

## 🔍 Testing Steps

### **1. Check Browser Console**
Open DevTools: `F12` or Right-click → Inspect

Look for messages like:
```
✅ DOM loaded, initializing WebDB Manager...
✅ Switching to database: root
✅ DB opened: root
✅ WebDB Manager initialized successfully!
```

### **2. Test Database Creation**
- Click the **+** button in the WebDB sidebar
- Enter database name: `test_db`
- Should switch to new database
- Check console for: `Switching to database: test_db`

### **3. Test File Operations**
- Click **+ New File** button
- Enter filename: `test.txt`
- File should appear in the table
- Should show in Files tree on left

### **4. Test File Editing**
- Click **Edit** button next to file
- Modal should open
- Type some content
- Click **💾 Save**
- Modal should close and content saved

### **5. Test Export/Import**
- Click **📥 Backup** to export database
- JSON file downloads to your computer
- Click **📤 Import** and select the JSON file
- Files should be imported

---

## ❌ Troubleshooting

### **Problem: Page loads blank**

**Check:**
1. Open DevTools (F12)
2. Look for red errors
3. Check that all 3 files are in same folder
4. Ensure file paths are correct

**Solution:**
```
Look for message like:
"Failed to load webdb.css" or "Failed to load webdb.js"
→ Move files to same directory
```

### **Problem: "No database selected" error**

**This is normal on first load.**
- Should resolve automatically in 1-2 seconds
- Refresh page if it persists
- Check console for full error message

### **Problem: Table shows "Select a database to view files"**

**This means:**
- Database loaded but no files in it
- Create a new file with **+ New File**
- Or import existing database with **📤 Import**

### **Problem: Can't create files**

**Check:**
1. Is a database selected? (Check if DB name appears highlighted in sidebar)
2. Click database name first to activate it
3. Then try creating file

### **Problem: File won't save**

**Check:**
1. Is the content valid JSON? (if filename ends in .json)
2. Try saving as different filename without .json
3. Check console for error message

### **Problem: Export downloads blank file**

**Solution:**
1. Make sure you have files created
2. Click database name to activate it
3. Then click **📥 Backup**
4. File should download with correct content

---

## 🛠️ Advanced Debugging

### **Enable Verbose Logging**

Open DevTools console and run:
```javascript
// Set all console logs visible
window.DEBUG = true;
```

Then try operations and watch console.

### **Check IndexedDB Storage**

In DevTools → Application → IndexedDB:
1. Look for your database names
2. Click on "files" object store
3. Should see your files listed

### **Clear All Data (Fresh Start)**

Run in console:
```javascript
// Delete all databases
(async () => {
    const dbs = await indexedDB.databases();
    for (let db of dbs) {
        await dbManager.dropDatabase(db.name);
    }
    location.reload();
})();
```

---

## 📊 File Structure Check

Verify all files are in same directory:

```
your-folder/
├── webdb.html         ✅ Must be here
├── webdb.css          ✅ Must be here
├── webdb.js           ✅ Must be here
└── README.md          (Optional)
```

Open webdb.html in browser (not from file:///)

### **Best Practice:**
Use a local web server:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (with http-server package)
npx http-server
```

Then visit: `http://localhost:8000/webdb.html`

---

## 🧪 Quick Test Script

Run this in browser console to test everything:

```javascript
(async () => {
    try {
        console.log('1. Testing DBManager...');
        await dbManager.use('test');
        console.log('✅ Database created');
        
        console.log('2. Testing StoreAdapter...');
        const store = new StoreAdapter(dbManager.db, 'test');
        const id = uuid();
        await store.save('test.txt', 'Hello World', null, id);
        console.log('✅ File saved');
        
        console.log('3. Testing getAll...');
        const items = await store.getAll();
        console.log('✅ Retrieved', items.length, 'items');
        
        console.log('4. Testing formatters...');
        console.log('Size:', formatBytes(1024));
        console.log('Date:', formatDate(Date.now()));
        
        console.log('✅✅✅ All tests passed! ✅✅✅');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
})();
```

---

## 📱 Browser Compatibility

Works on:
- ✅ Chrome 24+
- ✅ Firefox 16+
- ✅ Safari 10+
- ✅ Edge 12+
- ✅ Opera 15+
- ✅ Mobile browsers

**Does NOT work on:**
- ❌ IE 11 (use Edge instead)
- ❌ Very old browsers

---

## 💡 Common Solutions

| Problem | Solution |
|---------|----------|
| Files not showing | Click database name to activate |
| Modal won't close | Press Escape or click Cancel |
| Can't edit JSON | Ensure valid JSON format |
| Slow performance | Reduce number of files |
| Storage full | Export files and delete old data |
| Data lost on refresh | Use Browser storage (not cleared) |

---

## 🎓 Learning Resources

### **IndexedDB Concepts:**
- Each domain gets its own storage
- Data persists between sessions
- Storage quota is typically 50GB
- Asynchronous API (use async/await)

### **Security Notes:**
- All data stays in browser
- Cannot be accessed by other websites
- Private browsing may limit persistence
- Use backups for important data

---

## 📞 Still Not Working?

### **Gather this info:**
1. What error appears? (Copy exact error message)
2. What browser/version? (Check DevTools)
3. What did you do when it failed?
4. Any console errors? (F12 → Console tab)

### **Steps to try:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear cache: DevTools → Application → Clear site data
3. Try different browser (Chrome, Firefox, etc.)
4. Try incognito/private mode
5. Restart browser completely

---

## ✨ Success Indicators

When everything works:

1. ✅ Page loads instantly
2. ✅ Console shows "initialized successfully"
3. ✅ Can create databases
4. ✅ Can create files
5. ✅ Can edit files
6. ✅ Can delete files
7. ✅ Can export/import
8. ✅ Tree view updates
9. ✅ Search filters files
10. ✅ Table shows all columns

If all 10 ✅ appear, **you're ready to use WebDB Manager!**

---

## 🚀 Performance Tips

For best performance:

```javascript
// Keep database size reasonable
// Recommended: < 10,000 files per database

// Export regularly to backup
// Clean up old files

// Use JSON files for data
// Use folders for organization
```

---

Enjoy your WebDB Manager! 🎉
