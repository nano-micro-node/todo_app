# WebDB Manager Pro

A professional IndexedDB management tool with a modern UI, built with reusable JavaScript classes and functions.

## 📁 Files

- **webdb.html** - Main HTML structure and markup
- **webdb.css** - Stylesheet with responsive design
- **webdb.js** - Core JavaScript module with reusable classes

## 🚀 Quick Start

1. Place all three files (`webdb.html`, `webdb.css`, `webdb.js`) in the same directory
2. Open `webdb.html` in a modern web browser
3. Start managing your IndexedDB databases!

## ✨ Features

### Database Management
- Create, list, and delete IndexedDB databases
- Switch between multiple databases
- Export databases as JSON backups
- Import previously exported databases

### File Management
- Create files and folders
- Edit file content with live editor
- Rename files and folders
- Delete files and folders
- Drag-and-drop to move items to folders

### Search & Filter
- Real-time search by filename
- Filter results instantly

### Data Display
- Improved table with detailed information:
  - Filename with accent highlighting
  - File/Folder type indicator
  - File size in human-readable format (B, KB, MB, GB)
  - Creation date and time
  - Last modified date and time
  - Visual status badges

### Editor
- Modal editor for file content
- JSON syntax support with auto-formatting
- Binary file detection (read-only)
- Change tracking with visual indicator
- Save/cancel with unsaved changes warning

### Responsive Design
- Works on desktop, tablet, and mobile
- Adaptive layout that reorganizes for smaller screens
- Touch-friendly interface

## 📚 JavaScript Module API

### Classes

#### DBManager
Main class for managing IndexedDB databases.

```javascript
// Create instance
const dbManager = new DBManager();

// Use/open a database
await dbManager.use('myDatabase');

// List all databases
const databases = await dbManager.listDatabases();
// Returns: [{ name: 'root', version: 1 }, ...]

// Delete a database
await dbManager.dropDatabase('myDatabase');

// Get store adapter
const store = dbManager.getStore();
```

#### StoreAdapter
Handles individual store operations.

```javascript
const store = dbManager.getStore();

// Add item
await store.add({
    id: 'file-1',
    filename: 'document.txt',
    content: 'Hello World',
    type: 'file',
    parent: null,
    size: 11,
    created: Date.now(),
    modified: Date.now()
});

// Update item
await store.update(itemObject);

// Get item by ID
const item = await store.getRaw('file-1');

// Save file content
await store.save('newfile.txt', 'content', parentFolderId);

// Get all items
const allItems = await store.getAll();

// Remove item
await store.remove('file-1');

// Clear all items
await store.clear();
```

#### UIExplorer
Manages the UI state and rendering.

```javascript
const explorer = new UIExplorer();

// Switch to a database
await explorer.switchDB('myDatabase');

// Refresh items from store
await explorer.refresh();

// Render database list
await explorer.renderDBs();

// Render file table
explorer.render();
```

### Utility Functions

#### uuid()
Generate a UUID v4 identifier.

```javascript
const id = uuid();
// Returns: "550e8400-e29b-41d4-a716-446655440000"
```

#### formatBytes(bytes)
Convert bytes to human-readable format.

```javascript
formatBytes(1024)      // "1 KB"
formatBytes(1048576)   // "1 MB"
formatBytes(500)       // "500 B"
```

#### formatDate(timestamp)
Format timestamp to readable date string.

```javascript
formatDate(Date.now())
// Returns: "5/28/2026 2:30:45 PM"
```

#### getMimeType(filename)
Get MIME type from filename.

```javascript
getMimeType('document.pdf')  // "application/pdf"
getMimeType('image.png')     // "image/png"
getMimeType('script.js')     // "application/javascript"
```

### Global Functions

```javascript
// File Operations
await createFolder(parentId)          // Create new folder
await createNewFile(parentId)         // Create new file
await renameFile(fileId)              // Rename file/folder
await openEditor(fileId)              // Open file editor
await deleteFile(fileId)              // Delete file/folder
function checkChanges()               // Check for unsaved changes
function closeModal(force)            // Close editor modal
async function handleSave()           // Save file content

// Database Operations
async function createNewDB()          // Create new database
async function deleteDatabase(name)   // Delete database

// Import/Export
async function handleDBExport()       // Export database as JSON
async function handleFileImport(e)    // Import database from JSON

// Tree Functions
function renderTree()                 // Render file tree view
function refreshTree()                // Refresh tree display
function showMenu(event, item)        // Show context menu
```

