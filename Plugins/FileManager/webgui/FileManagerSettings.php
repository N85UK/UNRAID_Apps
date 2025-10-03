<?PHP
/* Copyright 2024, N85UK
 * File Manager Settings Page
 */

$docroot ??= ($_SERVER['DOCUMENT_ROOT'] ?: '/usr/local/emhttp');
require_once "$docroot/webGui/include/Helpers.php";

// add translations
$_SERVER['REQUEST_URI'] = 'filemanager';
require_once "$docroot/webGui/include/Translations.php";

$plugin_cfg = parse_plugin_cfg('file-manager');
$config_file = '/boot/config/plugins/file-manager/config/settings.ini';

// Handle form submission
if ($_POST['action'] === 'save') {
  $new_config = [
    '[filemanager]',
    'enabled=' . ($_POST['enabled'] ?: 'yes'),
    'port=' . ($_POST['port'] ?: '8080'),
    'log_level=' . ($_POST['log_level'] ?: 'info'),
    '',
    '[security]',
    'rate_limit=' . ($_POST['rate_limit'] ?: '120'),
    'rate_window=' . ($_POST['rate_window'] ?: '60000'),
    'audit_enabled=' . ($_POST['audit_enabled'] ?: 'yes'),
    'max_file_size=' . ($_POST['max_file_size'] ?: '1073741824'),
    '',
    '[paths]',
    'virtual_roots_enabled=' . ($_POST['virtual_roots_enabled'] ?: 'yes'),
    '',
    '[ui]',
    'theme=' . ($_POST['theme'] ?: 'auto'),
    'locale=' . ($_POST['locale'] ?: 'en'),
  ];
  
  file_put_contents($config_file, implode("\n", $new_config));
  $saved = true;
}

// Load current configuration
$current_config = file_exists($config_file) ? parse_ini_file($config_file, true) : [];
$cfg = array_merge([
  'filemanager' => ['enabled' => 'yes', 'port' => '8080', 'log_level' => 'info'],
  'security' => ['rate_limit' => '120', 'rate_window' => '60000', 'audit_enabled' => 'yes', 'max_file_size' => '1073741824'],
  'paths' => ['virtual_roots_enabled' => 'yes'],
  'ui' => ['theme' => 'auto', 'locale' => 'en'],
], $current_config);
?>

<link type="text/css" rel="stylesheet" href="<?autov('/webGui/styles/jquery.ui.css')?>">
<link type="text/css" rel="stylesheet" href="<?autov('/plugins/file-manager/styles/file-manager.css')?>">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">

