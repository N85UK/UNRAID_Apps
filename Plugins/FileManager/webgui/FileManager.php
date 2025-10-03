<?PHP
/* Copyright 2024, N85UK
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 2,
 * as published by the Free Software Foundation.
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 */

$docroot ??= ($_SERVER['DOCUMENT_ROOT'] ?: '/usr/local/emhttp');
require_once "$docroot/webGui/include/Helpers.php";

// add translations
$_SERVER['REQUEST_URI'] = 'filemanager';
require_once "$docroot/webGui/include/Translations.php";

// Helper functions for UNRAID integration
function parse_plugin_cfg($plugin_name) {
  $cfg_file = "/boot/config/plugins/{$plugin_name}/settings.cfg";
  if (!file_exists($cfg_file)) {
    $cfg_file = "/usr/local/emhttp/plugins/{$plugin_name}/default.cfg";
  }
  
  if (file_exists($cfg_file)) {
    return parse_ini_file($cfg_file, false, INI_SCANNER_RAW);
  }
  
  return [];
}

function autov($path) {
  $version = @filemtime($_SERVER['DOCUMENT_ROOT'] . $path) ?: time();
  return $path . '?v=' . $version;
}

function plugin($attribute, $plugin_file) {
  if (!file_exists($plugin_file)) return 'Unknown';
  
  $content = file_get_contents($plugin_file);
  
  switch ($attribute) {
    case 'version':
      if (preg_match('/<!ENTITY version\s+"([^"]+)"/', $content, $matches)) {
        return $matches[1];
      }
      break;
    case 'author':
      if (preg_match('/<!ENTITY author\s+"([^"]+)"/', $content, $matches)) {
        return $matches[1];
      }
      break;
  }
  
  return 'Unknown';
}

$plugin_cfg = parse_plugin_cfg('file-manager');
$filemanager_enabled = $plugin_cfg['enabled'] ?? 'yes';
$filemanager_port = $plugin_cfg['port'] ?? '8080';
$filemanager_url = "http://{$_SERVER['HTTP_HOST']}:$filemanager_port";

function check_filemanager_status() {
  global $filemanager_port;
  $url = "http://127.0.0.1:$filemanager_port/api/ping";
  $context = stream_context_create([
    'http' => [
      'timeout' => 3,
      'method' => 'GET'
    ]
  ]);
  
  $result = @file_get_contents($url, false, $context);
  return $result !== false;
}

$filemanager_running = check_filemanager_status();
?>

