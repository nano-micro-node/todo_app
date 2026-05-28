/**
 * =========================================
 * TaskFlow — Redesigned App Logic
 * =========================================
 * Features:
 *  - Status: pending | completed | extended
 *  - Clickable priority & status chips → inline dropdown
 *  - Single "Create Task" modal (top-right)
 *  - Single-line task rows
 */

class TodoApp {
    constructor() {
        this.dbManager    = dbManager;
        this.store        = null;
        this.todos        = [];
        this.currentFilter   = 'all';
        this.editingId       = null;
        this.modalMode       = 'create'; // 'create' | 'edit'
        this.initialized     = false;

        // Close dropdown when clicking anywhere outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.chip') && !e.target.closest('.inline-dropdown')) {
                this._hideDropdown();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    /* =========================================
       INIT & DATA LAYER
       ========================================= */

    async init() {
        try {
            await this.dbManager.use('taskflow');
            this.store = new StoreAdapter(this.dbManager.db, 'taskflow');
            await this.loadTodos();
            this.render();
            this.updateStats();
            this.initialized = true;
        } catch (err) {
            console.error('Init error:', err);
            alert('Error initializing TaskFlow: ' + err.message);
        }
    }

    async loadTodos() {
        try {
            const all = await this.store.getAll();
            this.todos = all
                .filter(i => i.type === 'todo')
                .map(t => {
                    // Migrate old 'completed' boolean → status field
                    if (!t.status) {
                        t.status = t.completed ? 'completed' : 'pending';
                    }
                    return t;
                })
                .sort((a, b) => b.created - a.created);
        } catch (err) {
            console.error('Load error:', err);
            this.todos = [];
        }
    }

    async saveTodo(todo) {
        todo.id   = todo.id || uuid();
        todo.type = 'todo';
        // Keep 'completed' bool in sync for backward-compat
        todo.completed = todo.status === 'completed';

        const exists = this.todos.some(t => t.id === todo.id);
        if (exists) {
            await this.store.update(todo);
        } else {
            await this.store.add(todo);
        }
        await this.loadTodos();
        return todo.id;
    }

    async deleteTodo(id) {
        if (!confirm('Delete this task?')) return;
        await this.store.remove(id);
        await this.loadTodos();
        this.render();
        this.updateStats();
    }

    /* =========================================
       MODAL — CREATE & EDIT
       ========================================= */

    openCreateModal() {
        this.modalMode  = 'create';
        this.editingId  = null;

        document.getElementById('modalHeading').textContent    = '✨ New Task';
        document.getElementById('modalSaveBtnText').textContent = '➕ Create Task';

        document.getElementById('modalTitleInput').value = '';
        document.getElementById('modalDesc').value       = '';
        document.getElementById('modalDueDate').value    = new Date().toISOString().split('T')[0];
        document.getElementById('modalPriority').value   = 'medium';
        document.getElementById('modalCategory').value   = '';
        document.getElementById('modalStatus').value     = 'pending';

        this._openModal();
        setTimeout(() => document.getElementById('modalTitleInput').focus(), 100);
    }

    async editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.modalMode = 'edit';
        this.editingId = id;

        document.getElementById('modalHeading').textContent    = '✏️ Edit Task';
        document.getElementById('modalSaveBtnText').textContent = '💾 Save Changes';

        document.getElementById('modalTitleInput').value = todo.title;
        document.getElementById('modalDesc').value       = todo.description || '';
        document.getElementById('modalDueDate').value    = todo.dueDate || '';
        document.getElementById('modalPriority').value   = todo.priority || 'medium';
        document.getElementById('modalCategory').value   = todo.category || '';
        document.getElementById('modalStatus').value     = todo.status || 'pending';

        this._openModal();
    }

