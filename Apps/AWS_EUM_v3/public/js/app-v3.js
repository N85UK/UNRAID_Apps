// AWS EUM v3.0 Enhanced Frontend JavaScript with Real-time Features

// Global state management
const AppState = {
    isConnected: false,
    messageStats: {
        sent: 0,
        failed: 0,
        segments: 0,
        cost: 0
    },
    charts: {},
    theme: 'light',
    realTimeEnabled: true
};

// Utility functions
const Utils = {
    formatCurrency: (amount) => {
        if (amount === undefined || amount === null || isNaN(amount)) {
            return '$0.0000';
        }
        return `$${Number(amount).toFixed(4)}`;
    },
    formatNumber: (num) => num.toLocaleString(),
    debounce: (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    },
    showNotification: (message, type = 'info', duration = 5000) => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 400);
        }, duration);
    }
};

// Chart management
const ChartManager = {
    init() {
        this.initMessageChart();
        this.initSuccessChart();
    },

    initMessageChart() {
        const ctx = document.getElementById('messageChart');
        if (!ctx) return;

        AppState.charts.messageChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['6h ago', '5h ago', '4h ago', '3h ago', '2h ago', '1h ago', 'Now'],
                datasets: [{
                    label: 'Messages Sent',
                    data: [12, 19, 3, 5, 2, 3, 8],
                    borderColor: '#ff9900',
                    backgroundColor: 'rgba(255, 153, 0, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: undefined,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    },

    initSuccessChart() {
        const ctx = document.getElementById('successChart');
        if (!ctx) return;

        AppState.charts.successChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Successful', 'Failed'],
                datasets: [{
                    data: [95, 5],
                    backgroundColor: ['#28a745', '#dc3545'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },

    updateMessageChart(newData) {
        if (AppState.charts.messageChart && Array.isArray(newData)) {
            // Ensure data is valid and not causing scale issues
            const validData = newData.map(val => Math.max(0, Number(val) || 0));
            AppState.charts.messageChart.data.datasets[0].data = validData;
            AppState.charts.messageChart.update('none'); // Use 'none' to prevent animation issues
        }
    },

    updateSuccessChart(successRate, failureRate) {
        if (AppState.charts.successChart) {
            const validSuccess = Math.max(0, Math.min(100, Number(successRate) || 0));
            const validFailure = Math.max(0, Math.min(100, Number(failureRate) || 0));
            AppState.charts.successChart.data.datasets[0].data = [validSuccess, validFailure];
            AppState.charts.successChart.update('none'); // Use 'none' to prevent animation issues
        }
    },

    destroyCharts() {
        Object.values(AppState.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        AppState.charts = {};
    }
};

// Message handling
const MessageHandler = {
    async calculateMessageInfo(message) {
        try {
            const response = await fetch('/api/message-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            return await response.json();
        } catch (error) {
            console.error('Error calculating message info:', error);
            return this.fallbackCalculation(message);
        }
    },

    fallbackCalculation(message) {
        const length = message.length;
        const segments = length > 160 ? Math.ceil(length / 153) : 1;
        const cost = segments * 0.0075; // Approximate cost per segment
        
        return {
            length,
            segments,
            cost,
            is_multipart: segments > 1
        };
    },

    updateMessageDisplay(info, message) {
        const elements = {
            charCount: document.getElementById('charCount'),
            segmentCount: document.getElementById('segmentCount'),
            costEstimate: document.getElementById('costEstimate'),
            messageType: document.getElementById('messageType')
        };

        if (elements.charCount) elements.charCount.textContent = info.length;
        if (elements.segmentCount) elements.segmentCount.textContent = info.segments;
        if (elements.costEstimate) elements.costEstimate.textContent = Utils.formatCurrency(info.cost);
        if (elements.messageType) elements.messageType.textContent = info.is_multipart ? 'Multi-part' : 'Single';

        this.updatePreview(message, info);
    },

    updatePreview(message, info) {
        const preview = document.getElementById('messagePreview');
        const content = document.getElementById('previewContent');
        
        if (!preview || !content) return;

        if (message.length > 160) {
            preview.style.display = 'block';
            const segments = this.splitMessage(message);
            content.innerHTML = segments.map((segment, index) => `
                <div class="segment">
                    <div class="segment-header">Segment ${index + 1} of ${segments.length}</div>
                    <div class="segment-content">${segment}</div>
                </div>
            `).join('');
        } else {
            preview.style.display = 'none';
        }
    },

    splitMessage(message) {
        const segments = [];
        const maxLength = 153; // For multi-part SMS
        
        for (let i = 0; i < message.length; i += maxLength) {
            segments.push(message.slice(i, i + maxLength));
        }
        
        return segments;
    }
};

// Form handling
const FormHandler = {
    init() {
        console.log('📝 FormHandler.init() called');
        const form = document.getElementById('smsForm');
        const messageTextarea = document.getElementById('message');
        
        if (form) {
            console.log('✅ Form found, attaching submit listener');
            form.addEventListener('submit', this.handleSubmit.bind(this));
        } else {
            console.error('❌ Form element not found!');
        }
        
        if (messageTextarea) {
            messageTextarea.addEventListener('input', Utils.debounce(this.handleMessageInput.bind(this), 300));
        }
    },

    async handleMessageInput(event) {
        const message = event.target.value;
        const info = await MessageHandler.calculateMessageInfo(message);
        MessageHandler.updateMessageDisplay(info, message);
    },

    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        
        this.setLoading(true);
        
        try {
            const response = await fetch('/api/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                Utils.showNotification('Message sent successfully!', 'success');
                this.resetForm();
                this.updateStats(result);
                HistoryManager.refresh();
            } else {
                Utils.showNotification(result.error || 'Failed to send message', 'error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            Utils.showNotification('Network error - please try again', 'error');
        } finally {
            this.setLoading(false);
        }
    },

    setLoading(loading) {
        const sendBtn = document.getElementById('sendBtn');
        const btnText = document.getElementById('btnText');
        const btnLoading = document.getElementById('btnLoading');
        
        if (sendBtn) sendBtn.disabled = loading;
        if (btnText) btnText.style.display = loading ? 'none' : 'inline';
        if (btnLoading) btnLoading.style.display = loading ? 'inline' : 'none';
    },

    resetForm() {
        const form = document.getElementById('smsForm');
        if (form) {
            form.reset();
            MessageHandler.updateMessageDisplay({ length: 0, segments: 1, cost: 0, is_multipart: false }, '');
        }
    },

    updateStats(result) {
        AppState.messageStats.sent++;
        AppState.messageStats.segments += result.segments || 1;
        AppState.messageStats.cost += result.cost || 0;
        
        // Update charts with new data
        ChartManager.updateMessageChart([12, 19, 3, 5, 2, 3, AppState.messageStats.sent]);
    }
};

// History management
const HistoryManager = {
    async refresh() {
        try {
            const response = await fetch('/api/history');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            // Handle both old format (array) and new format (object with history property)
            const history = Array.isArray(result) ? result : (result.history || []);
            this.render(history);
        } catch (error) {
            console.error('Error refreshing history:', error);
            Utils.showNotification('Failed to refresh history', 'error');
            // Render empty state on error
            this.render([]);
        }
    },

    render(history) {
        const container = document.getElementById('historyContainer');
        if (!container) return;

        if (history.length === 0) {
            container.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-inbox"></i>
                    <p>No messages sent yet.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = history.map(msg => `
            <div class="history-item">
                <div class="history-header">
                    <span class="timestamp">
                        <i class="fas fa-clock"></i>
                        ${new Date(msg.timestamp).toLocaleString()}
                    </span>
                    <span class="originator">
                        <i class="fas fa-tag"></i>
                        ${msg.originator}
                    </span>
                </div>
                <div class="phone-number">
                    <i class="fas fa-phone"></i>
                    ${msg.destination}
                </div>
                <div class="message-body">${msg.message}</div>
                <div class="message-meta">
                    <span class="message-id">
                        <i class="fas fa-fingerprint"></i>
                        ID: ${msg.messageId}
                    </span>
                    <span class="message-segments">
                        <i class="fas fa-layer-group"></i>
                        ${msg.segments} segment${msg.segments !== 1 ? 's' : ''}
                    </span>
                    <span class="message-length">
                        <i class="fas fa-text-width"></i>
                        ${msg.length} chars
                    </span>
                </div>
            </div>
        `).join('');
    }
};

// Originator management
const OriginatorManager = {
    async refresh() {
        try {
            Utils.showNotification('Refreshing AWS originators...', 'info', 2000);
            
            const response = await fetch('/api/refresh-originators', {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                Utils.showNotification(`Refreshed ${result.count} originators from AWS`, 'success');
                this.updateDropdown(result.originators);
            } else {
                Utils.showNotification(result.error || 'Failed to refresh originators', 'error');
            }
        } catch (error) {
            console.error('Error refreshing originators:', error);
            Utils.showNotification('Failed to refresh originators', 'error');
        }
    },

    updateDropdown(originators) {
        const select = document.getElementById('originator');
        if (!select) return;

        select.innerHTML = '<option value="">Select a phone number or originator...</option>';
        
        Object.entries(originators).forEach(([label, info]) => {
            const option = document.createElement('option');
            option.value = info.value;
            option.textContent = label;
            select.appendChild(option);
        });
    }
};

// Real-time updates
const RealTimeManager = {
    intervalId: null,
    
    init() {
        if (!AppState.realTimeEnabled) return;
        
        // Fetch real data every 60 seconds instead of generating random data
        this.intervalId = setInterval(() => {
            this.fetchRealStats();
        }, 60000); // Update every 60 seconds
        
        // Initial fetch
        this.fetchRealStats();
    },

    async fetchRealStats() {
        try {
            // Fetch real message statistics from the API
            const response = await fetch('/api/stats');
            if (response.ok) {
                const text = await response.text();
                try {
                    const stats = JSON.parse(text);
                    this.updateChartsWithRealData(stats);
                } catch (parseError) {
                    console.error('Error parsing stats JSON:', parseError, 'Response:', text);
                    this.updateChartsWithFallbackData();
                }
            } else {
                console.warn(`Failed to fetch real stats (${response.status}):`, response.statusText);
                this.updateChartsWithFallbackData();
            }
        } catch (error) {
            console.error('Error fetching real stats:', error);
            this.updateChartsWithFallbackData();
        }
    },

    updateChartsWithRealData(stats) {
        // Update charts with real data from AWS
        if (stats.messageHistory) {
            ChartManager.updateMessageChart(stats.messageHistory);
        }
        if (stats.successRate !== undefined && stats.failureRate !== undefined) {
            ChartManager.updateSuccessChart(stats.successRate, stats.failureRate);
        }
    },

    updateChartsWithFallbackData() {
        // Use static fallback data instead of random expanding data
        const fallbackMessageData = [12, 15, 8, 10, 6, 9, 11];
        ChartManager.updateMessageChart(fallbackMessageData);
        ChartManager.updateSuccessChart(95, 5);
    },

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
};

// Global functions for template
function refreshOriginators() {
    OriginatorManager.refresh();
}

function refreshHistory() {
    HistoryManager.refresh();
}

// Application initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 AWS EUM v3.0 Enhanced UI loading...');
    
    // Initialize all modules
    FormHandler.init();
    ChartManager.init();
    RealTimeManager.init();
    
    // Initial data load
    setTimeout(() => {
        HistoryManager.refresh();
    }, 1000);
    
    console.log('✅ AWS EUM v3.0 Enhanced UI loaded successfully');
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    RealTimeManager.stop();
    ChartManager.destroyCharts();
});