<link type="text/css" rel="stylesheet" href="<?autov('/webGui/styles/jquery.ui.css')?>">\n<link type="text/css" rel="stylesheet" href="<?autov('/plugins/file-manager/styles/file-manager.css')?>">\n<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">\n\n<div class="filemanager-container">\n  <!-- Loading Overlay -->\n  <div id="loading-overlay" class="loading-overlay" style="display: none;">\n    <div class="loading-content">\n      <i class="fas fa-spinner fa-spin"></i>\n      <span id="loading-text">_(Loading)_...</span>\n    </div>\n  </div>\n\n  <div class="title-header">\n    <div class="title-main">\n      <div class="title-icon">\n        <i class="fas fa-folder-open"></i>\n      </div>\n      <div class="title-text">\n        <h2>_(File Manager)_</h2>\n        <p class="subtitle">_(Secure file management for your UNRAID server)_</p>\n      </div>\n    </div>\n    <div class="status-badge">\n      <?if ($filemanager_running):?>\n        <span class="status-indicator running">\n          <i class="fas fa-check-circle"></i>\n          <span>_(Running)_</span>\n        </span>\n      <?else:?>\n        <span class="status-indicator stopped">\n          <i class="fas fa-times-circle"></i>\n          <span>_(Stopped)_</span>\n        </span>\n      <?endif;?>\n    </div>\n  </div>

    <div class="main-content">\n    <?if ($filemanager_enabled === 'yes'):?>\n      <?if ($filemanager_running):?>\n        <!-- Action Bar -->\n        <div class="action-bar">\n          <div class="action-group primary">\n            <button type="button" onclick="refreshFileManager()" class="btn btn-primary" title="_(Refresh file manager)_">\n              <i class="fas fa-sync-alt"></i>\n              <span>_(Refresh)_</span>\n            </button>\n            <button type="button" onclick="openFileManagerNewTab()" class="btn btn-secondary" title="_(Open in new tab)_">\n              <i class="fas fa-external-link-alt"></i>\n              <span>_(New Tab)_</span>\n            </button>\n          </div>\n          <div class="action-group secondary">\n            <button type="button" onclick="toggleFullscreen()" class="btn btn-outline" title="_(Toggle fullscreen mode)_">\n              <i class="fas fa-expand" id="fullscreen-icon"></i>\n              <span id="fullscreen-text">_(Fullscreen)_</span>\n            </button>\n            <button type="button" onclick="showQuickHelp()" class="btn btn-outline" title="_(Show quick help)_">\n              <i class="fas fa-question-circle"></i>\n            </button>\n          </div>\n        </div>\n\n        <!-- File Manager Frame -->\n        <div class="filemanager-frame-container">\n          <div class="frame-loading" id="frame-loading">\n            <i class="fas fa-spinner fa-spin"></i>\n            <span>_(Loading File Manager)_...</span>\n          </div>\n          <iframe \n            id="filemanager-frame"\n            src="<?=$filemanager_url?>"\n            width="100%" \n            height="calc(100vh - 280px)"\n            frameborder="0"\n            onload="hideFrameLoading()">\n          </iframe>\n        </div>\n      <?else:?>\n        <div class="status-card error">\n          <div class="status-icon">\n            <i class="fas fa-exclamation-triangle"></i>\n          </div>\n          <div class="status-content">\n            <h3>_(Service Not Running)_</h3>\n            <p>_(The File Manager service is currently stopped. Start the service to access file management features.)_</p>\n            <div class="status-actions">\n              <button type="button" onclick="startFileManager()" class="btn btn-primary">\n                <i class="fas fa-play"></i>\n                <span>_(Start Service)_</span>\n              </button>\n              <button type="button" onclick="window.location.reload()" class="btn btn-secondary">\n                <i class="fas fa-sync-alt"></i>\n                <span>_(Refresh Page)_</span>\n              </button>\n            </div>\n          </div>\n        </div>\n      <?endif;?>\n    <?else:?>\n      <div class="status-card warning">\n        <div class="status-icon">\n          <i class="fas fa-info-circle"></i>\n        </div>\n        <div class="status-content">\n          <h3>_(Service Disabled)_</h3>\n          <p>_(File Manager is currently disabled. Enable it in the plugin configuration to access file management features.)_</p>\n          <div class="status-actions">\n            <button type="button" onclick="window.location.href='/Settings/PluginManager'" class="btn btn-primary">\n              <i class="fas fa-cog"></i>\n              <span>_(Plugin Settings)_</span>\n            </button>\n          </div>\n        </div>\n      </div>\n    <?endif;?>\n  </div>

    <!-- Info Cards -->\n  <div class="info-grid">\n    <div class="info-card">\n      <div class="info-header">\n        <i class="fas fa-info-circle"></i>\n        <h4>_(Service Information)_</h4>\n      </div>\n      <div class="info-content">\n        <div class="info-row">\n          <span class="label">_(Status)_:</span>\n          <span class="value">\n            <?if ($filemanager_running):?>\n              <span class="status-badge mini running">\n                <i class="fas fa-check-circle"></i>_(Running)_\n              </span>\n            <?else:?>\n              <span class="status-badge mini stopped">\n                <i class="fas fa-times-circle"></i>_(Stopped)_\n              </span>\n            <?endif;?>\n          </span>\n        </div>\n        <div class="info-row">\n          <span class="label">_(Port)_:</span>\n          <span class="value port-number"><?=$filemanager_port?></span>\n        </div>\n        <div class="info-row">\n          <span class="label">_(Version)_:</span>\n          <span class="value version-number"><?=plugin('version', '/boot/config/plugins/file-manager.plg')?></span>\n        </div>\n      </div>\n    </div>\n\n    <div class="info-card">\n      <div class="info-header">\n        <i class="fas fa-link"></i>\n        <h4>_(Quick Access)_</h4>\n      </div>\n      <div class="info-content">\n        <div class="quick-links">\n          <a href="<?=$filemanager_url?>" target="_blank" class="quick-link">\n            <i class="fas fa-external-link-alt"></i>\n            <div class="link-content">\n              <span class="link-title">_(Direct Access)_</span>\n              <span class="link-url"><?=$filemanager_url?></span>\n            </div>\n          </a>\n          <button onclick="copyToClipboard('<?=$filemanager_url?>')" class="quick-link copy-btn">\n            <i class="fas fa-copy"></i>\n            <div class="link-content">\n              <span class="link-title">_(Copy URL)_</span>\n              <span class="link-desc">_(Copy to clipboard)_</span>\n            </div>\n          </button>\n        </div>\n      </div>\n    </div>\n\n    <div class="info-card">\n      <div class="info-header">\n        <i class="fas fa-chart-line"></i>\n        <h4>_(Performance)_</h4>\n      </div>\n      <div class="info-content">\n        <div class="performance-stats">\n          <div class="stat-item">\n            <span class="stat-value" id="response-time">--</span>\n            <span class="stat-label">_(Response Time)_</span>\n          </div>\n          <div class="stat-item">\n            <span class="stat-value" id="uptime">--</span>\n            <span class="stat-label">_(Uptime)_</span>\n          </div>\n        </div>\n        <button onclick="refreshStats()" class="btn btn-mini">\n          <i class="fas fa-sync-alt"></i>_(Refresh)_\n        </button>\n      </div>\n    </div>\n  </div>"<?=$filemanager_url?>" target="_blank"><?=$filemanager_url?></a></td>
      </tr>
      <tr>
        <td>_(Plugin Version)_:</td>
        <td><?=plugin('version', '/boot/config/plugins/file-manager.plg')?></td>
      </tr>
    </table>
  </div>