    async saveModal() {
        const title = document.getElementById('modalTitleInput').value.trim();
        if (!title) {
            document.getElementById('modalTitleInput').focus();
            document.getElementById('modalTitleInput').style.borderColor = 'var(--red)';
            setTimeout(() => document.getElementById('modalTitleInput').style.borderColor = '', 1500);
            return;
        }

        try {
            if (this.modalMode === 'create') {
                const todo = {
                    id:          uuid(),
                    title,
                    description: document.getElementById('modalDesc').value.trim(),
                    dueDate:     document.getElementById('modalDueDate').value || null,
                    priority:    document.getElementById('modalPriority').value,
                    category:    document.getElementById('modalCategory').value.trim() || 'General',
                    status:      document.getElementById('modalStatus').value,
                    completed:   document.getElementById('modalStatus').value === 'completed',
                    created:     Date.now(),
                    modified:    Date.now(),
                    type:        'todo'
                };
                await this.saveTodo(todo);
            } else {
                const todo = this.todos.find(t => t.id === this.editingId);
                if (!todo) return;

                todo.title       = title;
                todo.description = document.getElementById('modalDesc').value.trim();
                todo.dueDate     = document.getElementById('modalDueDate').value || null;
                todo.priority    = document.getElementById('modalPriority').value;
                todo.category    = document.getElementById('modalCategory').value.trim() || 'General';
                todo.status      = document.getElementById('modalStatus').value;
                todo.modified    = Date.now();

                await this.saveTodo(todo);
            }

            this.closeModal();
            this.render();
            this.updateStats();
        } catch (err) {
            alert('Error saving task: ' + err.message);
        }
    }

    _openModal() {
        document.getElementById('taskModal').classList.add('active');
        document.getElementById('modalOverlay').classList.add('active');
    }

    closeModal() {
        document.getElementById('taskModal').classList.remove('active');
        document.getElementById('modalOverlay').classList.remove('active');
        this.editingId = null;
    }

    /* =========================================
       INLINE CHIP DROPDOWNS
       ========================================= */

    showPriorityDropdown(event, todoId) {
        event.stopPropagation();
        const todo = this.todos.find(t => t.id === todoId);
        if (!todo) return;

        const options = [
            { value: 'high',   label: '🔴 High',   cls: '' },
            { value: 'medium', label: '🟡 Medium',  cls: '' },
            { value: 'low',    label: '🟢 Low',     cls: '' },
        ];

        const html = options.map(o => `
            <div class="dd-option ${todo.priority === o.value ? 'active' : ''}"
                 onclick="app._setPriority('${todoId}','${o.value}')">
                ${o.label}
            </div>
        `).join('');

        this._showDropdown(event.currentTarget, html);
    }

    showStatusDropdown(event, todoId) {
        event.stopPropagation();
        const todo = this.todos.find(t => t.id === todoId);
        if (!todo) return;

        const options = [
            { value: 'pending',   label: '⏳ Pending' },
            { value: 'completed', label: '✅ Completed' },
            { value: 'extended',  label: '📅 Extended' },
        ];

        const html = options.map(o => `
            <div class="dd-option ${todo.status === o.value ? 'active' : ''}"
                 onclick="app._setStatus('${todoId}','${o.value}')">
                ${o.label}
            </div>
        `).join('');

        this._showDropdown(event.currentTarget, html);
    }

    _showDropdown(anchor, html) {
        const dd = document.getElementById('inlineDropdown');
        dd.innerHTML = html;
        dd.style.display = 'block';

        const rect = anchor.getBoundingClientRect();
        const ddH  = dd.offsetHeight || 120;
        const spaceBelow = window.innerHeight - rect.bottom;

        let top  = rect.bottom + window.scrollY + 5;
        let left = rect.left   + window.scrollX;

        if (spaceBelow < ddH + 10) {
            top = rect.top + window.scrollY - ddH - 5;
        }

        // Clamp to viewport
        const maxLeft = window.innerWidth - 160;
        if (left > maxLeft) left = maxLeft;

        dd.style.top  = top  + 'px';
        dd.style.left = left + 'px';
    }

    _hideDropdown() {
        const dd = document.getElementById('inlineDropdown');
        if (dd) dd.style.display = 'none';
    }

