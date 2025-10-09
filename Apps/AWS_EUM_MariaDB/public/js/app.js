// AWS EUM v2.0 Enhanced Frontend JavaScript

// Global variables
let segmentCount = 1;
let characterCount = 0;
let maxLength = 1600;
let isRefreshing = false;
let updateCheckInterval = null;
let lastUpdateCheck = 0;

console.log('🚀 AWS EUM v2.0 JavaScript loading...');

document.addEventListener('DOMContentLoaded', function() {
    const smsForm = document.getElementById('smsForm');
    const sendBtn = document.getElementById('sendBtn');
    const messageTextarea = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    const segmentInfo = document.getElementById('segmentInfo');
    const costEstimate = document.getElementById('costEstimate');
    const messagePreview = document.getElementById('messagePreview');
    const previewSegments = document.getElementById('previewSegments');
    const refreshOriginators = document.getElementById('refreshOriginators');
    const refreshHistory = document.getElementById('refreshHistory');

    let messageInfoCache = {};

    // Enhanced character counter with segment calculation
    messageTextarea?.addEventListener('input', async function() {
        const message = this.value;
        const count = message.length;
        
        // Update character count
        charCount.textContent = `${count} characters`;

        // Get message info from server
        if (message.length > 0) {
            try {
                const messageInfo = await getMessageInfo(message);
                updateMessageDisplay(messageInfo, message);
            } catch (error) {
                console.error('Error getting message info:', error);
                // Fallback to basic calculation
                const segments = message.length > 160 ? Math.ceil(message.length / 153) : 1;
                updateMessageDisplay({ segments, length: count, is_multipart: segments > 1 }, message);
            }
        } else {
            resetMessageDisplay();
        }
    });

    // Get message info from server
    async function getMessageInfo(message) {
        const cacheKey = message.length;
        if (messageInfoCache[cacheKey] && messageInfoCache[cacheKey].message === message) {
            return messageInfoCache[cacheKey].info;
        }

        const response = await fetch('/api/message-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (!response.ok) throw new Error('Failed to get message info');
        
        const info = await response.json();
        messageInfoCache[cacheKey] = { message, info };
        return info;
    }

    // Update message display with segment info
    function updateMessageDisplay(messageInfo, message) {
        const { segments, length, is_multipart, estimated_cost_multiplier } = messageInfo;

        // Update segment info
        segmentInfo.textContent = `${segments} SMS segment${segments > 1 ? 's' : ''}`;
        segmentInfo.className = segments > 1 ? 'segments-multiple' : 'segments-single';

        // Update cost estimate
        if (estimated_cost_multiplier > 1) {
            costEstimate.textContent = `${estimated_cost_multiplier}x cost`;
            costEstimate.style.display = 'inline';
        } else {
            costEstimate.style.display = 'none';
        }

        // Show preview for long messages
        if (is_multipart && message.length > 160) {
            showMessagePreview(message, messageInfo);
        } else {
            messagePreview.style.display = 'none';
        }

        // Color coding
        if (segments > 3) {
            charCount.style.color = '#dc3545'; // Red for very long
        } else if (segments > 1) {
            charCount.style.color = '#ffc107'; // Orange for multi-segment
        } else {
            charCount.style.color = '#28a745'; // Green for single segment
        }
    }

    // Reset message display
    function resetMessageDisplay() {
        segmentInfo.textContent = '1 SMS segment';
        segmentInfo.className = 'segments-single';
        costEstimate.style.display = 'none';
        messagePreview.style.display = 'none';
        charCount.style.color = '#666';
    }

    // Show message preview for long messages
    function showMessagePreview(message, messageInfo) {
        const maxLength = messageInfo.segments === 1 ? 160 : 153;
        const segments = [];
        
        for (let i = 0; i < message.length; i += maxLength) {
            segments.push(message.substring(i, i + maxLength));
        }

        previewSegments.innerHTML = segments.map((segment, index) => `
            <div class="segment">
                <div class="segment-header">Segment ${index + 1} (${segment.length} chars)</div>
                <div class="segment-content">${escapeHtml(segment)}</div>
            </div>
        `).join('');

        messagePreview.style.display = 'block';
    }

    // Form submission with enhanced error handling
    smsForm?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(smsForm);
        const data = {
            originator: formData.get('originator'),
            phoneNumber: formData.get('phoneNumber'),
            message: formData.get('message')
        };

        // Enhanced validation
        if (!data.originator || !data.phoneNumber || !data.message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (data.message.length > 1600) {
            showNotification('Message is too long (max 1600 characters)', 'error');
            return;
        }

        // Show loading state
        setLoadingState(true);

        try {
            const response = await fetch('/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const { messageId, messageInfo } = result;
                const segmentText = messageInfo.segments > 1 ? ` (${messageInfo.segments} segments)` : '';
                showNotification(`SMS sent successfully!${segmentText} Message ID: ${messageId}`, 'success');
                
                // Reset form
                smsForm.reset();
                resetMessageDisplay();

                // Refresh history after delay
                setTimeout(refreshMessageHistory, 2000);
            } else {
                if (response.status === 429) {
                    showNotification(`Rate limit exceeded. Try again in ${result.retryAfter} seconds.`, 'error');
                } else {
                    showNotification(result.error || 'Failed to send SMS', 'error');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Network error. Please check your connection and try again.', 'error');
        } finally {
            setLoadingState(false);
        }
    });

    // Loading state management
    function setLoadingState(loading) {
        if (!sendBtn) return;
        
        const btnText = sendBtn.querySelector('.btn-text');
        const btnLoading = sendBtn.querySelector('.btn-loading');
        
        sendBtn.disabled = loading;
        if (btnText) btnText.style.display = loading ? 'none' : 'inline';
        if (btnLoading) btnLoading.style.display = loading ? 'inline' : 'none';
    }

    // Refresh originators from AWS
    refreshOriginators?.addEventListener('click', async function() {
        this.disabled = true;
        this.textContent = '🔄 Refreshing...';

        try {
            const response = await fetch('/api/refresh-originators', {
                method: 'POST'
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showNotification(`Refreshed ${result.count} originators from AWS`, 'success');
                
                // Update originator dropdown
                const originatorSelect = document.getElementById('originator');
                if (originatorSelect) {
                    originatorSelect.innerHTML = '<option value="">Select a phone number or originator...</option>';
                    
                    if (result.originators && Object.keys(result.originators).length > 0) {
                        Object.entries(result.originators).forEach(([label, info]) => {
                            const option = document.createElement('option');
                            option.value = info.value;
                            option.textContent = label;
                            originatorSelect.appendChild(option);
                        });
                    }
                }
            } else {
                showNotification(result.error || 'Failed to refresh originators', 'error');
            }
        } catch (error) {
            console.error('Error refreshing originators:', error);
            showNotification('Failed to refresh phone numbers', 'error');
        } finally {
            this.disabled = false;
            this.textContent = '🔄 Refresh Numbers';
        }
    });

    // Refresh message history
    refreshHistory?.addEventListener('click', refreshMessageHistory);

    // Load originators on page load
    async function loadInitialOriginators() {
        try {
            console.log('🔄 Loading AWS originators...');
            const response = await fetch('/api/originators');
            const result = await response.json();

            if (response.ok && result.success) {
                console.log(`✅ Loaded ${result.count} originators from AWS`);
                
                // Update originator dropdown
                const originatorSelect = document.getElementById('originator');
                if (originatorSelect) {
                    originatorSelect.innerHTML = '<option value="">Select a phone number or originator...</option>';
                    
                    if (result.originators && Object.keys(result.originators).length > 0) {
                        Object.entries(result.originators).forEach(([label, info]) => {
                            const option = document.createElement('option');
                            option.value = info.value;
                            option.textContent = label;
                            originatorSelect.appendChild(option);
                        });
                        console.log('📋 Dropdown populated with originators');
                    } else {
                        console.log('⚠️ No originators available');
                    }
                }
            } else {
                console.error('❌ Failed to load originators:', result.error);
                showNotification(result.error || 'Failed to load AWS originators', 'error');
            }
        } catch (error) {
            console.error('❌ Error loading originators:', error);
            showNotification('Failed to connect to AWS service', 'error');
        }
    }

    // Load originators when page loads
    loadInitialOriginators();

    // Also check for updates and refresh status
    setTimeout(() => {
        checkForUpdates();
        refreshMessageHistory();
    }, 1000);

    async function refreshMessageHistory() {
        try {
            const response = await fetch('/history');
            const history = await response.json();

            const historyDiv = document.getElementById('history');
            if (historyDiv) {
                if (history.length === 0) {
                    historyDiv.innerHTML = '<p class="no-history">No messages sent yet.</p>';
                } else {
                    historyDiv.innerHTML = history.map(msg => `
                        <div class="history-item">
                            <div class="history-header">
                                <span class="timestamp">${new Date(msg.timestamp).toLocaleString()}</span>
                                <span class="originator">${escapeHtml(msg.originator)}</span>
                            </div>
                            <div class="phone-number">📱 ${escapeHtml(msg.phoneNumber)}</div>
                            <div class="message-body">${escapeHtml(msg.message)}</div>
                            <div class="message-meta">
                                ${msg.messageId ? `<span class="message-id">ID: ${escapeHtml(msg.messageId)}</span>` : ''}
                                ${msg.messageInfo ? `
                                    <span class="message-segments">${msg.messageInfo.segments} segment${msg.messageInfo.segments > 1 ? 's' : ''}</span>
                                    <span class="message-length">${msg.messageInfo.length} chars</span>
                                ` : ''}
                            </div>
                        </div>
                    `).join('');
                }
            }
            showNotification('History refreshed', 'success');
        } catch (error) {
            console.error('Error refreshing history:', error);
            showNotification('Failed to refresh history', 'error');
        }
    }

    // Enhanced notification system
    function showNotification(text, type) {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.textContent = text;
        notification.className = `notification ${type} show`;
        notification.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, 5000);
    }

    // Enhanced phone number formatting
    const phoneInput = document.getElementById('phoneNumber');
    phoneInput?.addEventListener('input', function() {
        let value = this.value.replace(/[^\d+]/g, '');

        if (value && !value.startsWith('+')) {
            value = '+' + value;
        }

        this.value = value;
    });

    // Auto-focus first input
    const firstInput = document.querySelector('input, select, textarea');
    if (firstInput && !firstInput.value) {
        firstInput.focus();
    }

    // Utility function
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Initialize update checking
    console.log('🔄 Setting up update checking...');
    setTimeout(checkForUpdates, 2000);
    setInterval(checkForUpdates, 4 * 60 * 60 * 1000);
    
    console.log('✅ AWS EUM v2.0 Frontend initialization complete');
});

// Simple notification function
function showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    // Create or update notification element
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Update checking functions
function checkForUpdates() {
    fetch('/api/updates/status')
        .then(response => response.json())
        .then(data => {
            if (data.available && data.version) {
                showUpdateNotification(data);
            }
        })
        .catch(error => {
            console.error('Error checking for updates:', error);
        });
}

function showUpdateNotification(updateInfo) {
    // Remove existing update notification
    const existing = document.querySelector('.update-notification');
    if (existing) existing.remove();
    
    // Create update notification
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-content">
            <div class="update-icon">🆕</div>
            <div class="update-text">
                <strong>Update Available!</strong><br>
                Version ${updateInfo.version} is now available<br>
                <small>Current version: ${updateInfo.currentVersion}</small>
            </div>
            <div class="update-actions">
                <button onclick="dismissUpdateNotification()" class="btn-dismiss">Dismiss</button>
                <button onclick="window.open('${updateInfo.url}', '_blank')" class="btn-update">View Release</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-show the notification
    setTimeout(() => notification.classList.add('show'), 100);
}

function dismissUpdateNotification() {
    const notification = document.querySelector('.update-notification');
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }
}

function manualUpdateCheck() {
    showNotification('Checking for updates...', 'info');
    
    fetch('/api/updates/check')
        .then(response => response.json())
        .then(data => {
            if (data.available) {
                showUpdateNotification(data);
                showNotification(`Update available: v${data.version}`, 'success');
            } else {
                showNotification('You have the latest version!', 'success');
            }
        })
        .catch(error => {
            console.error('Error checking for updates:', error);
            showNotification('Failed to check for updates', 'error');
        });
}

// Simple notification function
function showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    // Create or update notification element
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Initialize the application when DOM is loaded (integrated with main initialization)
// Note: Update checking is integrated into the main DOMContentLoaded listener above