<div class="filemanager-container">
  <div class="title-header">
    <div class="title-main">
      <div class="title-icon">
        <i class="fas fa-cogs"></i>
      </div>
      <div class="title-text">
        <h2>_(File Manager Settings)_</h2>
        <p class="subtitle">_(Configure your file manager preferences and security settings)_</p>
      </div>
    </div>
  </div>

  <?if (isset($saved)):?>
    <div class="status-card success">
      <div class="status-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <div class="status-content">
        <h3>_(Settings Saved)_</h3>
        <p>_(Your configuration has been updated successfully. Restart the service to apply changes.)_</p>
      </div>
    </div>
  <?endif;?>

  <form method="post" class="settings-form">
    <input type="hidden" name="action" value="save">
    
    <!-- General Settings -->
    <div class="settings-section">
      <div class="section-header">
        <i class="fas fa-sliders-h"></i>
        <h3>_(General Settings)_</h3>
      </div>
      
      <div class="form-grid">
        <div class="form-group">
          <label for="enabled">_(Service Status)_</label>
          <select name="enabled" id="enabled">
            <option value="yes" <?= $cfg['filemanager']['enabled'] === 'yes' ? 'selected' : '' ?>>_(Enabled)_</option>
            <option value="no" <?= $cfg['filemanager']['enabled'] === 'no' ? 'selected' : '' ?>>_(Disabled)_</option>
          </select>
          <small class="help-text">_(Enable or disable the file manager service)_</small>
        </div>

        <div class="form-group">
          <label for="port">_(Port Number)_</label>
          <input type="number" name="port" id="port" value="<?= htmlspecialchars($cfg['filemanager']['port']) ?>" min="1024" max="65535">
          <small class="help-text">_(Port number for the file manager service (1024-65535))_</small>
        </div>

        <div class="form-group">
          <label for="log_level">_(Log Level)_</label>
          <select name="log_level" id="log_level">
            <option value="error" <?= $cfg['filemanager']['log_level'] === 'error' ? 'selected' : '' ?>>_(Error)_</option>
            <option value="warn" <?= $cfg['filemanager']['log_level'] === 'warn' ? 'selected' : '' ?>>_(Warning)_</option>
            <option value="info" <?= $cfg['filemanager']['log_level'] === 'info' ? 'selected' : '' ?>>_(Info)_</option>
            <option value="debug" <?= $cfg['filemanager']['log_level'] === 'debug' ? 'selected' : '' ?>>_(Debug)_</option>
          </select>
          <small class="help-text">_(Level of detail for log messages)_</small>
        </div>
      </div>
    </div>

    <!-- Security Settings -->
    <div class="settings-section">
      <div class="section-header">
        <i class="fas fa-shield-alt"></i>
        <h3>_(Security Settings)_</h3>
      </div>
      
      <div class="form-grid">
        <div class="form-group">
          <label for="rate_limit">_(Rate Limit)_</label>
          <input type="number" name="rate_limit" id="rate_limit" value="<?= htmlspecialchars($cfg['security']['rate_limit']) ?>" min="10" max="1000">
          <small class="help-text">_(Maximum requests per minute per user)_</small>
        </div>

        <div class="form-group">
          <label for="rate_window">_(Rate Window (ms))_</label>
          <input type="number" name="rate_window" id="rate_window" value="<?= htmlspecialchars($cfg['security']['rate_window']) ?>" min="10000" max="300000">
          <small class="help-text">_(Time window for rate limiting in milliseconds)_</small>
        </div>

        <div class="form-group">
          <label for="audit_enabled">_(Audit Logging)_</label>
          <select name="audit_enabled" id="audit_enabled">
            <option value="yes" <?= $cfg['security']['audit_enabled'] === 'yes' ? 'selected' : '' ?>>_(Enabled)_</option>
            <option value="no" <?= $cfg['security']['audit_enabled'] === 'no' ? 'selected' : '' ?>>_(Disabled)_</option>
          </select>
          <small class="help-text">_(Log all file operations for security auditing)_</small>
        </div>

        <div class="form-group">
          <label for="max_file_size">_(Max File Size (bytes))_</label>
          <input type="number" name="max_file_size" id="max_file_size" value="<?= htmlspecialchars($cfg['security']['max_file_size']) ?>" min="1048576">
          <small class="help-text">_(Maximum file upload size in bytes (1MB minimum))_</small>
        </div>
      </div>
    </div>

    <!-- Path Settings -->
    <div class="settings-section">
      <div class="section-header">
        <i class="fas fa-folder-tree"></i>
        <h3>_(Path Settings)_</h3>
      </div>
      
      <div class="form-grid">
        <div class="form-group">
          <label for="virtual_roots_enabled">_(Virtual Roots)_</label>
          <select name="virtual_roots_enabled" id="virtual_roots_enabled">
            <option value="yes" <?= $cfg['paths']['virtual_roots_enabled'] === 'yes' ? 'selected' : '' ?>>_(Enabled)_</option>
            <option value="no" <?= $cfg['paths']['virtual_roots_enabled'] === 'no' ? 'selected' : '' ?>>_(Disabled)_</option>
          </select>
          <small class="help-text">_(Enable quick access shortcuts to common UNRAID paths)_</small>
        </div>
      </div>
    </div>

    <!-- UI Settings -->
    <div class="settings-section">
      <div class="section-header">
        <i class="fas fa-palette"></i>
        <h3>_(User Interface)_</h3>
      </div>
      
      <div class="form-grid">
        <div class="form-group">
          <label for="theme">_(Theme)_</label>
          <select name="theme" id="theme">
            <option value="auto" <?= $cfg['ui']['theme'] === 'auto' ? 'selected' : '' ?>>_(Auto)_</option>
            <option value="light" <?= $cfg['ui']['theme'] === 'light' ? 'selected' : '' ?>>_(Light)_</option>
            <option value="dark" <?= $cfg['ui']['theme'] === 'dark' ? 'selected' : '' ?>>_(Dark)_</option>
          </select>
          <small class="help-text">_(Color theme for the file manager interface)_</small>
        </div>

        <div class="form-group">
          <label for="locale">_(Language)_</label>
          <select name="locale" id="locale">
            <option value="en" <?= $cfg['ui']['locale'] === 'en' ? 'selected' : '' ?>>_(English)_</option>
            <option value="de" <?= $cfg['ui']['locale'] === 'de' ? 'selected' : '' ?>>_(German)_</option>
            <option value="fr" <?= $cfg['ui']['locale'] === 'fr' ? 'selected' : '' ?>>_(French)_</option>
            <option value="es" <?= $cfg['ui']['locale'] === 'es' ? 'selected' : '' ?>>_(Spanish)_</option>
          </select>
          <small class="help-text">_(Interface language for the file manager)_</small>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="form-actions">
      <button type="submit" class="btn btn-primary">
        <i class="fas fa-save"></i>
        <span>_(Save Settings)_</span>
      </button>
      <button type="button" onclick="resetForm()" class="btn btn-secondary">
        <i class="fas fa-undo"></i>
        <span>_(Reset)_</span>
      </button>
      <button type="button" onclick="restartService()" class="btn btn-outline">
        <i class="fas fa-sync-alt"></i>
        <span>_(Restart Service)_</span>
      </button>
    </div>
  </form>

  <!-- Advanced Settings Info -->
  <div class="info-card">
    <div class="info-header">
      <i class="fas fa-info-circle"></i>
      <h4>_(Advanced Configuration)_</h4>
    </div>
    <div class="info-content">
      <p>_(For advanced users, additional configuration options are available in the settings file:)_</p>
      <code>/boot/config/plugins/file-manager/config/settings.ini</code>
      <p>_(Restart the file manager service after making changes for them to take effect.)_</p>
    </div>
  </div>
