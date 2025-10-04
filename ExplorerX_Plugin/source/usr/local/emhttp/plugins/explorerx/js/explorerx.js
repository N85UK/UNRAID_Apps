/**
 * ExplorerX - Main UI Controller
 * Handles file browser UI, navigation, and user interactions
 */

(function() {
    'use strict';
    
    // Application state
    const state = {
        currentPane: 'left',
        dualPaneMode: false,
        clipboard: {
            operation: null, // 'copy' or 'cut'
            items: []
        },
        selection: {
            left: [],
            right: []
        },
        paths: {
            left: window.ExplorerXConfig.currentPath,
            right: window.ExplorerXConfig.rootPath
        },
        sortBy: {
            left: { column: 'name', ascending: true },
            right: { column: 'name', ascending: true }
        }
    };
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    /**
     * Initialize the application
     */
    function init() {
        console.log('ExplorerX initializing...');
        
        // Setup event listeners
        setupToolbarEvents();
        setupPaneEvents();
        setupQuickLinks();
        setupContextMenu();
        
        // Load initial directory
        loadDirectory('left', state.paths.left);
        
        // Initialize keyboard shortcuts
        if (window.ExplorerX_Keyboard) {
            window.ExplorerX_Keyboard.init();
        }
        
        console.log('ExplorerX initialized');
    }
    
    /**
     * Setup toolbar button events
     */
    function setupToolbarEvents() {
        // Dual pane toggle
        document.getElementById('btn-dual-pane').addEventListener('click', toggleDualPane);
        
        // Refresh
        document.getElementById('btn-refresh').addEventListener('click', () => {
            refreshCurrentPane();
        });
        
        // New folder
        document.getElementById('btn-new-folder').addEventListener('click', createNewFolder);
        
        // Upload
        document.getElementById('btn-upload').addEventListener('click', () => {
            document.getElementById('file-upload-input').click();
        });
        
        // File upload handler
        document.getElementById('file-upload-input').addEventListener('change', handleFileUpload);
        
        // Download
        document.getElementById('btn-download').addEventListener('click', downloadSelected);
        
        // Copy/Cut/Paste/Delete
        document.getElementById('btn-copy').addEventListener('click', () => copyToClipboard('copy'));
        document.getElementById('btn-cut').addEventListener('click', () => copyToClipboard('cut'));
        document.getElementById('btn-paste').addEventListener('click', pasteFromClipboard);
        document.getElementById('btn-delete').addEventListener('click', deleteSelected);
        
        // ZIP and Checksum
        document.getElementById('btn-zip').addEventListener('click', createZipFromSelected);
        document.getElementById('btn-checksum').addEventListener('click', calculateChecksumForSelected);
        
        // Search
        document.getElementById('search-input').addEventListener('input', debounce(handleSearch, 300));
    }
    
    /**
     * Setup pane events
     */
    function setupPaneEvents() {
        setupPaneInteractions('left');
        setupPaneInteractions('right');
    }
    
    /**
     * Setup interactions for a specific pane
     */
    function setupPaneInteractions(pane) {
        const paneEl = document.getElementById(`pane-${pane}`);
        
        // Focus handling
        paneEl.addEventListener('click', () => {
            state.currentPane = pane;
            updateActivePaneIndicator();
        });
        
        // Select all checkbox
        const selectAllCheckbox = paneEl.querySelector('.select-all');
        selectAllCheckbox.addEventListener('change', (e) => {
            const checked = e.target.checked;
            const checkboxes = paneEl.querySelectorAll('.file-list tbody input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = checked;
                const path = cb.closest('tr').dataset.path;
                if (checked) {
                    addToSelection(pane, path);
                } else {
                    removeFromSelection(pane, path);
                }
            });
            updateToolbarButtons();
            updateStatusBar(pane);
        });
        
        // Sort headers
        const sortHeaders = paneEl.querySelectorAll('.sortable');
        sortHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                sortPane(pane, column);
            });
        });
    }
    
    /**
     * Setup quick links
     */
    function setupQuickLinks() {
        const links = document.querySelectorAll('.quick-link');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const path = link.dataset.path;
                loadDirectory(state.currentPane, path);
            });
        });
    }
    
    /**
     * Load directory contents
     */
    async function loadDirectory(pane, path) {
        try {
            showLoading(pane, true);
            
            const response = await apiRequest('list', { path });
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to load directory');
            }
            
            state.paths[pane] = response.data.path;
            renderDirectory(pane, response.data);
            updateBreadcrumb(pane, response.data.path);
            
        } catch (error) {
            showError(`Failed to load directory: ${error.message}`);
        } finally {
            showLoading(pane, false);
        }
    }
    
    /**
     * Render directory contents
     */
    function renderDirectory(pane, data) {
        const tbody = document.querySelector(`#file-list-${pane} tbody`);
        tbody.innerHTML = '';
        
        if (data.items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-directory">Empty directory</td></tr>';
            updateStatusBar(pane, { count: 0, size: 0 });
            return;
        }
        
        // Sort items (directories first, then by current sort)
        const sortedItems = sortItems(data.items, state.sortBy[pane]);
        
        // Calculate total size
        let totalSize = 0;
        
        sortedItems.forEach(item => {
            totalSize += item.size;
            const row = createFileRow(pane, item);
            tbody.appendChild(row);
        });
        
        updateStatusBar(pane, { count: data.items.length, size: totalSize });
    }
    
    /**
     * Create a file/directory row element
     */
    function createFileRow(pane, item) {
        const row = document.createElement('tr');
        row.dataset.path = item.path;
        row.dataset.type = item.type;
        row.classList.add('file-row');
        
        // Checkbox
        const checkboxCell = document.createElement('td');
        checkboxCell.className = 'col-checkbox';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                addToSelection(pane, item.path);
            } else {
                removeFromSelection(pane, item.path);
            }
            updateToolbarButtons();
            updateStatusBar(pane);
        });
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);
        
        // Icon
        const iconCell = document.createElement('td');
        iconCell.className = 'col-icon';
        iconCell.textContent = getFileIcon(item);
        row.appendChild(iconCell);
        
        // Name
        const nameCell = document.createElement('td');
        nameCell.className = 'col-name';
        const nameLink = document.createElement('a');
        nameLink.href = '#';
        nameLink.textContent = item.name;
        nameLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (item.type === 'directory') {
                loadDirectory(pane, item.path);
            } else {
                previewFile(item);
            }
        });
        nameCell.appendChild(nameLink);
        row.appendChild(nameCell);
        
        // Size
        const sizeCell = document.createElement('td');
        sizeCell.className = 'col-size';
        sizeCell.textContent = item.type === 'directory' ? '-' : item.size_formatted;
        row.appendChild(sizeCell);
        
        // Modified
        const modifiedCell = document.createElement('td');
        modifiedCell.className = 'col-modified';
        modifiedCell.textContent = item.modified_formatted;
        row.appendChild(modifiedCell);
        
        // Actions
        const actionsCell = document.createElement('td');
        actionsCell.className = 'col-actions';
        const actionsBtn = document.createElement('button');
        actionsBtn.className = 'btn-icon';
        actionsBtn.textContent = '⋮';
        actionsBtn.title = 'More actions';
        actionsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showContextMenu(e, item);
        });
        actionsCell.appendChild(actionsBtn);
        row.appendChild(actionsCell);
        
        // Right-click context menu
        row.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, item);
        });
        
        return row;
    }
    
    /**
     * Get appropriate icon for file/directory
     */
    function getFileIcon(item) {
        if (item.type === 'directory') {
            return '📁';
        }
        
        const ext = item.extension?.toLowerCase();
        const iconMap = {
            'txt': '📄',
            'doc': '📝', 'docx': '📝',
            'pdf': '📕',
            'xls': '📊', 'xlsx': '📊', 'csv': '📊',
            'zip': '🗜️', 'tar': '🗜️', 'gz': '🗜️', '7z': '🗜️', 'rar': '🗜️',
            'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'bmp': '🖼️', 'svg': '🖼️',
            'mp4': '🎬', 'avi': '🎬', 'mkv': '🎬', 'mov': '🎬',
            'mp3': '🎵', 'wav': '🎵', 'flac': '🎵', 'ogg': '🎵',
            'sh': '⚙️', 'bash': '⚙️',
            'js': '📜', 'json': '📜', 'html': '📜', 'css': '📜', 'php': '📜', 'py': '📜'
        };
        
        return iconMap[ext] || '📄';
    }
    
    /**
     * Update breadcrumb navigation
     */
    function updateBreadcrumb(pane, path) {
        const breadcrumb = document.getElementById(`breadcrumb-${pane}`);
        breadcrumb.innerHTML = '';
        
        const parts = path.split('/').filter(p => p);
        let currentPath = '';
        
        // Root
        const rootItem = document.createElement('a');
        rootItem.href = '#';
        rootItem.className = 'breadcrumb-item';
        rootItem.innerHTML = '<span class="icon">🏠</span>';
        rootItem.dataset.path = window.ExplorerXConfig.rootPath;
        rootItem.addEventListener('click', (e) => {
            e.preventDefault();
            loadDirectory(pane, rootItem.dataset.path);
        });
        breadcrumb.appendChild(rootItem);
        
        // Path parts
        parts.forEach((part, index) => {
            currentPath += '/' + part;
            
            const separator = document.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.textContent = '/';
            breadcrumb.appendChild(separator);
            
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'breadcrumb-item';
            item.textContent = part;
            item.dataset.path = currentPath;
            
            if (index < parts.length - 1) {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadDirectory(pane, item.dataset.path);
                });
            } else {
                item.classList.add('current');
            }
            
            breadcrumb.appendChild(item);
        });
    }
    
    /**
     * Toggle dual pane mode
     */
    function toggleDualPane() {
        state.dualPaneMode = !state.dualPaneMode;
        const rightPane = document.getElementById('pane-right');
        
        if (state.dualPaneMode) {
            rightPane.style.display = 'flex';
            if (!rightPane.querySelector('tbody tr:not(.loading)').length) {
                loadDirectory('right', state.paths.right);
            }
        } else {
            rightPane.style.display = 'none';
        }
    }
    
    /**
     * API request helper
     */
    async function apiRequest(action, data = {}) {
        const url = window.ExplorerXConfig.apiEndpoint;
        const csrfToken = window.ExplorerXConfig.csrfToken;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({ action, ...data })
        });
        
        return await response.json();
    }
    
    /**
     * Show loading state
     */
    function showLoading(pane, show) {
        const tbody = document.querySelector(`#file-list-${pane} tbody`);
        if (show) {
            tbody.innerHTML = '<tr class="loading"><td colspan="6"><div class="spinner"></div>Loading...</td></tr>';
        }
    }
    
    /**
     * Update status bar
     */
    function updateStatusBar(pane, stats) {
        const statusBar = document.querySelector(`#pane-${pane} .status-bar`);
        if (!stats) {
            // Calculate from current state
            const rows = document.querySelectorAll(`#file-list-${pane} tbody tr:not(.loading):not(.empty-directory)`);
            stats = { count: rows.length, size: 0 };
        }
        
        const selectedCount = state.selection[pane].length;
        
        statusBar.querySelector('.status-items').textContent = `${stats.count} items`;
        statusBar.querySelector('.status-selected').textContent = selectedCount > 0 ? `${selectedCount} selected` : '';
        statusBar.querySelector('.status-size').textContent = formatBytes(stats.size);
    }
    
    /**
     * Format bytes helper
     */
    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Show error message
     */
    function showError(message) {
        alert('Error: ' + message);
        console.error(message);
    }
    
    /**
     * Show success message
     */
    function showSuccess(message) {
        console.log('Success:', message);
    }
    
    /**
     * Debounce helper
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Export public API
    window.ExplorerX = {
        state,
        loadDirectory,
        refreshCurrentPane: () => loadDirectory(state.currentPane, state.paths[state.currentPane]),
        apiRequest,
        showError,
        showSuccess
    };
    
    // Stub implementations for missing functions (to be implemented in file-operations.js)
    function createNewFolder() { console.log('Create new folder - TODO'); }
    function handleFileUpload() { console.log('File upload - TODO'); }
    function downloadSelected() { console.log('Download - TODO'); }
    function copyToClipboard(operation) { console.log(`${operation} - TODO`); }
    function pasteFromClipboard() { console.log('Paste - TODO'); }
    function deleteSelected() { console.log('Delete - TODO'); }
    function createZipFromSelected() { console.log('ZIP - TODO'); }
    function calculateChecksumForSelected() { console.log('Checksum - TODO'); }
    function handleSearch() { console.log('Search - TODO'); }
    function setupContextMenu() { console.log('Context menu - TODO'); }
    function showContextMenu(e, item) { console.log('Show context - TODO'); }
    function previewFile(item) { console.log('Preview - TODO'); }
    function sortPane(pane, column) { console.log('Sort - TODO'); }
    function sortItems(items, sortBy) { return items; }
    function addToSelection(pane, path) { if (!state.selection[pane].includes(path)) state.selection[pane].push(path); }
    function removeFromSelection(pane, path) { state.selection[pane] = state.selection[pane].filter(p => p !== path); }
    function updateToolbarButtons() { console.log('Update buttons - TODO'); }
    function updateActivePaneIndicator() { console.log('Update pane - TODO'); }
    function refreshCurrentPane() { loadDirectory(state.currentPane, state.paths[state.currentPane]); }
    
})();
