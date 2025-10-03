<?php
/* Service Management Script for File Manager Plugin */

// Check if this is a valid request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}

// Simple service start - just try to start filebrowser directly
$output = array();
$return_var = 0;

// Check if filebrowser binary exists
if (!file_exists('/usr/local/bin/filebrowser')) {
    http_response_code(500);
    echo json_encode(array('status' => 'error', 'message' => 'FileBrowser binary not found. Please install it first.'));
    exit;
}

// Kill any existing filebrowser processes
exec('pkill -f filebrowser 2>/dev/null', $output, $return_var);

// Create config directory if it doesn't exist
$config_dir = '/boot/config/plugins/file-manager/config';
if (!is_dir($config_dir)) {
    mkdir($config_dir, 0755, true);
}

// Create filebrowser config
$config_file = $config_dir . '/filebrowser.json';
if (!file_exists($config_file)) {
    $config = array(
        'port' => 8080,
        'baseURL' => '',
        'address' => '0.0.0.0',
        'log' => 'stdout',
        'database' => $config_dir . '/filebrowser.db',
        'root' => '/mnt'
    );
    file_put_contents($config_file, json_encode($config, JSON_PRETTY_PRINT));
}

// Start filebrowser in background
$log_file = '/var/log/file-manager/filebrowser.log';
$log_dir = dirname($log_file);
if (!is_dir($log_dir)) {
    mkdir($log_dir, 0755, true);
}

$cmd = "/usr/local/bin/filebrowser --config '$config_file' > '$log_file' 2>&1 &";
exec($cmd, $output, $return_var);

// Give it a moment to start
sleep(2);

// Check if it's running
$check_cmd = "pgrep -f filebrowser";
exec($check_cmd, $check_output, $check_return);

if ($check_return === 0 && !empty($check_output)) {
    http_response_code(200);
    echo json_encode(array('status' => 'success', 'message' => 'FileBrowser service started successfully', 'pid' => $check_output[0]));
} else {
    http_response_code(500);
    echo json_encode(array('status' => 'error', 'message' => 'Failed to start FileBrowser service', 'output' => $output));
}
?>