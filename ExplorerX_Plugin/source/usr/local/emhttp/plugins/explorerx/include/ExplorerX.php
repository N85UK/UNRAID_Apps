<?php
/**
 * ExplorerX Core Class
 * 
 * Handles file operations, configuration, and utility functions
 * for the ExplorerX file manager plugin.
 */

class ExplorerX {
    
    const VERSION = '0.1.0';
    const CONFIG_FILE = '/boot/config/plugins/explorerx/settings.cfg';
    const LOG_FILE = '/var/log/explorerx/explorerx.log';
    const QUEUE_FILE = '/boot/config/plugins/explorerx/queue.json';
    
    /**
     * Load configuration from settings file
     */
    public static function loadConfig() {
        $defaults = [
            'ROOT_PATH' => '/mnt',
            'ENABLE_ZIP' => 'true',
            'ENABLE_CHECKSUMS' => 'true',
            'ENABLE_PREVIEWS' => 'true',
            'ENABLE_BULK_OPS' => 'true',
            'MAX_CONCURRENT_TASKS' => '3',
            'TASK_TIMEOUT' => '3600',
            'DEFAULT_VIEW' => 'list',
            'SHOW_HIDDEN_FILES' => 'false',
            'DUAL_PANE_DEFAULT' => 'false',
            'LOG_LEVEL' => 'info',
            'LOG_RETENTION_DAYS' => '7'
        ];
        
        if (!file_exists(self::CONFIG_FILE)) {
            return $defaults;
        }
        
        $config = parse_ini_file(self::CONFIG_FILE);
        return array_merge($defaults, $config ?: []);
    }
    
    /**
     * Save configuration to settings file
     */
    public static function saveConfig($config) {
        $lines = [];
        $lines[] = '# ExplorerX Configuration';
        $lines[] = '# Updated: ' . date('Y-m-d H:i:s');
        $lines[] = '';
        
        foreach ($config as $key => $value) {
            $lines[] = "$key=$value";
        }
        
        $dir = dirname(self::CONFIG_FILE);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        return file_put_contents(self::CONFIG_FILE, implode("\n", $lines)) !== false;
    }
    
    /**
     * List directory contents
     */
    public static function listDirectory($path, $showHidden = false) {
        if (!is_dir($path)) {
            throw new Exception('Directory does not exist');
        }
        
        if (!is_readable($path)) {
            throw new Exception('Directory is not readable');
        }
        
        $items = [];
        $entries = scandir($path);
        
        if ($entries === false) {
            throw new Exception('Failed to read directory');
        }
        
        foreach ($entries as $entry) {
            // Skip . and ..
            if ($entry === '.' || $entry === '..') {
                continue;
            }
            
            // Skip hidden files if not enabled
            if (!$showHidden && $entry[0] === '.') {
                continue;
            }
            
            $fullPath = $path . '/' . $entry;
            
            // Get file stats safely
            $stat = @stat($fullPath);
            if ($stat === false) {
                continue; // Skip files we can't stat
            }
            
            $isDir = is_dir($fullPath);
            
            $items[] = [
                'name' => $entry,
                'path' => $fullPath,
                'type' => $isDir ? 'directory' : 'file',
                'size' => $isDir ? 0 : $stat['size'],
                'modified' => $stat['mtime'],
                'permissions' => substr(sprintf('%o', $stat['mode']), -4),
                'owner' => posix_getpwuid($stat['uid'])['name'] ?? $stat['uid'],
                'group' => posix_getgrgid($stat['gid'])['name'] ?? $stat['gid'],
                'readable' => is_readable($fullPath),
                'writable' => is_writable($fullPath),
                'extension' => $isDir ? '' : pathinfo($entry, PATHINFO_EXTENSION)
            ];
        }
        
        return $items;
    }
    
    /**
     * Create a new directory
     */
    public static function createDirectory($path, $name) {
        $newPath = rtrim($path, '/') . '/' . $name;
        
        if (file_exists($newPath)) {
            throw new Exception('Directory already exists');
        }
        
        if (!mkdir($newPath, 0755)) {
            throw new Exception('Failed to create directory');
        }
        
        self::log('Created directory: ' . $newPath);
        return $newPath;
    }
    
