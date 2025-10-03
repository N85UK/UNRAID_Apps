<?php
/* FileBrowser Binary Installation Script */

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Allow both GET and POST for testing
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

function logDebug($message) {
    $logFile = '/var/log/file-manager/install.log';
    $logDir = dirname($logFile);
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - $message\n", FILE_APPEND);
}

try {
    logDebug('Starting FileBrowser installation');
    
    // Check if binary already exists
    if (file_exists('/usr/local/bin/filebrowser')) {
        echo json_encode(['status' => 'success', 'message' => 'FileBrowser binary already installed']);
        exit;
    }
    
    // Detect architecture
    $arch = trim(shell_exec('uname -m'));
    logDebug("Detected architecture: $arch");
    
    switch ($arch) {
        case 'x86_64':
            $fbArch = 'amd64';
            break;
        case 'aarch64':
            $fbArch = 'arm64';
            break;
        case 'armv7l':
            $fbArch = 'armv7';
            break;
        default:
            throw new Exception("Unsupported architecture: $arch");
    }
    
    $version = 'v2.44.0';
    $downloadUrl = "https://github.com/filebrowser/filebrowser/releases/download/$version/linux-$fbArch-filebrowser.tar.gz";
    logDebug("Download URL: $downloadUrl");
    
    // Create temporary directory
    $tempDir = '/tmp/filebrowser_install_' . uniqid();
    mkdir($tempDir, 0755, true);
    logDebug("Created temp directory: $tempDir");
    
    // Download with curl
    $downloadCmd = "curl -L -f -o '$tempDir/filebrowser.tar.gz' '$downloadUrl' 2>&1";
    logDebug("Executing: $downloadCmd");
    exec($downloadCmd, $downloadOutput, $downloadReturn);
    
    if ($downloadReturn !== 0) {
        throw new Exception('Download failed: ' . implode('\n', $downloadOutput));
    }
    
    // Verify download
    if (!file_exists("$tempDir/filebrowser.tar.gz")) {
        throw new Exception('Downloaded file not found');
    }
    
    $fileSize = filesize("$tempDir/filebrowser.tar.gz");
    logDebug("Downloaded file size: $fileSize bytes");
    
    if ($fileSize < 1000) {
        throw new Exception('Downloaded file too small, likely an error');
    }
    
    // Extract
    $extractCmd = "cd '$tempDir' && tar -xzf filebrowser.tar.gz 2>&1";
    logDebug("Executing: $extractCmd");
    exec($extractCmd, $extractOutput, $extractReturn);
    
    if ($extractReturn !== 0) {
        throw new Exception('Extraction failed: ' . implode('\n', $extractOutput));
    }
    
    // Verify extraction
    if (!file_exists("$tempDir/filebrowser")) {
        throw new Exception('Extracted binary not found');
    }
    
    // Move to final location
    $moveCmd = "mv '$tempDir/filebrowser' '/usr/local/bin/filebrowser' 2>&1";
    logDebug("Executing: $moveCmd");
    exec($moveCmd, $moveOutput, $moveReturn);
    
    if ($moveReturn !== 0) {
        throw new Exception('Move failed: ' . implode('\n', $moveOutput));
    }
    
    // Set permissions
    chmod('/usr/local/bin/filebrowser', 0755);
    logDebug('Set binary permissions');
    
    // Cleanup
    exec("rm -rf '$tempDir'");
    logDebug('Cleaned up temporary files');
    
    // Verify installation
    if (file_exists('/usr/local/bin/filebrowser') && is_executable('/usr/local/bin/filebrowser')) {
        logDebug('Installation completed successfully');
        echo json_encode([
            'status' => 'success',
            'message' => 'FileBrowser binary installed successfully',
            'version' => $version,
            'path' => '/usr/local/bin/filebrowser'
        ]);
    } else {
        throw new Exception('Installation verification failed');
    }
    
} catch (Exception $e) {
    logDebug('Exception: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'log_file' => '/var/log/file-manager/install.log'
    ]);
}
?>