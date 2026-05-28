# 💾 WebDB Manager - Backup & Restore Guide

## 🎯 Overview

WebDB Manager now has **two levels of backup**:

1. **Single Database Backup** - Backup one database at a time
2. **All Databases Backup** - Backup ALL databases in one file

---

## 📥 Single Database Backup

### **What it does:**
- Backs up only the currently selected database
- Creates a JSON file with that database's files/folders
- Smaller file size (only one database)

### **How to use:**

#### **Backup Current Database:**
1. Select a database from the list (e.g., "root")
2. Click **📥 Backup** button in "Current Database" section
3. File downloads: `webdb-{dbname}-{timestamp}.json`
4. Save it to your computer

#### **Restore to Current Database:**
1. Select the database you want to restore to
2. Click **📤 Import** button
3. Choose the backup JSON file
4. Files are imported into that database
5. Page shows: "Successfully imported X items"

### **Example:**
```
Database: "myapp"
Files: 50 documents
Backup file size: ~200 KB
Filename: webdb-myapp-1716939600000.json
```

---

## 💾 All Databases Backup

### **What it does:**
- Backs up **ALL databases** at once
- Creates ONE large JSON file containing everything
- Includes database names, versions, and all files
- Perfect for complete system backup

### **How to use:**

#### **Backup ALL Databases:**
1. Click **💾 Backup All** button in "All Databases" section
2. System collects data from all databases
3. File downloads: `webdb-all-databases-{timestamp}.json`
4. Wait for completion message

#### **Restore ALL Databases:**
1. Click **📂 Import All** button
2. Choose the backup JSON file
3. System creates/restores all databases
4. All files are imported back
5. Page reloads automatically
6. Summary shows: "Successfully imported X databases"

### **Example:**
```
Total Databases: 5
  - root (150 files)
  - projects (89 files)
  - notes (234 files)
  - archive (45 files)
  - temp (12 files)
Total Files: 530
Backup file size: ~1.5 MB
Filename: webdb-all-databases-1716939600000.json
```

---

## 📋 Backup File Formats

### **Single Database Format:**
```json
[
  {
    "id": "file-123",
    "filename": "document.txt",
    "content": "Hello World",
    "type": "file",
    "parent": null,
    "size": 11,
    "created": 1716939600000,
    "modified": 1716939600000
  },
  {
    "id": "folder-456",
    "name": "My Folder",
    "type": "folder",
    "parent": null,
    "created": 1716939600000,
    "modified": 1716939600000
  }
]
```

### **All Databases Format:**
```json
{
  "backupType": "all-databases",
  "backupDate": "2024-05-28T10:30:00.000Z",
  "backupVersion": "1.0",
  "totalDatabases": 5,
  "databases": {
    "root": {
      "version": 1,
      "itemCount": 150,
      "files": [ /* array of files */ ]
    },
    "projects": {
      "version": 1,
      "itemCount": 89,
      "files": [ /* array of files */ ]
    }
  }
}
```

---

## 🔄 Common Scenarios

### **Scenario 1: Backup Everything**
```
Goal: Create complete backup of all work
Steps:
1. Click "💾 Backup All"
2. Save: webdb-all-databases.json
3. Store safely (cloud, USB drive, etc.)
```

### **Scenario 2: Restore to New Computer**
```
Goal: Move all databases to new computer
Steps:
1. Download backup file to new computer
2. Open webdb.html on new computer
3. Click "📂 Import All"
4. Choose backup file
5. Wait for import to complete
6. Everything is restored!
```

### **Scenario 3: Backup One Project**
```
Goal: Share one database with team member
Steps:
1. Select "projects" database
2. Click "📥 Backup"
3. Send webdb-projects.json to team
4. Team member imports it
```

### **Scenario 4: Weekly Backups**
```
Goal: Keep weekly backups
Steps:
1. Every Monday, click "💾 Backup All"
2. Rename file: webdb-backup-2024-05-28.json
3. Store in folder: /backups/
4. Keep 4 weeks of backups
Result: Can restore to any week
```

---

## ⚠️ Important Notes

### **File Differences:**

| Feature | Single Backup | All Backup |
|---------|--------------|-----------|
| Scope | One database | All databases |
| File Size | Smaller | Larger |
| Button | 📥 Backup / 📤 Import | 💾 Backup All / 📂 Import All |
| Use Case | One database at a time | Complete system backup |
| Restore Target | Current database | All new databases |

### **What Gets Backed Up:**
✅ File contents  
✅ File names  
✅ Folder structure  
✅ Creation dates  
✅ Modification dates  
✅ File sizes  
✅ All metadata  

### **What Does NOT Get Backed Up:**
❌ Application code  
❌ CSS/JavaScript files  
❌ Browser settings  

---

## 🛡️ Best Practices

### **1. Regular Backups**
```
Recommended Schedule:
- Daily: Critical data
- Weekly: Projects
- Monthly: Archive
```

### **2. Multiple Copies**
```
Keep backups in multiple locations:
- Cloud storage (Google Drive, OneDrive)
- External hard drive
- USB flash drive
- Email attachment (for important files)
```