</div>

</div>

<!-- Admin Setup Modal -->
<div id="admin-setup-modal" class="modal" style="display: none;">
  <div class="modal-content">
    <div class="modal-header">
      <h3>_(Setup File Manager Admin)_</h3>
      <button onclick="closeModal('admin-setup-modal')" class="close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      <div class="setup-section">
        <p>_(Create an admin user for the File Manager. This will allow you to login and manage files.)_</p>
        
        <div class="form-group">
          <label for="admin-username">_(Username)_:</label>
          <input type="text" id="admin-username" value="admin" placeholder="_(Enter username)_">
        </div>
        
        <div class="form-group">
          <label for="admin-password">_(Password)_:</label>
          <input type="password" id="admin-password" value="admin" placeholder="_(Enter password)_">
        </div>
        
        <div class="setup-actions">
          <button onclick="setupAdmin()" class="btn btn-primary">
            <i class="fas fa-user-plus"></i>
            _(Create Admin User)_
          </button>
          <button onclick="closeModal('admin-setup-modal')" class="btn btn-secondary">
            _(Cancel)_
          </button>
        </div>
        
        <div class="setup-info">
          <p><strong>_(Note)_:</strong> _(Default credentials are admin/admin. Please change them for security.)_</p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Quick Help Modal -->
<div id="help-modal" class="modal" style="display: none;">
  <div class="modal-content">
    <div class="modal-header">
      <h3>_(File Manager Quick Help)_</h3>
      <button onclick="closeModal('help-modal')" class="close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      <div class="help-section">
        <h4>_(Virtual Roots)_</h4>
        <ul>
          <li><strong>_(User Shares)_</strong>: _(Access all your UNRAID user shares)_</li>
          <li><strong>_(Cache Drive)_</strong>: _(Files stored on your cache drive)_</li>
          <li><strong>_(Array Disks)_</strong>: _(Individual disk access)_</li>
          <li><strong>_(Appdata)_</strong>: _(Docker container configurations)_</li>
        </ul>
      </div>
      <div class="help-section">
        <h4>_(Features)_</h4>
        <ul>
          <li>_(Upload files by dragging and dropping)_</li>
          <li>_(Create folders with right-click menu)_</li>
          <li>_(Download files by clicking the download icon)_</li>
          <li>_(Use search to find files quickly)_</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<script>
// Enhanced JavaScript with better error handling and UX improvements

let fileManagerUrl = '<?=$filemanager_url?>';
let statusCheckInterval = null;
let performanceCheckInterval = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeFileManager();
  startStatusMonitoring();
  startPerformanceMonitoring();
});

function initializeFileManager() {
  // Set up iframe error handling
  const iframe = document.getElementById('filemanager-frame');
  if (iframe) {
    iframe.addEventListener('load', function() {
      hideFrameLoading();
      checkIframeHealth();
    });
    
    iframe.addEventListener('error', function() {
      showFrameError();
    });
  }
}