    async _setPriority(todoId, priority) {
        this._hideDropdown();
        const todo = this.todos.find(t => t.id === todoId);
        if (!todo) return;
        todo.priority = priority;
        todo.modified = Date.now();
        await this.saveTodo(todo);
        this.render();
    }

    async _setStatus(todoId, status) {
        this._hideDropdown();
        const todo = this.todos.find(t => t.id === todoId);
        if (!todo) return;
        todo.status   = status;
        todo.modified = Date.now();
        await this.saveTodo(todo);
        this.render();
        this.updateStats();
    }

    /* =========================================
       FILTERING & SORTING
       ========================================= */

    filterByStatus(status, btn) {
        this.currentFilter = status;
        document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        this.render();
    }

    filterTodos() {
        this.render();
    }

    sortTodos(sortBy) {
        // Sort the underlying array so render picks it up
        if (sortBy === 'date') {
            this.todos.sort((a, b) => {
                const dA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
                const dB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                return dA - dB;
            });
        } else if (sortBy === 'priority') {
            const ord = { high: 0, medium: 1, low: 2 };
            this.todos.sort((a, b) => (ord[a.priority] ?? 1) - (ord[b.priority] ?? 1));
        } else if (sortBy === 'name') {
            this.todos.sort((a, b) => a.title.localeCompare(b.title));
        } else {
            // created / default
            this.todos.sort((a, b) => b.created - a.created);
        }
        this.render();
    }

    getFilteredTodos() {
        let list = [...this.todos];

        // Status filter
        if (this.currentFilter === 'active') {
            list = list.filter(t => t.status !== 'completed');
        } else if (this.currentFilter === 'completed') {
            list = list.filter(t => t.status === 'completed');
        }

        // Priority filter
        const pf = document.getElementById('priorityFilter')?.value;
        if (pf) list = list.filter(t => t.priority === pf);

        // Search
        const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
        if (q) {
            list = list.filter(t =>
                t.title.toLowerCase().includes(q) ||
                (t.description && t.description.toLowerCase().includes(q)) ||
                (t.category    && t.category.toLowerCase().includes(q))
            );
        }

        return list;
    }

    /* =========================================
       BULK OPERATIONS
       ========================================= */

    async clearCompleted() {
        const done = this.todos.filter(t => t.status === 'completed');
        if (!done.length) { alert('No completed tasks to clear.'); return; }
        if (!confirm(`Delete ${done.length} completed task(s)?`)) return;
        for (const t of done) await this.store.remove(t.id);
        await this.loadTodos();
        this.render();
        this.updateStats();
    }

