<?php
/* Service Status Check */

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    $binaryExists = file_exists('/usr/local/bin/filebrowser');
    
    // Check if service is running
    exec('pgrep -f filebrowser', $processes);
    $running = !empty($processes);
    
    // Get port from config
    $configDir = '/boot/config/plugins/file-manager';
    $settings = parse_ini_file("$configDir/settings.cfg", true);
    $port = $settings['port'] ?? '8080';
    
    echo json_encode([
        'status' => 'success',
        'running' => $running,
        'binary_exists' => $binaryExists,
        'port' => $port,
        'pid' => $running ? $processes[0] : null
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>