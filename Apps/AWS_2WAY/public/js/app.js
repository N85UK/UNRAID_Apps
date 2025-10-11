// WebSocket connection
let ws;
let currentConversation = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Initialize WebSocket
function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('✅ WebSocket connected');
        reconnectAttempts = 0;
        updateConnectionStatus(true);
    };

    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            console.log('📨 WebSocket message:', message);
            
            if (message.type === 'message') {
                handleNewMessage(message.data);
            }
        } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
        }
    };

    ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        updateConnectionStatus(false);
        
        // Attempt to reconnect
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            console.log(`Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
            setTimeout(connectWebSocket, 3000);
        }
    };
}

// Update connection status UI
function updateConnectionStatus(connected) {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    if (connected) {
        statusDot.classList.add('connected');
        statusText.textContent = 'Connected';
    } else {
        statusDot.classList.remove('connected');
        statusText.textContent = 'Disconnected';
    }
}

// Handle new incoming message
function handleNewMessage(message) {
    // Update stats
    updateStats();
    
    // Refresh conversations list
    loadConversations();
    
    // If viewing this conversation, append message
    const conversationPhone = message.direction === 'inbound' 
        ? message.from_number 
        : message.to_number;
    
    if (currentConversation === conversationPhone) {
        appendMessageToUI(message);
    }
    
    // Show notification
    if (message.direction === 'inbound') {
        showNotification('New Message', `From ${message.from_number}: ${message.body}`);
    }
}

// Show browser notification
function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
    }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Load conversations
async function loadConversations() {
    try {
        const response = await fetch('/api/conversations');
        const data = await response.json();
        
        if (data.success) {
            renderConversations(data.conversations);
        }
    } catch (error) {
        console.error('❌ Error loading conversations:', error);
    }
}

// Render conversations list
function renderConversations(conversations) {
    const list = document.getElementById('conversationsList');
    
    if (conversations.length === 0) {
        list.innerHTML = `
            <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
                No conversations yet
            </div>
        `;
        return;
    }
    
    list.innerHTML = conversations.map(conv => `
        <div class="conversation-item ${conv.phone_number === currentConversation ? 'active' : ''}" 
             data-phone="${conv.phone_number}">
            <div class="conversation-phone">
                <span>${conv.phone_number}</span>
                ${conv.unread_count > 0 ? `<span class="unread-badge">${conv.unread_count}</span>` : ''}
            </div>
            <div class="conversation-preview">${conv.last_message || 'No messages'}</div>
            <div class="conversation-time">${formatTimestamp(conv.last_message_time)}</div>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.addEventListener('click', () => {
            const phone = item.dataset.phone;
            loadConversation(phone);
        });
    });
}

// Load conversation messages
async function loadConversation(phoneNumber) {
    try {
        currentConversation = phoneNumber;
        
        const response = await fetch(`/api/conversations/${encodeURIComponent(phoneNumber)}/messages`);
        const data = await response.json();
        
        if (data.success) {
            renderMessages(data.messages, phoneNumber);
        }
        
        // Refresh conversations to update unread count
        loadConversations();
    } catch (error) {
        console.error('❌ Error loading conversation:', error);
    }
}

// Render messages
function renderMessages(messages, phoneNumber) {
    const container = document.getElementById('messagesContainer');
    const header = document.getElementById('messagesHeader');
    const inputArea = document.getElementById('messageInputArea');
    
    // Update header
    header.innerHTML = `
        <div class="contact-name">${phoneNumber}</div>
    `;
    header.classList.add('active');
    
    // Show input area
    inputArea.style.display = 'block';
    
    // Set the "to" number in the form
    const fromSelect = document.getElementById('fromNumber');
    // Store the target number for sending
    inputArea.dataset.targetNumber = phoneNumber;
    
    // Render messages (reverse order - newest first from API, but display oldest first)
    if (messages.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💬</div>
                <h3>No messages yet</h3>
                <p>Start the conversation by sending a message</p>
            </div>
        `;
    } else {
        const reversed = messages.reverse();
        container.innerHTML = reversed.map(msg => `
            <div class="message ${msg.direction}">
                <div class="message-bubble">${escapeHtml(msg.body)}</div>
                <div class="message-time">${formatTimestamp(msg.timestamp)}</div>
            </div>
        `).join('');
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
}

// Append single message to UI
function appendMessageToUI(message) {
    const container = document.getElementById('messagesContainer');
    
    // Remove empty state if present
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.direction}`;
    messageEl.innerHTML = `
        <div class="message-bubble">${escapeHtml(message.body)}</div>
        <div class="message-time">${formatTimestamp(message.timestamp)}</div>
    `;
    
    container.appendChild(messageEl);
    container.scrollTop = container.scrollHeight;
}

// Send message form
document.getElementById('sendMessageForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const from = document.getElementById('fromNumber').value;
    const message = document.getElementById('messageInput').value;
    const inputArea = document.getElementById('messageInputArea');
    const to = inputArea.dataset.targetNumber;
    
    if (!from || !to || !message) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        const response = await fetch('/api/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to, message })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Clear input
            document.getElementById('messageInput').value = '';
            
            // Message will be added via WebSocket
            console.log('✅ Message sent:', data.messageId);
        } else {
            alert('Failed to send message: ' + data.error);
        }
    } catch (error) {
        console.error('❌ Error sending message:', error);
        alert('Failed to send message');
    }
});

