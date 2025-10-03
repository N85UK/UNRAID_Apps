<?php
/* Service Stop Script */

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    // Stop FileBrowser processes
    exec('pgrep -f filebrowser', $processes);
    
    if (empty($processes)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'FileBrowser service was not running'
        ]);
        exit;
    }
    
    // Kill processes
    exec('pkill -f filebrowser 2>/dev/null', $output, $return);
    sleep(2);
    
    // Verify stopped
    exec('pgrep -f filebrowser', $checkProcesses);
    
    if (empty($checkProcesses)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'FileBrowser service stopped successfully'
        ]);
    } else {
        throw new Exception('Failed to stop all FileBrowser processes');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>