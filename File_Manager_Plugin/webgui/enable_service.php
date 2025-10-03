<?php
/* Service Enable Script */

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    $configDir = '/boot/config/plugins/file-manager';
    $configFile = "$configDir/settings.cfg";
    
    // Create config directory if needed
    if (!is_dir($configDir)) {
        mkdir($configDir, 0755, true);
    }
    
    // Update configuration
    $config = [
        'service' => 'enabled',
        'port' => '8080',
        'logging' => 'info'
    ];
    
    $configContent = '';
    foreach ($config as $key => $value) {
        $configContent .= "$key=\"$value\"\n";
    }
    
    file_put_contents($configFile, $configContent);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'File Manager service enabled'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>