function showLoading(text = '_(Loading)_...') {
  const overlay = document.getElementById('loading-overlay');
  const loadingText = document.getElementById('loading-text');
  if (overlay && loadingText) {
    loadingText.textContent = text;
    overlay.style.display = 'flex';
  }
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

function hideFrameLoading() {
  const frameLoading = document.getElementById('frame-loading');
  if (frameLoading) {
    frameLoading.style.display = 'none';
  }
}

function showFrameError() {
  const frameContainer = document.querySelector('.filemanager-frame-container');
  if (frameContainer) {
    frameContainer.innerHTML = `
      <div class="frame-error">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>_(Connection Error)_</h3>
        <p>_(Unable to load the file manager interface. Please check if the service is running.)_</p>
        <button onclick="retryConnection()" class="btn btn-primary">
          <i class="fas fa-sync-alt"></i>_(Retry)_
        </button>
      </div>
    `;
  }
}

function retryConnection() {
  showLoading('_(Reconnecting)_...');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

function openFileManagerNewTab() {
  window.open(fileManagerUrl, '_blank', 'noopener,noreferrer');
  
  // Track usage analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'file_manager_new_tab', {
      'event_category': 'user_interaction'
    });
  }
}

function refreshFileManager() {
  const iframe = document.getElementById('filemanager-frame');
  if (iframe) {
    showLoading('_(Refreshing)_...');
    
    // Add loading indicator to iframe
    const frameLoading = document.getElementById('frame-loading');
    if (frameLoading) {
      frameLoading.style.display = 'flex';
    }
    
    iframe.src = iframe.src;
    
    setTimeout(() => {
      hideLoading();
    }, 2000);
  }
}

function toggleFullscreen() {
  const container = document.querySelector('.filemanager-frame-container');
  const iframe = document.getElementById('filemanager-frame');
  const icon = document.getElementById('fullscreen-icon');
  const text = document.getElementById('fullscreen-text');
  
  if (!container || !iframe) return;
  
  if (container.classList.contains('fullscreen')) {
    // Exit fullscreen
    container.classList.remove('fullscreen');
    iframe.style.height = 'calc(100vh - 280px)';
    
    if (icon) icon.className = 'fas fa-expand';
    if (text) text.textContent = '_(Fullscreen)_';
    
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(console.error);
    }
  } else {
    // Enter fullscreen
    container.classList.add('fullscreen');
    iframe.style.height = '100vh';
    
    if (icon) icon.className = 'fas fa-compress';
    if (text) text.textContent = '_(Exit Fullscreen)_';
    
    if (container.requestFullscreen) {
      container.requestFullscreen().catch(console.error);
    }
  }
}

function startFileManager() {
  showLoading('_(Starting File Manager service)_...');
  
  fetch('/filemanager/admin/control', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'start' })
  })
  .then(response => response.json())
  .then(data => {
    hideLoading();
    if (data.ok) {
      showNotification('_(Service started successfully)_', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      showNotification('_(Failed to start service: )_' + (data.message || '_(Unknown error)_'), 'error');
    }
  })
  .catch(error => {
    hideLoading();
    console.error('Error starting File Manager:', error);
    showNotification('_(Failed to start File Manager service)_', 'error');
  });
}

function showQuickHelp() {
  document.getElementById('help-modal').style.display = 'flex';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('_(URL copied to clipboard)_', 'success');
  }).catch(() => {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showNotification('_(URL copied to clipboard)_', 'success');
  });
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Remove after 4 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 4000);
}

function startStatusMonitoring() {
  statusCheckInterval = setInterval(() => {
    const statusSpan = document.querySelector('.status-indicator.stopped');
    if (statusSpan) {
      // Only check if currently showing as stopped
      fetch('/filemanager/admin/status', {
        method: 'GET',
        credentials: 'include'
      })
      .then(response => response.json())
      .then(data => {
        if (data.status && data.status.running) {
          window.location.reload();
        }
      })
      .catch(error => {
        console.debug('Status check failed:', error);
      });
    }
  }, 30000); // Check every 30 seconds
}

function startPerformanceMonitoring() {
  refreshStats();
  performanceCheckInterval = setInterval(refreshStats, 60000); // Check every minute
}