    exportData() {
        try {
            const blob = new Blob([JSON.stringify({ exportDate: new Date().toISOString(), todos: this.todos }, null, 2)], { type: 'application/json' });
            const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `taskflow-export-${Date.now()}.json` });
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
        } catch (err) { alert('Export error: ' + err.message); }
    }

    async importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data  = JSON.parse(e.target.result);
                const todos = data.todos || (Array.isArray(data) ? data : []);
                if (!todos.length) { alert('No tasks found in file.'); return; }
                let n = 0;
                for (const t of todos) {
                    try { t.id = uuid(); await this.saveTodo(t); n++; } catch (_) {}
                }
                alert(`✓ Imported ${n} tasks!`);
                await this.loadTodos();
                this.render();
                this.updateStats();
                event.target.value = '';
            } catch (err) { alert('Import error: ' + err.message); }
        };
        reader.readAsText(file);
    }

    /* =========================================
       RENDER
       ========================================= */

    render() {
        const filtered = this.getFilteredTodos();
        const container = document.getElementById('todosList');

        if (!filtered.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎯</div>
                    <h3>${this.currentFilter === 'completed' ? 'No completed tasks' : 'No tasks found'}</h3>
                    <p>${this.currentFilter === 'active' ? 'All tasks are complete — great work!' : 'Click <strong>Create Task</strong> to get started'}</p>
                </div>`;
            return;
        }

        container.innerHTML = filtered.map(t => this._renderRow(t)).join('');
    }

    _renderRow(todo) {
        // Status
        const status    = todo.status || (todo.completed ? 'completed' : 'pending');
        const statusMap = {
            pending:   { label: 'Pending',   cls: 'chip-pending',   icon: '⏳' },
            completed: { label: 'Completed', cls: 'chip-completed', icon: '✅' },
            extended:  { label: 'Extended',  cls: 'chip-extended',  icon: '📅' },
        };
        const st = statusMap[status] || statusMap.pending;

        // Priority
        const priorityMap = {
            high:   { label: 'High',   cls: 'chip-high',   icon: '↑' },
            medium: { label: 'Medium', cls: 'chip-medium', icon: '–' },
            low:    { label: 'Low',    cls: 'chip-low',    icon: '↓' },
        };
        const pr = priorityMap[todo.priority] || priorityMap.medium;

        // Deadline
        const deadlineHtml = this._deadlineHtml(todo.dueDate, status === 'completed');

        // Row class
        const rowCls = status === 'completed' ? 'row-completed' : status === 'extended' ? 'row-extended' : '';

        // Description – truncate
        const desc = todo.description
            ? this._esc(todo.description).substring(0, 90) + (todo.description.length > 90 ? '…' : '')
            : '<span style="color:var(--text3)">—</span>';

        return `
        <div class="task-row ${rowCls}" data-id="${todo.id}">
            <div class="col-name-text" title="${this._esc(todo.title)}">${this._esc(todo.title)}</div>

            <div>
                <span class="chip ${pr.cls}" onclick="app.showPriorityDropdown(event,'${todo.id}')" title="Change priority">
                    ${pr.icon} ${pr.label}<span class="chip-caret">▾</span>
                </span>
            </div>

            <div>${deadlineHtml}</div>

            <div class="col-desc-text" title="${this._esc(todo.description || '')}">${desc}</div>

            <div>
                <span class="chip ${st.cls}" onclick="app.showStatusDropdown(event,'${todo.id}')" title="Change status">
                    ${st.icon} ${st.label}<span class="chip-caret">▾</span>
                </span>
            </div>

            <div class="col-actions-wrap">
                <button class="icon-btn" onclick="app.editTodo('${todo.id}')" title="Edit">✏️</button>
                <button class="icon-btn danger" onclick="app.deleteTodo('${todo.id}')" title="Delete">🗑</button>
            </div>
        </div>`;
    }

    _deadlineHtml(dueDate, isDone) {
        if (!dueDate) return `<span class="col-deadline-text empty">—</span>`;

        const today    = new Date(); today.setHours(0,0,0,0);
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const d        = new Date(dueDate); d.setHours(0,0,0,0);

        let label, cls;
        if (d.getTime() === today.getTime()) {
            label = 'Today';
            cls   = isDone ? '' : 'today';
        } else if (d.getTime() === tomorrow.getTime()) {
            label = 'Tmr';
            cls   = '';
        } else if (d < today && !isDone) {
            const days = Math.round((today - d) / 86400000);
            label = `${days}d ago`;
            cls   = 'overdue';
        } else {
            label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            cls   = '';
        }

        return `<span class="col-deadline-text ${cls}">${label}</span>`;
    }

    updateStats() {
        const total     = this.todos.length;
        const completed = this.todos.filter(t => t.status === 'completed').length;
        const active    = total - completed;
        document.getElementById('totalTodos').textContent     = total;
        document.getElementById('activeTodos').textContent    = active;
        document.getElementById('completedTodos').textContent = completed;
    }

    _esc(text) {
        if (!text) return '';
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }
}

/* =========================================
   BOOTSTRAP
   ========================================= */

let app;

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof dbManager === 'undefined') {
        console.error('WebDB Manager not loaded.');
        return;
    }
    app = new TodoApp();
    await app.init();
});
