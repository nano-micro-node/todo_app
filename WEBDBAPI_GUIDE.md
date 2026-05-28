# WebDB API

> A clean, path-based CRUD layer on top of your existing **WebDB** IndexedDB store.  
> Drop `webdbapi.js` next to `webdb.js` — no config, no conflicts, works immediately.

---

## Table of Contents

- [Installation](#installation)
- [How Paths Work](#how-paths-work)
- [Key Design Choices](#key-design-choices)
- [API Reference](#api-reference)
  - [Database](#database-operations)
  - [Folder](#folder-operations)
  - [File CRUD](#file-crud)
  - [Extras](#extra-operations)
- [Full Examples](#full-examples)

---

## Installation

Just include both files in your HTML — order matters:

```html
<script src="webdb.js"></script>
<script src="webdbapi.js"></script>
```

Then use the built-in singleton anywhere in your code:

```js
// webdb is a ready-to-use global singleton
await webdb.write('mydb/users/profile.json', { name: 'John' });
```

Or create your own instance:

```js
const api = new WebDBAPI();
await api.write('mydb/users/profile.json', { name: 'John' });
```

---

## How Paths Work

Every operation takes a **path string** — exactly like a file system.

```
mydb/folder/subfolder/file.json
 │      │       │        │
 DB   folder  nested   file
```

| Path | Points to |
|---|---|
| `mydb` | A database |
| `mydb/folder` | A folder at root level |
| `mydb/folder/subfolder` | A nested folder |
| `mydb/folder/file.json` | A file inside a folder |
| `mydb/file.json` | A file at the database root |

Paths can be **as deep as you need**:

```
mydb/users/reports/2024/january/summary.json   ✅
```

---

## Key Design Choices

**`write()` and `update()` fail loudly**  
`write()` throws if the file already exists. `update()` throws if it doesn't. No silent overwrites, no mystery bugs.

**`upsert()` is the "I don't care" variant**  
When you just want the data saved and don't want to think about whether it exists yet, use `upsert()`. It creates or overwrites, never throws.

**Auto-creates missing intermediate folders**  
`write()`, `upsert()`, `createFolder()`, `move()`, and `copy()` all create any missing folders along the path automatically. No need to manually mkdir before saving a file.

**One `getAll()` call per operation**  
All records are fetched once into memory per operation and resolved there — no repeated round-trips to IndexedDB for each folder level.

**Works standalone alongside `webdb.js`**  
`webdbapi.js` opens its own connections and does not depend on or interfere with the `DBManager`, `StoreAdapter`, or `UIExplorer` instances in `webdb.js`. Both files can run side-by-side safely.

---

## API Reference

### Database Operations

```js
// Create a new empty database
await webdb.createDB('mydb')
// → { success: true, db: 'mydb' }

// List all databases in the browser
await webdb.listDBs()
// → [{ name: 'mydb', version: 1 }, ...]

// Delete a database entirely (all data gone)
await webdb.deleteDB('mydb')
// → { success: true, deleted: 'mydb' }

// Wipe all files and folders inside a database — keeps the DB itself
await webdb.clear('mydb')
// → { success: true, db: 'mydb', deletedItems: 12 }
```

---

### Folder Operations

```js
// Create a folder — creates all missing intermediate folders automatically
await webdb.createFolder('mydb/users/reports/2024')
// → { success: true, path: 'mydb/users/reports/2024' }

// List direct children of a path (files + folders)
await webdb.list('mydb')
await webdb.list('mydb/users')
await webdb.list('mydb/users/reports')
// → [{ name, type, size, created, modified, id }, ...]

// Rename a folder in-place
await webdb.renameFolder('mydb/users/reports', 'archive')
// → { success: true, path: 'mydb/users/reports', newName: 'archive' }

// Delete a folder and ALL its contents recursively
await webdb.deleteFolder('mydb/users/reports')
// → { success: true, path: '...', deletedItems: 7 }
```

---

### File CRUD

#### Write (Create)

Creates a new file. **Throws if the file already exists.**  
Auto-creates any missing folders along the path.

```js
await webdb.write('mydb/users/data.json',           { name: 'John', age: 30 })
await webdb.write('mydb/notes.txt',                  'Plain text content')
await webdb.write('mydb/users/reports/q1.json',      [1, 2, 3])
await webdb.write('mydb/deep/nested/path/file.json', { key: 'value' })
// → { success: true, path: '...', id: 'uuid' }
```

#### Read

Fetch a file's content and metadata.

```js
const file = await webdb.read('mydb/users/data.json')

file.content   // { name: 'John', age: 30 }
file.filename  // 'data.json'
file.size      // 24
file.created   // 1718000000000  (timestamp)
file.modified  // 1718000000000
file.id        // 'uuid'
file.path      // 'mydb/users/data.json'
```

#### Update

Overwrites an existing file's content. **Throws if the file does not exist.**

```js
await webdb.update('mydb/users/data.json', { name: 'Jane', age: 31 })
// → { success: true, path: '...', id: 'uuid' }
```

#### Upsert (Create or Update)

Creates if missing, overwrites if present. **Never throws for existence reasons.**  
Auto-creates any missing folders. Use this when you just want data saved.

```js
await webdb.upsert('mydb/config/settings.json', { theme: 'dark', lang: 'en' })
// → { success: true, path: '...', id: 'uuid', created: true }
//   created: true  → file was new
//   created: false → file was overwritten
```

#### Delete

Remove a file. Throws if the file does not exist.

```js
await webdb.delete('mydb/users/data.json')
// → { success: true, path: '...', deleted: 'data.json' }
```

---

### Extra Operations

#### Rename

Rename a file in-place (same folder, new name only).

```js
await webdb.rename('mydb/users/old-name.json', 'new-name.json')
// → { success: true, path: '...', newName: 'new-name.json' }
```

#### Move

Move a file to a different path within the same database.  
Auto-creates missing destination folders.

```js
await webdb.move('mydb/inbox/report.json', 'mydb/archive/2024/report.json')
// → { success: true, from: '...', to: '...' }
```

#### Copy

Duplicate a file to another path.  
Auto-creates missing destination folders.

```js
await webdb.copy('mydb/templates/base.json', 'mydb/users/new-profile.json')
// → { success: true, from: '...', to: '...', newId: 'uuid' }
```

#### Exists

Check whether a file or folder exists. Returns `true` or `false` — never throws.

```js
await webdb.exists('mydb/users/data.json')   // true or false
await webdb.exists('mydb/users')             // true or false
await webdb.exists('mydb')                   // true or false
```

#### Info

Get metadata for a file or folder without loading its full content.

```js
const meta = await webdb.info('mydb/users/data.json')

meta.name      // 'data.json'
meta.type      // 'file'
meta.size      // 42
meta.created   // 1718000000000
meta.modified  // 1718000000000
meta.id        // 'uuid'
meta.path      // 'mydb/users/data.json'
```

#### Search

Find files whose names contain a query string (case-insensitive).

```js
await webdb.search('mydb', 'report')
await webdb.search('mydb/users', 'profile')
// → [{ name, size, modified, id, parentId }, ...]
```

---

## Full Examples

### Save and retrieve a user profile

```js
await webdb.write('app/users/john.json', {
    id:    1,
    name:  'John Doe',
    email: 'john@example.com',
    role:  'admin'
});

const user = await webdb.read('app/users/john.json');
console.log(user.content.name); // 'John Doe'
```

### Update only if the file exists

```js
if (await webdb.exists('app/users/john.json')) {
    await webdb.update('app/users/john.json', { ...currentData, role: 'editor' });
} else {
    console.log('User not found');
}
```

### Save config safely (create or overwrite)

```js
// No need to check — upsert handles both cases
await webdb.upsert('app/config/theme.json', { mode: 'dark', accent: '#6366f1' });
```

### Organise files into an archive

```js
// Move last year's reports into an archive folder (auto-created)
await webdb.move('app/reports/q1.json',  'app/archive/2023/q1.json');
await webdb.move('app/reports/q2.json',  'app/archive/2023/q2.json');
await webdb.move('app/reports/q3.json',  'app/archive/2023/q3.json');
await webdb.move('app/reports/q4.json',  'app/archive/2023/q4.json');
```

### Browse a folder tree

```js
const root    = await webdb.list('app');
const users   = await webdb.list('app/users');
const reports = await webdb.list('app/users/reports');

root.forEach(item => {
    console.log(`${item.type === 'folder' ? '📁' : '📄'} ${item.name}`);
});
```

### Search across a database

```js
const results = await webdb.search('app', 'invoice');
results.forEach(r => console.log(r.name, r.modified));
```

### Wipe and rebuild a database

```js
await webdb.clear('app');    // remove all content, keep DB

await webdb.upsert('app/config/settings.json', { version: 2 });
await webdb.createFolder('app/users');
await webdb.createFolder('app/reports');
```

---

## Return Value Shapes

| Method | Returns |
|---|---|
| `createDB` | `{ success, db }` |
| `deleteDB` | `{ success, deleted }` |
| `listDBs` | `[{ name, version }]` |
| `clear` | `{ success, db, deletedItems }` |
| `createFolder` | `{ success, path }` |
| `deleteFolder` | `{ success, path, deletedItems }` |
| `renameFolder` | `{ success, path, newName }` |
| `list` | `[{ name, type, size, created, modified, id }]` |
| `write` | `{ success, path, id }` |
| `read` | `{ path, filename, content, size, created, modified, id }` |
| `update` | `{ success, path, id }` |
| `upsert` | `{ success, path, id, created }` |
| `delete` | `{ success, path, deleted }` |
| `rename` | `{ success, path, newName }` |
| `move` | `{ success, from, to }` |
| `copy` | `{ success, from, to, newId }` |
| `exists` | `true \| false` |
| `info` | `{ path, name, type, size, created, modified, id }` |
| `search` | `[{ name, size, modified, id, parentId }]` |

---

## Error Handling

All methods are `async` and throw on failure. Wrap calls in `try/catch`:

```js
try {
    await webdb.write('mydb/users/data.json', { name: 'John' });
} catch (err) {
    console.error(err.message);
    // "File already exists: "mydb/users/data.json". Use update() or upsert()."
}
```

Common error messages are descriptive and tell you exactly what to do next.
