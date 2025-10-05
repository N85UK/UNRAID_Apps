<?php
/*
 * ExplorerX API - Simple File Browser
 */

// Prevent any output before headers
ob_start();

// Set headers
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

// Error handling
function safeError($message) {
    ob_clean();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    safeError("Error: $errstr");
});

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        safeError("Fatal error occurred");
    }
});

try {
    $action = $_GET['action'] ?? 'list';
    $path = $_GET['path'] ?? '/mnt';
    
    // Basic path safety
    $path = realpath($path);
    if (!$path || strpos($path, '/mnt') !== 0) {
        $path = '/mnt';
    }
    
    if ($action === 'list') {
        listDirectory($path);
    } else {
        throw new Exception('Unknown action: ' . $action);
    }
    
} catch (Exception $e) {
    safeError($e->getMessage());
}

function listDirectory($path) {
    if (!is_dir($path) || !is_readable($path)) {
        throw new Exception('Directory not accessible');
    }
    
    $items = [];
    
    try {
        $files = scandir($path);
        if ($files === false) {
            throw new Exception('Cannot read directory');
        }
        
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;
            
            $fullPath = $path . '/' . $file;
            
            // Skip if we can't access the file
            if (!file_exists($fullPath)) continue;
            
            $isDir = is_dir($fullPath);
            $size = $isDir ? 0 : (is_readable($fullPath) ? filesize($fullPath) : 0);
            $mtime = is_readable($fullPath) ? filemtime($fullPath) : 0;
            
            $items[] = [
                'name' => $file,
                'path' => $fullPath,
                'type' => $isDir ? 'directory' : 'file',
                'size' => $size ?: 0,
                'modified' => $mtime ?: 0
            ];
        }
        
        // Sort: directories first, then by name
        usort($items, function($a, $b) {
            if ($a['type'] !== $b['type']) {
                return $a['type'] === 'directory' ? -1 : 1;
            }
            return strcasecmp($a['name'], $b['name']);
        });
        
    } catch (Exception $e) {
        throw new Exception('Error reading directory: ' . $e->getMessage());
    }
    
    ob_clean();
    echo json_encode([
        'success' => true,
        'data' => [
            'path' => $path,
            'items' => $items,
            'count' => count($items)
        ]
    ]);
}
?>

