<?php
/* Admin Setup Script for File Manager Plugin */

header('Content-Type: application/json');

// Check if this is a valid request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Get POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Default credentials if none provided
$username = $data['username'] ?? 'admin';
$password = $data['password'] ?? 'admin';

// Validate inputs
if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Username and password are required']);
    exit;
}

// Check if filebrowser binary exists
if (!file_exists('/usr/local/bin/filebrowser')) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'FileBrowser binary not found']);
    exit;
}

// Ensure config directory exists
$config_dir = '/boot/config/plugins/file-manager/config';
if (!is_dir($config_dir)) {
    mkdir($config_dir, 0755, true);
}

$config_file = $config_dir . '/filebrowser.json';
$db_file = $config_dir . '/filebrowser.db';

// Stop any running filebrowser processes
exec('pkill -f filebrowser 2>/dev/null');
sleep(1);

// Remove existing database to start fresh
if (file_exists($db_file)) {
    unlink($db_file);
}

// Get the configured port from settings
$config_dir = '/boot/config/plugins/file-manager/config';
$settings_file = $config_dir . '/settings.ini';
$port = 8080; // default
if (file_exists($settings_file)) {
    $settings = parse_ini_file($settings_file, true);
    $port = $settings['filemanager']['port'] ?? 8080;
}

// Create filebrowser config
$config = [
    'port' => (int)$port,
    'baseURL' => '',
    'address' => '0.0.0.0',
    'log' => 'stdout',
    'database' => $db_file,
    'root' => '/mnt',
    'signup' => false,
    'createUserDir' => false,
    'defaults' => [
        'scope' => '/mnt',
        'locale' => 'en',
        'viewMode' => 'list',
        'commands' => ['git', 'svn'],
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

file_put_contents($config_file, json_encode($config, JSON_PRETTY_PRINT));

// Initialize the database
$init_cmd = "/usr/local/bin/filebrowser --config '$config_file' config init 2>&1";
exec($init_cmd, $init_output, $init_return);

if ($init_return !== 0) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error', 
        'message' => 'Failed to initialize FileBrowser database',
        'output' => $init_output
    ]);
    exit;
}

// Create admin user
$user_cmd = "/usr/local/bin/filebrowser --config '$config_file' users add '$username' '$password' --perm.admin 2>&1";
exec($user_cmd, $user_output, $user_return);

if ($user_return !== 0) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error', 
        'message' => 'Failed to create admin user',
        'output' => $user_output
    ]);
    exit;
}

// Set user as administrator
$admin_cmd = "/usr/local/bin/filebrowser --config '$config_file' users update '$username' --perm.admin 2>&1";
exec($admin_cmd, $admin_output, $admin_return);

// Start FileBrowser service
$log_dir = '/var/log/file-manager';
if (!is_dir($log_dir)) {
    mkdir($log_dir, 0755, true);
}

$log_file = $log_dir . '/filebrowser.log';
$start_cmd = "/usr/local/bin/filebrowser --config '$config_file' > '$log_file' 2>&1 &";
exec($start_cmd);

// Give it a moment to start
sleep(3);

// Check if it's running
$check_cmd = "pgrep -f filebrowser";
exec($check_cmd, $check_output, $check_return);

// Get the configured port from settings
$config_dir = '/boot/config/plugins/file-manager/config';
$settings_file = $config_dir . '/settings.ini';
$port = 8080; // default
if (file_exists($settings_file)) {
    $settings = parse_ini_file($settings_file, true);
    $port = $settings['filemanager']['port'] ?? 8080;
}

// Build the URL dynamically
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost';
$filemanager_url = "{$protocol}://{$host}:{$port}";

if ($check_return === 0 && !empty($check_output)) {
    echo json_encode([
        'status' => 'success',
        'message' => 'FileBrowser configured and started successfully',
        'username' => $username,
        'url' => $filemanager_url,
        'pid' => $check_output[0]
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'FileBrowser configured but failed to start',
        'output' => $init_output
    ]);
}
?>