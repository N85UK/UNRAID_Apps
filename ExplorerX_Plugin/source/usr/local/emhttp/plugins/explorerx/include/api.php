<?php
/*
 * ExplorerX Simple API Endpoint
 * Handles AJAX requests for basic file operations
 */

header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

// Error handler to return JSON
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => "PHP Error: $errstr"]);
    exit;
});

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$path = $_GET['path'] ?? $_POST['path'] ?? '/mnt';

// Basic path sanitization
$path = realpath($path) ?: '/mnt';
if (strpos($path, '/mnt') !== 0) {
    $path = '/mnt';
}

try {
    switch ($action) {
        case 'list':
            listDirectory($path);
            break;
        
        case 'mkdir':
            $name = $_POST['name'] ?? '';
            createDirectory($path, $name);
            break;
        
        case 'delete':
            $items = $_POST['items'] ?? [];
            deleteItems($items);
            break;
        
        case 'rename':
            $oldName = $_POST['oldName'] ?? '';
            $newName = $_POST['newName'] ?? '';
            renameItem($path, $oldName, $newName);
            break;
        
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

function listDirectory($path) {
    if (!is_dir($path)) {
        throw new Exception('Directory not found');
    }
    
    $items = [];
    $handle = opendir($path);
    
    if ($handle) {
        while (($file = readdir($handle)) !== false) {
            if ($file === '.' || $file === '..') continue;
            
            $filePath = $path . '/' . $file;
            $stat = stat($filePath);
            
            $items[] = [
                'name' => $file,
                'path' => $filePath,
                'type' => is_dir($filePath) ? 'directory' : 'file',
                'size' => $stat['size'] ?? 0,
                'modified' => $stat['mtime'] ?? 0,
                'permissions' => substr(sprintf('%o', fileperms($filePath)), -4),
                'icon' => getFileIcon($file, is_dir($filePath))
            ];
        }
        closedir($handle);
    }
    
    // Sort: directories first, then by name
    usort($items, function($a, $b) {
        if ($a['type'] !== $b['type']) {
            return $a['type'] === 'directory' ? -1 : 1;
        }
        return strcasecmp($a['name'], $b['name']);
    });
    
    echo json_encode([
        'success' => true,
        'data' => [
            'path' => $path,
            'items' => $items
        ]
    ]);
}

function createDirectory($basePath, $name) {
    if (empty($name) || strpos($name, '/') !== false) {
        throw new Exception('Invalid directory name');
    }
    
    $newPath = $basePath . '/' . $name;
    if (file_exists($newPath)) {
        throw new Exception('Directory already exists');
    }
    
    if (!mkdir($newPath, 0755)) {
        throw new Exception('Failed to create directory');
    }
    
    echo json_encode(['success' => true, 'message' => 'Directory created']);
}

function deleteItems($items) {
    $deleted = 0;
    $errors = [];
    
    foreach ($items as $item) {
        $path = realpath($item);
        if (!$path || strpos($path, '/mnt') !== 0) {
            $errors[] = "Invalid path: $item";
            continue;
        }
        
        if (is_dir($path)) {
            if (rmdir($path)) {
                $deleted++;
            } else {
                $errors[] = "Failed to delete directory: " . basename($path);
            }
        } else {
            if (unlink($path)) {
                $deleted++;
            } else {
                $errors[] = "Failed to delete file: " . basename($path);
            }
        }
    }
    
    echo json_encode([
        'success' => empty($errors),
        'deleted' => $deleted,
        'errors' => $errors
    ]);
}

function renameItem($basePath, $oldName, $newName) {
    if (empty($oldName) || empty($newName)) {
        throw new Exception('Invalid file names');
    }
    
    $oldPath = $basePath . '/' . $oldName;
    $newPath = $basePath . '/' . $newName;
    
    if (!file_exists($oldPath)) {
        throw new Exception('Source file not found');
    }
    
    if (file_exists($newPath)) {
        throw new Exception('Target file already exists');
    }
    
    if (!rename($oldPath, $newPath)) {
        throw new Exception('Failed to rename file');
    }
    
    echo json_encode(['success' => true, 'message' => 'File renamed']);
}

function getFileIcon($filename, $isDir) {
    if ($isDir) {
        return 'folder';
    }
    
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    
    $iconMap = [
        'txt' => 'file-text',
        'log' => 'file-text',
        'conf' => 'file-text',
        'cfg' => 'file-text',
        'jpg' => 'file-image',
        'jpeg' => 'file-image',
        'png' => 'file-image',
        'gif' => 'file-image',
        'bmp' => 'file-image',
        'mp4' => 'file-video',
        'avi' => 'file-video',
        'mkv' => 'file-video',
        'mov' => 'file-video',
        'mp3' => 'file-audio',
        'wav' => 'file-audio',
        'flac' => 'file-audio',
        'zip' => 'file-archive',
        'rar' => 'file-archive',
        'tar' => 'file-archive',
        'gz' => 'file-archive',
        'pdf' => 'file-pdf',
        'doc' => 'file-word',
        'docx' => 'file-word',
        'xls' => 'file-excel',
        'xlsx' => 'file-excel'
    ];
    
    return $iconMap[$ext] ?? 'file';
}
?>

/**
 * Handle action routing
 */
function handleAction($action, $data, $config, $rootPath) {
    switch ($action) {
        case 'list':
            return handleList($data, $config, $rootPath);
            
        case 'info':
            return handleInfo($data, $rootPath);
            
        case 'mkdir':
            return handleMkdir($data, $rootPath);
            
        case 'rename':
            return handleRename($data, $rootPath);
            
        case 'delete':
            return handleDelete($data, $rootPath);
            
        case 'copy':
            return handleCopy($data, $rootPath);
            
        case 'move':
            return handleMove($data, $rootPath);
            
        case 'upload':
            return handleUpload($data, $rootPath);
            
        case 'download':
            return handleDownload($data, $rootPath);
            
        case 'zip':
            return handleZip($data, $rootPath, $config);
            
        case 'extract':
            return handleExtract($data, $rootPath, $config);
            
        case 'checksum':
            return handleChecksum($data, $rootPath, $config);
            
        case 'diskspace':
            return handleDiskSpace($data, $rootPath);
            
        case 'search':
            return handleSearch($data, $rootPath);
            
        default:
            throw new Exception('Unknown action: ' . $action);
    }
}

/**
 * Handle list directory
 */
function handleList($data, $config, $rootPath) {
    $path = $data['path'] ?? $rootPath;
    $path = ExplorerX_Security::sanitizePath($path, $rootPath);
    
    $showHidden = $config['SHOW_HIDDEN_FILES'] === 'true';
    $items = ExplorerX::listDirectory($path, $showHidden);
    
    // Add formatted sizes
    foreach ($items as &$item) {
        $item['size_formatted'] = ExplorerX::formatBytes($item['size']);
        $item['modified_formatted'] = date('Y-m-d H:i:s', $item['modified']);
    }
    
    return [
        'path' => $path,
        'items' => $items,
        'count' => count($items)
    ];
}

/**
 * Handle file/directory info
 */
function handleInfo($data, $rootPath) {
    $path = $data['path'] ?? null;
    if (!$path) {
        throw new Exception('Path required');
    }
    
    $path = ExplorerX_Security::sanitizePath($path, $rootPath);
    $info = ExplorerX::getFileInfo($path);
    
    // Add formatted values
    $info['size_formatted'] = ExplorerX::formatBytes($info['size']);
    $info['modified_formatted'] = date('Y-m-d H:i:s', $info['modified']);
    $info['accessed_formatted'] = date('Y-m-d H:i:s', $info['accessed']);
    $info['created_formatted'] = date('Y-m-d H:i:s', $info['created']);
    
    // Add directory size if applicable
    if ($info['type'] === 'directory') {
        $info['total_size'] = ExplorerX::getDirectorySize($path);
        $info['total_size_formatted'] = ExplorerX::formatBytes($info['total_size']);
    }
    
    return $info;
}

/**
 * Handle create directory
 */
function handleMkdir($data, $rootPath) {
    $path = $data['path'] ?? null;
    $name = $data['name'] ?? null;
    
    if (!$path || !$name) {
        throw new Exception('Path and name required');
    }
    
    $path = ExplorerX_Security::sanitizePath($path, $rootPath);
    ExplorerX_Security::validateFilename($name);
    
    $newPath = ExplorerX::createDirectory($path, $name);
    
    return [
        'path' => $newPath,
        'name' => $name
    ];
}

/**
 * Handle rename
 */
function handleRename($data, $rootPath) {
    $path = $data['path'] ?? null;
    $newName = $data['newName'] ?? null;
    
    if (!$path || !$newName) {
        throw new Exception('Path and new name required');
    }
    
    $path = ExplorerX_Security::sanitizePath($path, $rootPath);
    ExplorerX_Security::validateFilename($newName);
    
    $newPath = ExplorerX::rename($path, $newName);
    
    return [
        'oldPath' => $path,
        'newPath' => $newPath,
        'newName' => $newName
    ];
}

/**
 * Handle delete
 */
function handleDelete($data, $rootPath) {
    $paths = $data['paths'] ?? ($data['path'] ? [$data['path']] : null);
    
    if (!$paths) {
        throw new Exception('Path(s) required');
    }
    
    if (!is_array($paths)) {
        $paths = [$paths];
    }
    
    $deleted = [];
    $errors = [];
    
    foreach ($paths as $path) {
        try {
            $path = ExplorerX_Security::sanitizePath($path, $rootPath);
            
            // Extra safety check
            if (!ExplorerX_Security::isSafeToDelete($path, $rootPath)) {
                throw new SecurityException('Path is protected from deletion');
            }
            
            ExplorerX::delete($path);
            $deleted[] = $path;
            
        } catch (Exception $e) {
            $errors[] = [
                'path' => $path,
                'error' => $e->getMessage()
            ];
        }
    }
    
    return [
        'deleted' => $deleted,
        'errors' => $errors,
        'count' => count($deleted)
    ];
}

/**
 * Handle copy
 */
function handleCopy($data, $rootPath) {
    $sources = $data['sources'] ?? ($data['source'] ? [$data['source']] : null);
    $destination = $data['destination'] ?? null;
    
    if (!$sources || !$destination) {
        throw new Exception('Source(s) and destination required');
    }
    
    if (!is_array($sources)) {
        $sources = [$sources];
    }
    
    $destination = ExplorerX_Security::sanitizePath($destination, $rootPath);
    
    $copied = [];
    $errors = [];
    
    foreach ($sources as $source) {
        try {
            $source = ExplorerX_Security::sanitizePath($source, $rootPath);
            $result = ExplorerX::copy($source, $destination);
            $copied[] = [
                'source' => $source,
                'destination' => $result
            ];
            
        } catch (Exception $e) {
            $errors[] = [
                'source' => $source,
                'error' => $e->getMessage()
            ];
        }
    }
    
    return [
        'copied' => $copied,
        'errors' => $errors,
        'count' => count($copied)
    ];
}

/**
 * Handle move
 */
function handleMove($data, $rootPath) {
    $sources = $data['sources'] ?? ($data['source'] ? [$data['source']] : null);
    $destination = $data['destination'] ?? null;
    
    if (!$sources || !$destination) {
        throw new Exception('Source(s) and destination required');
    }
    
    if (!is_array($sources)) {
        $sources = [$sources];
    }
    
    $destination = ExplorerX_Security::sanitizePath($destination, $rootPath);
    
    $moved = [];
    $errors = [];
    
    foreach ($sources as $source) {
        try {
            $source = ExplorerX_Security::sanitizePath($source, $rootPath);
            $result = ExplorerX::move($source, $destination);
            $moved[] = [
                'source' => $source,
                'destination' => $result
            ];
            
        } catch (Exception $e) {
            $errors[] = [
                'source' => $source,
                'error' => $e->getMessage()
            ];
        }
    }
    
    return [
        'moved' => $moved,
        'errors' => $errors,
        'count' => count($moved)
    ];
}

/**
 * Handle file upload
 */
function handleUpload($data, $rootPath) {
    $destination = $data['destination'] ?? $_POST['destination'] ?? null;
    
    if (!$destination) {
        throw new Exception('Destination required');
    }
    
    $destination = ExplorerX_Security::sanitizePath($destination, $rootPath);
    
    if (!isset($_FILES['files'])) {
        throw new Exception('No files uploaded');
    }
    
    $uploaded = [];
    $errors = [];
    
    // Handle multiple files
    $files = $_FILES['files'];
    $fileCount = is_array($files['name']) ? count($files['name']) : 1;
    
    for ($i = 0; $i < $fileCount; $i++) {
        $file = [
            'name' => is_array($files['name']) ? $files['name'][$i] : $files['name'],
            'type' => is_array($files['type']) ? $files['type'][$i] : $files['type'],
            'tmp_name' => is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'],
            'error' => is_array($files['error']) ? $files['error'][$i] : $files['error'],
            'size' => is_array($files['size']) ? $files['size'][$i] : $files['size']
        ];
        
        try {
            ExplorerX_Security::validateUpload($file);
            
            $targetPath = $destination . '/' . basename($file['name']);
            
            if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
                throw new Exception('Failed to move uploaded file');
            }
            
            $uploaded[] = [
                'name' => basename($file['name']),
                'path' => $targetPath,
                'size' => $file['size']
            ];
            
            ExplorerX::log('Uploaded file: ' . $targetPath);
            
        } catch (Exception $e) {
            $errors[] = [
                'name' => $file['name'],
                'error' => $e->getMessage()
            ];
        }
    }
    
    return [
        'uploaded' => $uploaded,
        'errors' => $errors,
        'count' => count($uploaded)
    ];
}

/**
 * Handle file download (initiate download)
 */
function handleDownload($data, $rootPath) {
    $path = $data['path'] ?? null;
    
    if (!$path) {
        throw new Exception('Path required');
    }
    
    $path = ExplorerX_Security::sanitizePath($path, $rootPath);
    
    if (!file_exists($path)) {
        throw new Exception('File not found');
    }
    
    // Return download URL (actual download handled by separate script)
    return [
        'path' => $path,
        'downloadUrl' => '/plugins/explorerx/include/download.php?path=' . urlencode($path) . '&csrf_token=' . ExplorerX_Security::getCSRFToken()
    ];
}

/**
 * Handle ZIP creation
 */
function handleZip($data, $rootPath, $config) {
    if ($config['ENABLE_ZIP'] !== 'true') {
        throw new Exception('ZIP feature is disabled');
    }
    
    $paths = $data['paths'] ?? ($data['path'] ? [$data['path']] : null);
    $destination = $data['destination'] ?? null;
    
    if (!$paths) {
        throw new Exception('Path(s) required');
    }
    
    if (!is_array($paths)) {
        $paths = [$paths];
    }
    
    // Sanitize all paths
    $safePaths = [];
    foreach ($paths as $path) {
        $safePaths[] = ExplorerX_Security::sanitizePath($path, $rootPath);
    }
    
    // Generate destination if not provided
    if (!$destination) {
        $destination = dirname($safePaths[0]) . '/archive_' . date('YmdHis') . '.zip';
    }
    
    $destination = ExplorerX_Security::sanitizePath($destination, $rootPath);
    
    $result = ExplorerX::createZip($safePaths, $destination);
    
    return [
        'zipFile' => $result,
        'files' => $safePaths,
        'size' => filesize($result),
        'size_formatted' => ExplorerX::formatBytes(filesize($result))
    ];
}

/**
 * Handle ZIP extraction
 */
function handleExtract($data, $rootPath, $config) {
    if ($config['ENABLE_ZIP'] !== 'true') {
        throw new Exception('ZIP feature is disabled');
    }
    
    $zipFile = $data['zipFile'] ?? null;
    $destination = $data['destination'] ?? null;
    
    if (!$zipFile) {
        throw new Exception('ZIP file required');
    }
    
    $zipFile = ExplorerX_Security::sanitizePath($zipFile, $rootPath);
    
    if (!$destination) {
        $destination = dirname($zipFile);
    }
    
    $destination = ExplorerX_Security::sanitizePath($destination, $rootPath);
    
    $result = ExplorerX::extractZip($zipFile, $destination);
    
    return [
        'extracted' => $result,
        'zipFile' => $zipFile
    ];
}

/**
 * Handle checksum calculation
 */
function handleChecksum($data, $rootPath, $config) {
    if ($config['ENABLE_CHECKSUMS'] !== 'true') {
        throw new Exception('Checksum feature is disabled');
    }
    
    $path = $data['path'] ?? null;
    $algorithm = $data['algorithm'] ?? 'md5';
    
    if (!$path) {
        throw new Exception('Path required');
    }
    
    $path = ExplorerX_Security::sanitizePath($path, $rootPath);
    $checksum = ExplorerX::calculateChecksum($path, $algorithm);
    
    return [
        'path' => $path,
        'algorithm' => $algorithm,
        'checksum' => $checksum
    ];
}

/**
 * Handle disk space query
 */
function handleDiskSpace($data, $rootPath) {
    $path = $data['path'] ?? $rootPath;
    $path = ExplorerX_Security::sanitizePath($path, $rootPath);
    
    $space = ExplorerX::getDiskSpace($path);
    
    return [
        'path' => $path,
        'total' => $space['total'],
        'free' => $space['free'],
        'used' => $space['used'],
        'total_formatted' => ExplorerX::formatBytes($space['total']),
        'free_formatted' => ExplorerX::formatBytes($space['free']),
        'used_formatted' => ExplorerX::formatBytes($space['used']),
        'used_percent' => round(($space['used'] / $space['total']) * 100, 2)
    ];
}

/**
 * Handle search
 */
function handleSearch($data, $rootPath) {
    $path = $data['path'] ?? $rootPath;
    $query = $data['query'] ?? null;
    
    if (!$query) {
        throw new Exception('Search query required');
    }
    
    $path = ExplorerX_Security::sanitizePath($path, $rootPath);
    
    // Simple search implementation
    $results = [];
    $items = ExplorerX::listDirectory($path, false);
    
    foreach ($items as $item) {
        if (stripos($item['name'], $query) !== false) {
            $item['size_formatted'] = ExplorerX::formatBytes($item['size']);
            $item['modified_formatted'] = date('Y-m-d H:i:s', $item['modified']);
            $results[] = $item;
        }
    }
    
    return [
        'query' => $query,
        'path' => $path,
        'results' => $results,
        'count' => count($results)
    ];
}
