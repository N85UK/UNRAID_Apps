/**
 * ExplorerX - Background Queue
 * Manages background tasks for long-running operations
 */

(function() {
    'use strict';
    
    if (!window.ExplorerX) {
        console.error('ExplorerX core not loaded');
        return;
    }
    
    const queue = {
        tasks: [],
        pollInterval: null
    };
    
    /**
     * Initialize background queue
     */
    function init() {
        setupTaskPanel();
        startPolling();
        console.log('ExplorerX background queue loaded');
    }
    
    /**
     * Setup task panel interactions
     */
    function setupTaskPanel() {
        const toggleBtn = document.getElementById('btn-toggle-tasks');
        const panel = document.getElementById('tasks-panel');
        
        toggleBtn.addEventListener('click', () => {
            panel.classList.toggle('collapsed');
            toggleBtn.querySelector('.icon').textContent = 
                panel.classList.contains('collapsed') ? '▲' : '▼';
        });
    }
    
    /**
     * Start polling for task updates
     */
    function startPolling() {
        // Poll every 2 seconds
        queue.pollInterval = setInterval(pollTasks, 2000);
    }
    
    /**
     * Stop polling
     */
    function stopPolling() {
        if (queue.pollInterval) {
            clearInterval(queue.pollInterval);
            queue.pollInterval = null;
        }
    }
    
    /**
     * Poll for task updates
     */
    async function pollTasks() {
        // Placeholder - in full implementation, this would query the server
        // for active background tasks and update the UI
    }
    
    /**
     * Add task to queue
     */
    function addTask(task) {
        queue.tasks.push(task);
        updateTaskPanel();
    }
    
    /**
     * Remove task from queue
     */
    function removeTask(taskId) {
        queue.tasks = queue.tasks.filter(t => t.id !== taskId);
        updateTaskPanel();
    }
    
    /**
     * Update task panel display
     */
    function updateTaskPanel() {
        const tasksList = document.getElementById('tasks-list');
        const taskCount = document.querySelector('.task-count');
        
        taskCount.textContent = queue.tasks.length;
        
        if (queue.tasks.length === 0) {
            tasksList.innerHTML = '<p class="no-tasks">No active tasks</p>';
            return;
        }
        
        tasksList.innerHTML = queue.tasks.map(task => `
            <div class="task-item" data-task-id="${task.id}">
                <div class="task-header">
                    <span class="task-name">${task.name}</span>
                    <span class="task-status">${task.status}</span>
                </div>
                <div class="task-progress">
                    <div class="progress-bar" style="width: ${task.progress}%"></div>
                </div>
            </div>
        `).join('');
    }
    
    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export API
    window.ExplorerX_Queue = {
        addTask,
        removeTask,
        tasks: queue.tasks
    };
    
})();