### **3. Naming Convention**
```
Good names:
- webdb-backup-2024-05-28.json
- webdb-projects-v2.json
- webdb-all-final.json

Bad names:
- backup.json
- webdb.json
- data.json
```

### **4. Testing Restores**
```
Test your backups:
1. Create a backup
2. Create new database for testing
3. Import the backup
4. Verify all files are there
5. Then you know restore will work
```

### **5. Storage Limits**
```
Monitor backup file sizes:
Small: < 1 MB (< 1000 files)
Medium: 1-10 MB (1000-10,000 files)
Large: 10-100 MB (10,000-100,000 files)
Huge: > 100 MB (consider splitting)
```

---

## 🔍 Understanding Import Process

### **Single Database Import:**
1. Opens the backup JSON file
2. Reads array of items
3. Creates or updates each item in current database
4. Shows: "Successfully imported X items"
5. Database is refreshed

### **All Databases Import:**
1. Opens the backup JSON file
2. Validates format (checks for "all-databases")
3. For each database in backup:
   - Creates the database
   - Imports all files
   - Handles missing items
4. Shows summary: "5 databases imported"
5. Page reloads automatically

---

## ❌ Troubleshooting

### **Problem: Import fails with "Invalid backup format"**

**Solution:**
- Make sure you're using the correct file
- Single database → Use 📤 Import button
- All databases → Use 📂 Import All button
- Files can't be mixed!

### **Problem: Export file is empty or very small**

**Solution:**
1. Click database name to select it
2. Create some files first
3. Then click backup
4. File should be larger

### **Problem: Import says "0 items imported"**

**Solution:**
1. Check backup file is valid JSON
2. Verify it's not corrupted
3. Try with different browser
4. Check browser console (F12) for errors

### **Problem: Can't find backup file on computer**

**Solution:**
Check your Downloads folder:
- Windows: `C:\Users\YourName\Downloads`
- Mac: `/Users/YourName/Downloads`
- Linux: `~/Downloads`

Most browsers download here by default.

### **Problem: Backup takes too long**

**Solution:**
- Normal for large databases
- All Databases = slower (backing up everything)
- Wait for success message
- Don't close tab during backup

---

## 📊 Backup File Information

When you export, the backup includes:

```json
{
  "backupType": "all-databases or single",
  "backupDate": "ISO 8601 timestamp",
  "backupVersion": "1.0",
  "totalDatabases": "number of databases",
  "databases": {
    "db-name": {
      "version": "IndexedDB version",
      "itemCount": "number of items",
      "files": [ /* all files */ ]
    }
  }
}
```

You can open these files in a text editor to:
- See what's in the backup
- Manually edit if needed
- Verify content before importing

---

## 🔐 Security & Privacy

### **Where are backups stored?**
- On your computer (Downloads folder)
- You control all backups
- No upload to internet
- No tracking or logging

### **What about sensitive data?**
- Store backups safely
- Encrypt important files
- Don't email unencrypted
- Keep USB drives in safe place

### **Backup integrity:**
- JSON format is readable
- Can verify manually
- No compression (all data visible)
- Timestamp included (when backed up)

---

## 💡 Tips & Tricks

### **Quick Weekly Backup Script:**
```javascript
// Run in console weekly
(async () => {
    await handleAllDBsExport();
    alert('Weekly backup complete!');
})();
```

### **Check Backup Before Import:**
Open JSON file in text editor first to verify size and content.

### **Partial Restore:**
1. Import all databases to separate browser tab
2. Copy only needed files back
3. Use both browsers side-by-side

### **Archive Old Databases:**
```
1. Backup old database
2. Delete from WebDB
3. Keep backup file
4. Can restore later if needed
```

---

## 📈 Scalability

### **Small Deployment (< 10 databases):**
- Use All Backup regularly
- Keep backups locally
- Update monthly

### **Medium Deployment (10-100 databases):**
- Use All Backup weekly
- Store in cloud storage
- Keep 4 weekly backups

### **Large Deployment (> 100 databases):**
- Consider splitting databases
- Backup individual databases
- Automate with scripts
- Use external storage

---

## ✅ Checklist

**Before you start:**
- [ ] All three files in same folder
- [ ] webdb.html working properly
- [ ] Able to create files

**For backups:**
- [ ] Know difference between single & all backups
- [ ] Have safe place to store backups
- [ ] Test restore process once
- [ ] Create first backup

**For restoration:**
- [ ] Have backup file downloaded
- [ ] Know which type (single or all)
- [ ] Have correct database selected (for single)
- [ ] Verify import succeeded

---

## 🎓 Learn More

**Related Topics:**
- [README.md](README.md) - API documentation
- [DEBUGGING_GUIDE.md](DEBUGGING_GUIDE.md) - Troubleshooting

**IndexedDB Info:**
- MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- Storage quota: Usually 50GB per domain
- Persistent storage: Data survives browser restart

---

**Happy backing up!** 💾🎉

If you have questions about backup/restore, check this guide first!
