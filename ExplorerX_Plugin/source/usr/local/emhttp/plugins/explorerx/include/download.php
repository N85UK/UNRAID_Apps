<?php
/**
 * ExplorerX File Download Handler
 * Handles secure file downloads with CSRF protection
 */

require_once __DIR__ . '/ExplorerX.php';
require_once __DIR__ . '/security.php';

try {
    // Validate CSRF token
    $token = $_GET['csrf_token'] ?? null;
    if (!$token || !ExplorerX_Security::validateCSRFToken($token)) {
        throw new SecurityException('Invalid CSRF token');
    }
    
    // Get and validate path
    $path = $_GET['path'] ?? null;
    if (!$path) {
        throw new Exception('Path required');
    }
    
    $config = ExplorerX::loadConfig();
    $rootPath = $config['ROOT_PATH'];
    $path = ExplorerX_Security::sanitizePath($path, $rootPath);
    
    // Verify file exists
    if (!file_exists($path)) {
        throw new Exception('File not found');
    }
    
    // Don't allow directory downloads directly
    if (is_dir($path)) {
        throw new Exception('Cannot download directories directly. Create a ZIP first.');
    }
    
    // Get file info
    $fileName = basename($path);
    $fileSize = filesize($path);
    $mimeType = mime_content_type($path);
    
    // Log download
    ExplorerX::log('Downloaded file: ' . $path);
    
    // Set headers for download
    header('Content-Type: ' . $mimeType);
    header('Content-Disposition: attachment; filename="' . $fileName . '"');
    header('Content-Length: ' . $fileSize);
    header('Cache-Control: no-cache, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    // Disable compression for downloads
    if (function_exists('apache_setenv')) {
        apache_setenv('no-gzip', '1');
    }
    ini_set('zlib.output_compression', 'Off');
    
    // Clear output buffer
    if (ob_get_level()) {
        ob_end_clean();
    }
    
    // Stream the file
    $handle = fopen($path, 'rb');
    if ($handle === false) {
        throw new Exception('Failed to open file for reading');
    }
    
    while (!feof($handle)) {
        echo fread($handle, 8192);
        flush();
    }
    
    fclose($handle);
    exit;
    
} catch (SecurityException $e) {
    http_response_code(403);
    echo 'Security Error: ' . htmlspecialchars($e->getMessage());
    
} catch (Exception $e) {
    http_response_code(500);
    echo 'Error: ' . htmlspecialchars($e->getMessage());
}