## 🔌 Using in Other Projects

### Import as a Module

If using a module bundler (Webpack, Rollup, etc.):

```javascript
import { 
    DBManager, 
    StoreAdapter, 
    UIExplorer,
    uuid,
    formatBytes,
    formatDate
} from './webdb.js';

// Create your own instances
const myDB = new DBManager();
await myDB.use('myApp');
```

### Use in Browser Globally

```html
<script src="webdb.js"></script>
<script>
    // Access globally
    const explorer = new UIExplorer();
    const store = dbManager.getStore();
    
    // Use utility functions
    const id = uuid();
    const size = formatBytes(1024);
</script>
```

### Example: Custom File Manager

```javascript
// Create your own file manager using the classes
class CustomFileManager {
    constructor(dbName) {
        this.dbName = dbName;
        this.store = null;
    }
    
    async init() {
        await dbManager.use(this.dbName);
        this.store = dbManager.getStore();
    }
    
    async addFile(filename, content) {
        return await this.store.save(filename, content);
    }
    
    async getFiles() {
        return await this.store.getAll();
    }
    
    async deleteFile(id) {
        return await this.store.remove(id);
    }
}

// Usage
const fileManager = new CustomFileManager('myApp');
await fileManager.init();
await fileManager.addFile('notes.txt', 'My notes...');
```

## 🎨 Styling

### CSS Variables

Customize the appearance by modifying CSS variables in `webdb.css`:

```css
:root {
    --bg: #0f172a;              /* Main background */
    --panel: #1e293b;           /* Panel/card background */
    --accent: #38bdf8;          /* Primary accent color */
    --text: #f1f5f9;            /* Primary text color */
    --text-muted: #94a3b8;      /* Secondary text color */
    --danger: #ef4444;          /* Danger/delete color */
    --border: #334155;          /* Border color */
    --success: #22c55e;         /* Success/positive color */
    --warning: #f59e0b;         /* Warning color */
}
```

### Responsive Breakpoints

- **Desktop**: Full layout with sidebars
- **Tablet (≤900px)**: Sidebars reorganize to horizontal/vertical stacking
- **Mobile (≤480px)**: Optimized buttons and spacing

## 🐛 Browser Support

- Chrome/Edge 24+
- Firefox 16+
- Safari 10+
- iOS Safari 10+
- Android Chrome

## 📝 Data Structure

### File/Folder Object

```javascript
{
    id: string,              // Unique identifier
    filename: string,        // File name (files only)
    name: string,           // Folder name (folders only)
    content: string|object,  // File content
    type: 'file'|'folder',  // Item type
    parent: string|null,    // Parent folder ID
    size: number,           // File size in bytes
    created: number,        // Creation timestamp
    modified: number,       // Last modified timestamp
    _isBinary: boolean      // Whether content is binary data
}
```

## 🔐 Security Notes

- All data is stored locally in the browser's IndexedDB
- No data is sent to any server
- Each domain has its own isolated IndexedDB storage
- Files can be exported and should be stored securely

## 🚀 Performance Tips

1. **Limit database size**: IndexedDB has storage limits (typically 50GB)
2. **Batch operations**: Use transactions when performing multiple operations
3. **Clean up binary files**: Large binary files take up significant storage
4. **Export regularly**: Create backups of important databases

## 🤝 Contributing

To improve the code:

1. Maintain the class structure for reusability
2. Add comments for complex functions
3. Keep utility functions generic
4. Update this README with new features

## 📄 License

This tool is provided as-is for educational and personal use.

## 🆘 Troubleshooting

### Files won't load
- Ensure all three files are in the same directory
- Check browser console for errors (F12)
- Verify browser supports IndexedDB

### Changes not saving
- Check browser's IndexedDB limits
- Ensure browser allows storage in private mode
- Try a different browser

### Import not working
- Verify JSON file format matches export format
- Check that file is valid JSON
- Try exporting a database first to see correct format

### Tree view not updating
- Click refresh button or switch databases
- Check browser console for JavaScript errors
- Try clearing browser cache and reloading

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation above
3. Check browser console for error messages
4. Test in different browser if possible

---

**WebDB Manager Pro** - Making IndexedDB management simple and powerful! 🚀