    /**
     * Rename a file or directory
     */
    public static function rename($oldPath, $newName) {
        if (!file_exists($oldPath)) {
            throw new Exception('Source does not exist');
        }
        
        $dir = dirname($oldPath);
        $newPath = $dir . '/' . $newName;
        
        if (file_exists($newPath)) {
            throw new Exception('Target already exists');
        }
        
        if (!rename($oldPath, $newPath)) {
            throw new Exception('Failed to rename');
        }
        
        self::log('Renamed: ' . $oldPath . ' -> ' . $newPath);
        return $newPath;
    }
    
    /**
     * Delete a file or directory
     */
    public static function delete($path) {
        if (!file_exists($path)) {
            throw new Exception('File does not exist');
        }
        
        if (is_dir($path)) {
            if (!self::deleteDirectory($path)) {
                throw new Exception('Failed to delete directory');
            }
        } else {
            if (!unlink($path)) {
                throw new Exception('Failed to delete file');
            }
        }
        
        self::log('Deleted: ' . $path);
        return true;
    }
    
    /**
     * Recursively delete a directory
     */
    private static function deleteDirectory($dir) {
        if (!is_dir($dir)) {
            return false;
        }
        
        $items = scandir($dir);
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }
            
            $path = $dir . '/' . $item;
            if (is_dir($path)) {
                self::deleteDirectory($path);
            } else {
                unlink($path);
            }
        }
        
        return rmdir($dir);
    }
    
    /**
     * Copy a file or directory
     */
    public static function copy($source, $destination) {
        if (!file_exists($source)) {
            throw new Exception('Source does not exist');
        }
        
        if (is_dir($source)) {
            return self::copyDirectory($source, $destination);
        } else {
            return self::copyFile($source, $destination);
        }
    }
    
    /**
     * Copy a single file
     */
    private static function copyFile($source, $destination) {
        // If destination is a directory, append source filename
        if (is_dir($destination)) {
            $destination = rtrim($destination, '/') . '/' . basename($source);
        }
        
        if (file_exists($destination)) {
            throw new Exception('Destination already exists');
        }
        
        if (!copy($source, $destination)) {
            throw new Exception('Failed to copy file');
        }
        
        self::log('Copied file: ' . $source . ' -> ' . $destination);
        return $destination;
    }
    
    /**
     * Recursively copy a directory
     */
    private static function copyDirectory($source, $destination) {
        if (!is_dir($destination)) {
            mkdir($destination, 0755, true);
        }
        
        $items = scandir($source);
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }
            
            $srcPath = $source . '/' . $item;
            $dstPath = $destination . '/' . $item;
            
            if (is_dir($srcPath)) {
                self::copyDirectory($srcPath, $dstPath);
            } else {
                copy($srcPath, $dstPath);
            }
        }
        
        self::log('Copied directory: ' . $source . ' -> ' . $destination);
        return $destination;
    }
    
    /**
     * Move a file or directory
     */
    public static function move($source, $destination) {
        if (!file_exists($source)) {
            throw new Exception('Source does not exist');
        }
        
        // If destination is a directory, append source filename
        if (is_dir($destination)) {
            $destination = rtrim($destination, '/') . '/' . basename($source);
        }
        
        if (file_exists($destination)) {
            throw new Exception('Destination already exists');
        }
        
        if (!rename($source, $destination)) {
            throw new Exception('Failed to move');
        }
        
        self::log('Moved: ' . $source . ' -> ' . $destination);
        return $destination;
    }
    
    /**
     * Get file information
     */
    public static function getFileInfo($path) {
        if (!file_exists($path)) {
            throw new Exception('File does not exist');
        }
        
        $stat = stat($path);
        $isDir = is_dir($path);
        
        $info = [
            'name' => basename($path),
            'path' => $path,
            'type' => $isDir ? 'directory' : 'file',
            'size' => $stat['size'],
            'modified' => $stat['mtime'],
            'accessed' => $stat['atime'],
            'created' => $stat['ctime'],
            'permissions' => substr(sprintf('%o', $stat['mode']), -4),
            'owner' => posix_getpwuid($stat['uid'])['name'] ?? $stat['uid'],
            'group' => posix_getgrgid($stat['gid'])['name'] ?? $stat['gid'],
            'readable' => is_readable($path),
            'writable' => is_writable($path),
            'executable' => is_executable($path)
        ];
        
        if (!$isDir) {
            $info['extension'] = pathinfo($path, PATHINFO_EXTENSION);
            $info['mime_type'] = mime_content_type($path);
        }
        
        return $info;
    }
    
    /**
     * Calculate directory size
     */
    public static function getDirectorySize($path) {
        $size = 0;
        
        if (!is_dir($path)) {
            return filesize($path);
        }
        
        $items = scandir($path);
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }
            
            $itemPath = $path . '/' . $item;
            if (is_dir($itemPath)) {
                $size += self::getDirectorySize($itemPath);
            } else {
                $size += filesize($itemPath);
            }
        }
        
        return $size;
    }
    
    /**
     * Format bytes to human readable size
     */
    public static function formatBytes($bytes, $precision = 2) {
        $units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
    
    /**
     * Calculate file checksum
     */
    public static function calculateChecksum($path, $algorithm = 'md5') {
        if (!file_exists($path) || is_dir($path)) {
            throw new Exception('Invalid file for checksum');
        }
        
        $algorithm = strtolower($algorithm);
        if (!in_array($algorithm, ['md5', 'sha1', 'sha256'])) {
            throw new Exception('Unsupported checksum algorithm');
        }
        
        return hash_file($algorithm, $path);
    }
    
    /**
     * Create ZIP archive
     */
    public static function createZip($files, $destination) {
        if (!class_exists('ZipArchive')) {
            throw new Exception('ZIP support not available');
        }
        
        $zip = new ZipArchive();
        if ($zip->open($destination, ZipArchive::CREATE) !== true) {
            throw new Exception('Failed to create ZIP file');
        }
        
        foreach ($files as $file) {
            if (is_dir($file)) {
                self::addDirectoryToZip($zip, $file, basename($file));
            } else {
                $zip->addFile($file, basename($file));
            }
        }
        
        $zip->close();
        self::log('Created ZIP: ' . $destination);
        return $destination;
    }
    
    /**
     * Add directory to ZIP archive recursively
     */
    private static function addDirectoryToZip($zip, $dir, $zipPath) {
        $zip->addEmptyDir($zipPath);
        
        $items = scandir($dir);
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }
            
            $filePath = $dir . '/' . $item;
            $zipFilePath = $zipPath . '/' . $item;
            
            if (is_dir($filePath)) {
                self::addDirectoryToZip($zip, $filePath, $zipFilePath);
            } else {
                $zip->addFile($filePath, $zipFilePath);
            }
        }
    }
    
    /**
     * Extract ZIP archive
     */
    public static function extractZip($zipFile, $destination) {
        if (!class_exists('ZipArchive')) {
            throw new Exception('ZIP support not available');
        }
        
        $zip = new ZipArchive();
        if ($zip->open($zipFile) !== true) {
            throw new Exception('Failed to open ZIP file');
        }
        
        if (!$zip->extractTo($destination)) {
            $zip->close();
            throw new Exception('Failed to extract ZIP file');
        }
        
        $zip->close();
        self::log('Extracted ZIP: ' . $zipFile . ' -> ' . $destination);
        return $destination;
    }
    
    /**
     * Log a message
     */
    public static function log($message, $level = 'info') {
        $dir = dirname(self::LOG_FILE);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $logLine = "[$timestamp] [$level] $message\n";
        
        file_put_contents(self::LOG_FILE, $logLine, FILE_APPEND);
    }
    
    /**
     * Get disk space information
     */
    public static function getDiskSpace($path) {
        return [
            'total' => disk_total_space($path),
            'free' => disk_free_space($path),
            'used' => disk_total_space($path) - disk_free_space($path)
        ];
    }
}