function refreshStats() {
  const responseTimeEl = document.getElementById('response-time');
  const uptimeEl = document.getElementById('uptime');
  
  if (!responseTimeEl || !uptimeEl) return;
  
  // Measure response time
  const startTime = Date.now();
  fetch('/filemanager/admin/status', {
    method: 'GET',
    credentials: 'include'
  })
  .then(response => {
    const responseTime = Date.now() - startTime;
    responseTimeEl.textContent = responseTime + 'ms';
    
    return response.json();
  })
  .then(data => {
    if (data.status && data.status.lastStartTime) {
      const uptime = Date.now() - data.status.lastStartTime;
      uptimeEl.textContent = formatUptime(uptime);
    }
  })
  .catch(error => {
    responseTimeEl.textContent = '_(Error)_';
    uptimeEl.textContent = '_(Error)_';
  });
}

function formatUptime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function checkIframeHealth() {
  // Periodically check if iframe is responsive
  const iframe = document.getElementById('filemanager-frame');
  if (!iframe) return;
  
  try {
    // Try to access iframe content (will fail for cross-origin)
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (iframeDoc) {
      // If we can access it, everything is fine
      return;
    }
  } catch (e) {
    // Expected for cross-origin frames
  }
  
  // Check if iframe is still loading the correct URL
  setTimeout(() => {
    if (iframe.src !== fileManagerUrl) {
      iframe.src = fileManagerUrl;
    }
  }, 5000);
}

// Handle fullscreen change events
document.addEventListener('fullscreenchange', function() {
  const container = document.querySelector('.filemanager-frame-container');
  const icon = document.getElementById('fullscreen-icon');
  const text = document.getElementById('fullscreen-text');
  
  if (!document.fullscreenElement && container && container.classList.contains('fullscreen')) {
    // User exited fullscreen via ESC key
    container.classList.remove('fullscreen');
    const iframe = document.getElementById('filemanager-frame');
    if (iframe) iframe.style.height = 'calc(100vh - 280px)';
    
    if (icon) icon.className = 'fas fa-expand';
    if (text) text.textContent = '_(Fullscreen)_';
  }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // F11 for fullscreen
  if (e.key === 'F11') {
    e.preventDefault();
    toggleFullscreen();
  }
  
  // Ctrl+R for refresh
  if (e.ctrlKey && e.key === 'r') {
    e.preventDefault();
    refreshFileManager();
  }
  
  // ESC to close modals
  if (e.key === 'Escape') {
    const modals = document.querySelectorAll('.modal[style*="flex"]');
    modals.forEach(modal => modal.style.display = 'none');
  }
});

// Cleanup intervals when page unloads
window.addEventListener('beforeunload', function() {
  if (statusCheckInterval) clearInterval(statusCheckInterval);
  if (performanceCheckInterval) clearInterval(performanceCheckInterval);
});

// Admin Setup Functions
function showAdminSetup() {
  document.getElementById('admin-setup-modal').style.display = 'flex';
}

function setupAdmin() {
  const username = document.getElementById('admin-username').value || 'admin';
  const password = document.getElementById('admin-password').value || 'admin';
  
  if (!username || !password) {
    showNotification('_(Please enter both username and password)_', 'error');
    return;
  }
  
  showLoading('_(Setting up admin user)_...');
  
  fetch('/plugins/file-manager/setup_admin.php', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username: username, password: password })
  })
  .then(response => response.json())
  .then(data => {
    hideLoading();
    if (data.status === 'success') {
      closeModal('admin-setup-modal');
      showNotification('_(Admin user created successfully! You can now login with your credentials.)_', 'success');
      // Show login details
      showLoginInfo(data.username, data.url);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else {
      showNotification('_(Failed to setup admin: )_' + (data.message || '_(Unknown error)_'), 'error');
    }
  })
  .catch(error => {
    hideLoading();
    console.error('Error setting up admin:', error);
    showNotification('_(Failed to setup admin user)_', 'error');
  });
}

function showLoginInfo(username, url) {
  const notification = document.createElement('div');
  notification.className = 'notification success login-info';
  notification.innerHTML = `
    <div>
      <h4>_(Login Information)_</h4>
      <p><strong>_(URL)_:</strong> <a href="${url}" target="_blank">${url}</a></p>
      <p><strong>_(Username)_:</strong> ${username}</p>
      <p><strong>_(Password)_:</strong> _(As entered above)_</p>
    </div>
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add('show'), 100);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 8000);
}
</script>