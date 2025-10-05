<?php
/*
 * ExplorerX API - Simple File Browser (Emergency Recovery Version)
 */

// Basic error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Prevent any output before headers
ob_start();

// Set headers with error handling
try {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-cache, must-revalidate');
} catch (Exception $e) {
    // Headers already sent, continue anyway
}

// Simple error response function
function safeError($message) {
    ob_clean();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $message, 'recovery' => true]);
    exit;
}

// Basic request handling
try {
    $action = $_GET['action'] ?? 'list';
    $path = $_GET['path'] ?? '/mnt';
    
    // Very basic path safety
    if (!$path || $path === '') {
        $path = '/mnt';
    }
    
    // Only allow listing for now
    if ($action === 'list') {
        listDirectory($path);
    } else {
        safeError('Only directory listing is available in recovery mode');
    }
    
} catch (Exception $e) {
    safeError('Request processing error: ' . $e->getMessage());
} catch (Error $e) {
    safeError('System error: ' . $e->getMessage());
}

function listDirectory($path) {
    try {
        // Basic path validation
        if (!is_dir($path) || !is_readable($path)) {
            throw new Exception('Directory not accessible: ' . $path);
        }
        
        $items = [];
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
            $size = $isDir ? 0 : (is_readable($fullPath) ? @filesize($fullPath) : 0);
            $mtime = is_readable($fullPath) ? @filemtime($fullPath) : 0;
            
            $items[] = [
                'name' => $file,
                'path' => $fullPath,
                'type' => $isDir ? 'directory' : 'file',
                'size' => $size ?: 0,
                'modified' => $mtime ?: 0
            ];
        }
        
        // Simple sort
        usort($items, function($a, $b) {
            if ($a['type'] !== $b['type']) {
                return $a['type'] === 'directory' ? -1 : 1;
            }
            return strcasecmp($a['name'], $b['name']);
        });
        
        ob_clean();
        echo json_encode([
            'success' => true,
            'recovery_mode' => true,
            'data' => [
                'path' => $path,
                'items' => $items,
                'count' => count($items)
            ]
        ]);
        
    } catch (Exception $e) {
        safeError('Directory listing error: ' . $e->getMessage());
    }
}
?>

