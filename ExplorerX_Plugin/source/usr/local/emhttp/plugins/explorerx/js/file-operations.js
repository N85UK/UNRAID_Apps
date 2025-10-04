/**
 * ExplorerX - File Operations
 * Handles all file operation actions (copy, move, delete, upload, etc.)
 */

(function() {
    'use strict';
    
    if (!window.ExplorerX) {
        console.error('ExplorerX core not loaded');
        return;
    }
    
    const { state, apiRequest, showError, showSuccess, loadDirectory } = window.ExplorerX;
    
    /**
     * Create new folder
     */
    window.createNewFolder = async function() {
        const pane = state.currentPane;
        const path = state.paths[pane];
        
        const name = prompt('Enter folder name:');
        if (!name) return;
        
        try {
            const response = await apiRequest('mkdir', { path, name });
            
            if (response.success) {
                showSuccess(`Folder "${name}" created`);
                loadDirectory(pane, path);
            } else {
                showError(response.error);
            }
        } catch (error) {
            showError(`Failed to create folder: ${error.message}`);
        }
    };
    
    /**
     * Handle file upload
     */
    window.handleFileUpload = async function(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        const pane = state.currentPane;
        const destination = state.paths[pane];
        
        const formData = new FormData();
        formData.append('destination', destination);
        formData.append('csrf_token', window.ExplorerXConfig.csrfToken);
        
        for (let i = 0; i < files.length; i++) {
            formData.append('files[]', files[i]);
        }
        
        try {
            const response = await fetch(window.ExplorerXConfig.apiEndpoint, {
                method: 'POST',
                headers: {
                    'X-CSRF-Token': window.ExplorerXConfig.csrfToken
                },
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccess(`Uploaded ${result.data.count} file(s)`);
                loadDirectory(pane, destination);
                event.target.value = ''; // Reset input
            } else {
                showError(result.error);
            }
        } catch (error) {
            showError(`Upload failed: ${error.message}`);
        }
    };
    
    /**
     * Download selected files
     */
    window.downloadSelected = function() {
        const pane = state.currentPane;
        const selected = state.selection[pane];
        
        if (selected.length === 0) {
            showError('No files selected');
            return;
        }
        
        // For single file, direct download
        if (selected.length === 1) {
            const path = selected[0];
            const url = `/plugins/explorerx/include/download.php?path=${encodeURIComponent(path)}&csrf_token=${window.ExplorerXConfig.csrfToken}`;
            window.open(url, '_blank');
        } else {
            // For multiple files, create ZIP first
            showError('Multi-file download requires ZIP creation first');
        }
    };
    
    /**
     * Copy to clipboard
     */
    window.copyToClipboard = function(operation) {
        const pane = state.currentPane;
        const selected = state.selection[pane];
        
        if (selected.length === 0) {
            showError('No files selected');
            return;
        }
        
        state.clipboard.operation = operation;
        state.clipboard.items = [...selected];
        
        updateToolbarButtons();
        showSuccess(`${selected.length} item(s) ${operation === 'copy' ? 'copied' : 'cut'} to clipboard`);
    };
    
    /**
     * Paste from clipboard
     */
    window.pasteFromClipboard = async function() {
        if (state.clipboard.items.length === 0) {
            showError('Clipboard is empty');
            return;
        }
        
        const pane = state.currentPane;
        const destination = state.paths[pane];
        const operation = state.clipboard.operation;
        
        try {
            const action = operation === 'copy' ? 'copy' : 'move';
            const response = await apiRequest(action, {
                sources: state.clipboard.items,
                destination
            });
            
            if (response.success) {
                const count = response.data.count || 0;
                showSuccess(`${operation === 'copy' ? 'Copied' : 'Moved'} ${count} item(s)`);
                
                if (operation === 'cut') {
                    state.clipboard.items = [];
                    state.clipboard.operation = null;
                }
                
                loadDirectory(pane, destination);
                updateToolbarButtons();
            } else {
                showError(response.error);
            }
        } catch (error) {
            showError(`Paste failed: ${error.message}`);
        }
    };
    
    /**
     * Delete selected files
     */
    window.deleteSelected = async function() {
        const pane = state.currentPane;
        const selected = state.selection[pane];
        
        if (selected.length === 0) {
            showError('No files selected');
            return;
        }
        
        if (!confirm(`Delete ${selected.length} item(s)? This cannot be undone!`)) {
            return;
        }
        
        try {
            const response = await apiRequest('delete', { paths: selected });
            
            if (response.success) {
                const count = response.data.count || 0;
                showSuccess(`Deleted ${count} item(s)`);
                
                state.selection[pane] = [];
                loadDirectory(pane, state.paths[pane]);
                updateToolbarButtons();
            } else {
                showError(response.error);
            }
        } catch (error) {
            showError(`Delete failed: ${error.message}`);
        }
    };
    
    /**
     * Create ZIP from selected
     */
    window.createZipFromSelected = async function() {
        if (!window.ExplorerXConfig.enableZip) {
            showError('ZIP feature is disabled');
            return;
        }
        
        const pane = state.currentPane;
        const selected = state.selection[pane];
        
        if (selected.length === 0) {
            showError('No files selected');
            return;
        }
        
        const zipName = prompt('Enter ZIP filename:', `archive_${Date.now()}.zip`);
        if (!zipName) return;
        
        try {
            const destination = state.paths[pane] + '/' + zipName;
            const response = await apiRequest('zip', {
                paths: selected,
                destination
            });
            
            if (response.success) {
                showSuccess(`Created ${response.data.zipFile}`);
                loadDirectory(pane, state.paths[pane]);
            } else {
                showError(response.error);
            }
        } catch (error) {
            showError(`ZIP creation failed: ${error.message}`);
        }
    };
    
    /**
     * Calculate checksum for selected
     */
    window.calculateChecksumForSelected = async function() {
        if (!window.ExplorerXConfig.enableChecksums) {
            showError('Checksum feature is disabled');
            return;
        }
        
        const pane = state.currentPane;
        const selected = state.selection[pane];
        
        if (selected.length !== 1) {
            showError('Please select exactly one file');
            return;
        }
        
        const algorithm = prompt('Enter algorithm (md5, sha1, sha256):', 'md5');
        if (!algorithm) return;
        
        try {
            const response = await apiRequest('checksum', {
                path: selected[0],
                algorithm
            });
            
            if (response.success) {
                alert(`${algorithm.toUpperCase()}: ${response.data.checksum}`);
            } else {
                showError(response.error);
            }
        } catch (error) {
            showError(`Checksum failed: ${error.message}`);
        }
    };
    
    /**
     * Update toolbar buttons based on selection
     */
    window.updateToolbarButtons = function() {
        const pane = state.currentPane;
        const selectedCount = state.selection[pane].length;
        const hasClipboard = state.clipboard.items.length > 0;
        
        document.getElementById('btn-copy').disabled = selectedCount === 0;
        document.getElementById('btn-cut').disabled = selectedCount === 0;
        document.getElementById('btn-paste').disabled = !hasClipboard;
        document.getElementById('btn-delete').disabled = selectedCount === 0;
        document.getElementById('btn-download').disabled = selectedCount === 0;
        document.getElementById('btn-zip').disabled = selectedCount === 0;
        document.getElementById('btn-checksum').disabled = selectedCount !== 1;
    };
    
    console.log('ExplorerX file operations loaded');
    
})();