// New conversation
document.getElementById('newConversationBtn').addEventListener('click', () => {
    document.getElementById('newConversationModal').classList.add('active');
});

document.getElementById('closeNewConversationModal').addEventListener('click', () => {
    document.getElementById('newConversationModal').classList.remove('active');
});

document.getElementById('newConversationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phone = document.getElementById('newConversationPhone').value;
    const from = document.getElementById('newConversationFrom').value;
    const message = document.getElementById('newConversationMessage').value;
    
    try {
        const response = await fetch('/api/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to: phone, message })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Close modal
            document.getElementById('newConversationModal').classList.remove('active');
            
            // Clear form
            document.getElementById('newConversationForm').reset();
            
            // Load the new conversation
            setTimeout(() => loadConversation(phone), 500);
        } else {
            alert('Failed to send message: ' + data.error);
        }
    } catch (error) {
        console.error('❌ Error sending message:', error);
        alert('Failed to send message');
    }
});

// Keywords management
document.getElementById('keywordsBtn').addEventListener('click', () => {
    document.getElementById('keywordsModal').classList.add('active');
    loadKeywords();
});

document.getElementById('closeKeywordsModal').addEventListener('click', () => {
    document.getElementById('keywordsModal').classList.remove('active');
});

async function loadKeywords() {
    try {
        const response = await fetch('/api/keywords');
        const data = await response.json();
        
        if (data.success) {
            renderKeywords(data.keywords);
        }
    } catch (error) {
        console.error('❌ Error loading keywords:', error);
    }
}

function renderKeywords(keywords) {
    const list = document.getElementById('keywordsList');
    
    if (keywords.length === 0) {
        list.innerHTML = `
            <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
                No keywords configured
            </div>
        `;
        return;
    }
    
    list.innerHTML = keywords.map(kw => `
        <div class="keyword-item">
            <div class="keyword-header">
                <span class="keyword-trigger">${escapeHtml(kw.trigger)}</span>
                <div class="keyword-actions">
                    <button class="btn btn-sm btn-secondary" onclick="toggleKeyword(${kw.id}, ${kw.active})">
                        ${kw.active ? '✅ Active' : '⏸️ Disabled'}
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteKeyword(${kw.id})">🗑️</button>
                </div>
            </div>
            <div class="keyword-response">${escapeHtml(kw.response)}</div>
        </div>
    `).join('');
}

document.getElementById('addKeywordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const trigger = document.getElementById('keywordTrigger').value;
    const response = document.getElementById('keywordResponse').value;
    
    try {
        const res = await fetch('/api/keywords', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trigger, response })
        });
        
        const data = await res.json();
        
        if (data.success) {
            // Clear form
            document.getElementById('addKeywordForm').reset();
            
            // Reload keywords
            loadKeywords();
        } else {
            alert('Failed to add keyword: ' + data.error);
        }
    } catch (error) {
        console.error('❌ Error adding keyword:', error);
        alert('Failed to add keyword');
    }
});

async function toggleKeyword(id, currentActive) {
    try {
        const response = await fetch(`/api/keywords/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: !currentActive })
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadKeywords();
        }
    } catch (error) {
        console.error('❌ Error toggling keyword:', error);
    }
}

async function deleteKeyword(id) {
    if (!confirm('Are you sure you want to delete this keyword?')) return;
    
    try {
        const response = await fetch(`/api/keywords/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadKeywords();
        }
    } catch (error) {
        console.error('❌ Error deleting keyword:', error);
    }
}

// Theme toggle
document.getElementById('themeToggle').addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    document.getElementById('themeToggle').textContent = newTheme === 'dark' ? '🌙' : '☀️';
});

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
document.getElementById('themeToggle').textContent = savedTheme === 'dark' ? '🌙' : '☀️';

// Update stats
async function updateStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('unreadCount').textContent = data.stats.unreadMessages;
        }
    } catch (error) {
        console.error('❌ Error updating stats:', error);
    }
}

// Utility functions
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) {
        return 'Just now';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} min ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Less than 7 days
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    // Format as date
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    connectWebSocket();
    loadConversations();
    
    // Refresh stats every 30 seconds
    setInterval(updateStats, 30000);
});
