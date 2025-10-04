/**
 * ExplorerX - Keyboard Shortcuts
 * Handles keyboard navigation and shortcuts
 */

(function() {
    'use strict';
    
    if (!window.ExplorerX) {
        console.error('ExplorerX core not loaded');
        return;
    }
    
    const shortcuts = {
        'ctrl+a': selectAll,
        'cmd+a': selectAll,
        'ctrl+c': () => copyToClipboard('copy'),
        'cmd+c': () => copyToClipboard('copy'),
        'ctrl+x': () => copyToClipboard('cut'),
        'cmd+x': () => copyToClipboard('cut'),
        'ctrl+v': pasteFromClipboard,
        'cmd+v': pasteFromClipboard,
        'delete': deleteSelected,
        'ctrl+n': createNewFolder,
        'cmd+n': createNewFolder,
        'f2': renameSelected,
        'ctrl+f': focusSearch,
        'cmd+f': focusSearch,
        'backspace': goToParent,
        'ctrl+p': toggleDualPane,
        'cmd+p': toggleDualPane,
        'f5': () => window.ExplorerX.refreshCurrentPane()
    };
    
    /**
     * Initialize keyboard shortcuts
     */
    window.ExplorerX_Keyboard = {
        init: function() {
            document.addEventListener('keydown', handleKeydown);
            console.log('ExplorerX keyboard shortcuts loaded');
        }
    };
    
    /**
     * Handle keydown events
     */
    function handleKeydown(e) {
        // Don't handle if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const key = getKeyCombo(e);
        const handler = shortcuts[key];
        
        if (handler) {
            e.preventDefault();
            handler();
        }
    }
    
    /**
     * Get key combination string
     */
    function getKeyCombo(e) {
        const parts = [];
        
        if (e.ctrlKey) parts.push('ctrl');
        if (e.metaKey) parts.push('cmd');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        
        const key = e.key.toLowerCase();
        if (key !== 'control' && key !== 'meta' && key !== 'alt' && key !== 'shift') {
            parts.push(key);
        }
        
        return parts.join('+');
    }
    
    /**
     * Select all items
     */
    function selectAll() {
        const pane = window.ExplorerX.state.currentPane;
        const paneEl = document.getElementById(`pane-${pane}`);
        const selectAllCheckbox = paneEl.querySelector('.select-all');
        selectAllCheckbox.checked = true;
        selectAllCheckbox.dispatchEvent(new Event('change'));
    }
    
    /**
     * Rename selected
     */
    function renameSelected() {
        const pane = window.ExplorerX.state.currentPane;
        const selected = window.ExplorerX.state.selection[pane];
        
        if (selected.length !== 1) {
            window.ExplorerX.showError('Please select exactly one item to rename');
            return;
        }
        
        const oldPath = selected[0];
        const oldName = oldPath.split('/').pop();
        const newName = prompt('Enter new name:', oldName);
        
        if (!newName || newName === oldName) return;
        
        window.ExplorerX.apiRequest('rename', { path: oldPath, newName })
            .then(response => {
                if (response.success) {
                    window.ExplorerX.showSuccess(`Renamed to "${newName}"`);
                    window.ExplorerX.loadDirectory(pane, window.ExplorerX.state.paths[pane]);
                } else {
                    window.ExplorerX.showError(response.error);
                }
            })
            .catch(error => {
                window.ExplorerX.showError(`Rename failed: ${error.message}`);
            });
    }
    
    /**
     * Focus search input
     */
    function focusSearch() {
        document.getElementById('search-input').focus();
    }
    
    /**
     * Go to parent directory
     */
    function goToParent() {
        const pane = window.ExplorerX.state.currentPane;
        const currentPath = window.ExplorerX.state.paths[pane];
        const rootPath = window.ExplorerXConfig.rootPath;
        
        if (currentPath === rootPath) return;
        
        const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
        window.ExplorerX.loadDirectory(pane, parentPath);
    }
    
    /**
     * Toggle dual pane
     */
    function toggleDualPane() {
        document.getElementById('btn-dual-pane').click();
    }
    
})();
