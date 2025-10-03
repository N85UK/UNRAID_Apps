<?php
/* Admin Setup Script */

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    // Get POST data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    $username = $data['username'] ?? 'admin';
    $password = $data['password'] ?? 'admin';
    
    if (empty($username) || empty($password)) {
        throw new Exception('Username and password are required');
    }
    
    // Check if binary exists
    if (!file_exists('/usr/local/bin/filebrowser')) {
        throw new Exception('FileBrowser binary not found. Please install it first.');
    }
    
    // Create config directory
    $configDir = '/boot/config/plugins/file-manager';
    if (!is_dir($configDir)) {
        mkdir($configDir, 0755, true);
    }
    
    $dbFile = "$configDir/filebrowser.db";
    $configFile = "$configDir/filebrowser.json";
    
    // Stop any running processes
    exec('pkill -f filebrowser 2>/dev/null');
    sleep(1);
    
    // Remove existing database
    if (file_exists($dbFile)) {
        unlink($dbFile);
    }
    
    // Get port from settings
    $settings = parse_ini_file("$configDir/settings.cfg", true);
    $port = $settings['port'] ?? '8080';
    
    // Create configuration
    $config = [
        'port' => (int)$port,
        'baseURL' => '',
        'address' => '0.0.0.0',
        'log' => 'stdout',
        'database' => $dbFile,
        'root' => '/mnt/user',
        'signup' => false,
        'createUserDir' => false,
        'defaults' => [
            'scope' => '/mnt/user',
            'locale' => 'en',
            'viewMode' => 'list',
            'hideDotfiles' => false,
            'permissions' => [
                'admin' => false,
                'execute' => true,
                'create' => true,
                'rename' => true,
                'modify' => true,
                'delete' => true,
                'share' => true,
                'download' => true
            ]
        ]
    ];
    
    file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT));
    
    // Initialize database
    $initCmd = "/usr/local/bin/filebrowser --config '$configFile' config init 2>&1";
    exec($initCmd, $initOutput, $initReturn);
    
    if ($initReturn !== 0) {
        throw new Exception('Failed to initialize database: ' . implode('\n', $initOutput));
    }
    
    // Create admin user
    $userCmd = "/usr/local/bin/filebrowser --config '$configFile' users add '$username' '$password' --perm.admin 2>&1";
    exec($userCmd, $userOutput, $userReturn);
    
    if ($userReturn !== 0) {
        throw new Exception('Failed to create admin user: ' . implode('\n', $userOutput));
    }
    
    // Build URL
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $hostname = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost';
    $hostname = preg_replace('/:[0-9]+$/', '', $hostname);
    $url = "{$protocol}://{$hostname}:{$port}";
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Admin user created successfully',
        'username' => $username,
        'url' => $url
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>