</div>

<style>
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  background: var(--fm-bg-primary);
  border-radius: var(--fm-radius-lg);
  box-shadow: var(--fm-shadow);
  border: 1px solid var(--fm-border);
  overflow: hidden;
}

.section-header {
  padding: 1.25rem;
  background: var(--fm-bg-tertiary);
  border-bottom: 1px solid var(--fm-border);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-header i {
  color: var(--fm-primary);
  font-size: 1.25rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--fm-text-primary);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--fm-text-primary);
  font-size: 0.875rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius);
  background: var(--fm-bg-primary);
  color: var(--fm-text-primary);
  font-size: 0.875rem;
  transition: var(--fm-transition);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--fm-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.help-text {
  color: var(--fm-text-secondary);
  font-size: 0.75rem;
  line-height: 1.4;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.status-card.success {
  border-color: var(--fm-success);
  background: rgba(16, 185, 129, 0.02);
  margin-bottom: 2rem;
}

.status-card.success .status-icon {
  background: rgba(16, 185, 129, 0.1);
  color: var(--fm-success);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    justify-content: stretch;
  }
  
  .form-actions .btn {
    flex: 1;
  }
}
</style>

<script>
function resetForm() {
  if (confirm('_(Are you sure you want to reset all settings to their current saved values?)_')) {
    location.reload();
  }
}

function restartService() {
  if (confirm('_(Restart the File Manager service to apply configuration changes?)_')) {
    showLoading('_(Restarting service)_...');
    
    fetch('/filemanager/admin/control', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'restart' })
    })
    .then(response => response.json())
    .then(data => {
      hideLoading();
      if (data.ok) {
        showNotification('_(Service restarted successfully)_', 'success');
      } else {
        showNotification('_(Failed to restart service: )_' + (data.message || '_(Unknown error)_'), 'error');
      }
    })
    .catch(error => {
      hideLoading();
      console.error('Error restarting service:', error);
      showNotification('_(Failed to restart service)_', 'error');
    });
  }
}

function showLoading(text) {
  // Simple loading implementation
  const btn = event.target;
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + text;
  btn.disabled = true;
  
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }, 3000);
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add('show'), 100);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 4000);
}

// Form validation
document.querySelector('.settings-form').addEventListener('submit', function(e) {
  const port = document.getElementById('port').value;
  const maxFileSize = document.getElementById('max_file_size').value;
  
  if (port < 1024 || port > 65535) {
    e.preventDefault();
    showNotification('_(Port number must be between 1024 and 65535)_', 'error');
    return;
  }
  
  if (maxFileSize < 1048576) {
    e.preventDefault();
    showNotification('_(Maximum file size must be at least 1MB (1048576 bytes))_', 'error');
    return;
  }
  
  showLoading('_(Saving settings)_...');
});
</script>