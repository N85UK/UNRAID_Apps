<?php
/* Service Start Script */

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    // Check if binary exists
    if (!file_exists('/usr/local/bin/filebrowser')) {
        throw new Exception('FileBrowser binary not found. Please install it first.');
    }
    
    $configDir = '/boot/config/plugins/file-manager';
    $configFile = "$configDir/filebrowser.json";
    
    if (!file_exists($configFile)) {
        throw new Exception('Configuration not found. Please setup admin user first.');
    }
    
    // Kill any existing processes
    exec('pkill -f filebrowser 2>/dev/null');
    sleep(1);
    
    // Create log directory
    $logDir = '/var/log/file-manager';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    // Start FileBrowser in background
    $logFile = "$logDir/filebrowser.log";
    $startCmd = "/usr/local/bin/filebrowser --config '$configFile' > '$logFile' 2>&1 &";
    exec($startCmd);
    
    // Wait a moment for startup
    sleep(3);
    
    // Check if it's running
    exec('pgrep -f filebrowser', $checkOutput, $checkReturn);
    
    if ($checkReturn === 0 && !empty($checkOutput)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'FileBrowser service started successfully',
            'pid' => $checkOutput[0]
        ]);
    } else {
        throw new Exception('Failed to start FileBrowser service');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>