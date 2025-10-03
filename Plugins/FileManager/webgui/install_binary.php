<?php
/* Binary Installation Script for File Manager Plugin */

header('Content-Type: application/json');

// Check if this is a valid request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Function to log debug information
function debug_log($message) {
    $log_file = '/tmp/filebrowser_install.log';
    file_put_contents($log_file, date('Y-m-d H:i:s') . " - $message\n", FILE_APPEND);
}

try {
    debug_log('Starting FileBrowser installation');
    
    // Check if binary already exists
    if (file_exists('/usr/local/bin/filebrowser')) {
        debug_log('FileBrowser binary already exists');
        echo json_encode(['status' => 'success', 'message' => 'FileBrowser binary already installed']);
        exit;
    }
    
    // Determine architecture
    $arch = trim(shell_exec('uname -m'));
    debug_log("Detected architecture: $arch");
    
    switch ($arch) {
        case 'x86_64':
            $fb_arch = 'amd64';
            break;
        case 'aarch64':
            $fb_arch = 'arm64';
            break;
        case 'armv7l':
            $fb_arch = 'armv7';
            break;
        default:
            debug_log("Unsupported architecture: $arch");
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => "Unsupported architecture: $arch"]);
            exit;
    }
    
    $fb_version = 'v2.44.0';
    $fb_url = "https://github.com/filebrowser/filebrowser/releases/download/$fb_version/linux-$fb_arch-filebrowser.tar.gz";
    debug_log("Download URL: $fb_url");
    
    // Create temporary directory
    $temp_dir = '/tmp/filebrowser_install_' . uniqid();
    mkdir($temp_dir, 0755, true);
    debug_log("Created temp directory: $temp_dir");
    
    // Download with curl (more reliable than wget)
    $download_cmd = "curl -L -o '$temp_dir/filebrowser.tar.gz' '$fb_url'";
    debug_log("Executing: $download_cmd");
    exec($download_cmd . ' 2>&1', $download_output, $download_return);
    
    if ($download_return !== 0) {
        debug_log('Download failed: ' . implode('\n', $download_output));
        http_response_code(500);
        echo json_encode([
            'status' => 'error', 
            'message' => 'Failed to download FileBrowser binary',
            'details' => implode('\n', $download_output),
            'url' => $fb_url
        ]);
        exit;
    }
    
    // Verify download
    if (!file_exists("$temp_dir/filebrowser.tar.gz")) {
        debug_log('Downloaded file not found');
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Downloaded file not found']);
        exit;
    }
    
    $file_size = filesize("$temp_dir/filebrowser.tar.gz");
    debug_log("Downloaded file size: $file_size bytes");
    
    if ($file_size < 1000) {
        debug_log('Downloaded file too small, likely an error page');
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Downloaded file is too small, check URL']);
        exit;
    }
    
    // Extract
    $extract_cmd = "cd '$temp_dir' && tar -xzf filebrowser.tar.gz";
    debug_log("Executing: $extract_cmd");
    exec($extract_cmd . ' 2>&1', $extract_output, $extract_return);
    
    if ($extract_return !== 0) {
        debug_log('Extraction failed: ' . implode('\n', $extract_output));
        http_response_code(500);
        echo json_encode([
            'status' => 'error', 
            'message' => 'Failed to extract FileBrowser binary',
            'details' => implode('\n', $extract_output)
        ]);
        exit;
    }
    
    // Check if binary was extracted
    if (!file_exists("$temp_dir/filebrowser")) {
        debug_log('Extracted binary not found');
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Extracted binary not found']);
        exit;
    }
    
    // Move binary to final location
    $move_cmd = "mv '$temp_dir/filebrowser' '/usr/local/bin/filebrowser'";
    debug_log("Executing: $move_cmd");
    exec($move_cmd . ' 2>&1', $move_output, $move_return);
    
    if ($move_return !== 0) {
        debug_log('Move failed: ' . implode('\n', $move_output));
        http_response_code(500);
        echo json_encode([
            'status' => 'error', 
            'message' => 'Failed to move binary to final location',
            'details' => implode('\n', $move_output)
        ]);
        exit;
    }
    
    // Set permissions
    chmod('/usr/local/bin/filebrowser', 0755);
    debug_log('Set binary permissions');
    
    // Cleanup
    exec("rm -rf '$temp_dir'");
    debug_log('Cleaned up temporary files');
    
    // Verify final installation
    if (file_exists('/usr/local/bin/filebrowser') && is_executable('/usr/local/bin/filebrowser')) {
        debug_log('Installation completed successfully');
        echo json_encode([
            'status' => 'success', 
            'message' => 'FileBrowser binary installed successfully',
            'version' => $fb_version,
            'path' => '/usr/local/bin/filebrowser'
        ]);
    } else {
        debug_log('Installation verification failed');
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Installation completed but binary verification failed']);
    }
    
} catch (Exception $e) {
    debug_log('Exception: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error', 
        'message' => 'Installation error: ' . $e->getMessage(),
        'log_file' => '/tmp/filebrowser_install.log'
    ]);
}
?>