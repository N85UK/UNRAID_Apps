<?php
/**
 * ExplorerX Security Module
 * 
 * Handles CSRF protection, path sanitization, and security validation
 * for the ExplorerX file manager plugin.
 */

class ExplorerX_Security {
    
    const CSRF_TOKEN_NAME = 'explorerx_csrf_token';
    const SESSION_TIMEOUT = 3600; // 1 hour
    
    /**
     * Generate or retrieve CSRF token
     */
    public static function getCSRFToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION[self::CSRF_TOKEN_NAME])) {
            $_SESSION[self::CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
        }
        
        return $_SESSION[self::CSRF_TOKEN_NAME];
    }
    
    /**
     * Validate CSRF token
     */
    public static function validateCSRFToken($token) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION[self::CSRF_TOKEN_NAME])) {
            return false;
        }
        
        return hash_equals($_SESSION[self::CSRF_TOKEN_NAME], $token);
    }
    
    /**
     * Get CSRF token from request
     */
    public static function getTokenFromRequest() {
        // Check header first
        if (isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
            return $_SERVER['HTTP_X_CSRF_TOKEN'];
        }
        
        // Check POST data
        if (isset($_POST['csrf_token'])) {
            return $_POST['csrf_token'];
        }
        
        // Check GET (less secure, but sometimes needed)
        if (isset($_GET['csrf_token'])) {
            return $_GET['csrf_token'];
        }
        
        return null;
    }
    
    /**
     * Validate request has valid CSRF token
     */
    public static function validateRequest() {
        $token = self::getTokenFromRequest();
        
        if (!$token) {
            throw new SecurityException('CSRF token missing');
        }
        
        if (!self::validateCSRFToken($token)) {
            throw new SecurityException('Invalid CSRF token');
        }
        
        return true;
    }
    
    /**
     * Sanitize a path to prevent directory traversal
     */
    public static function sanitizePath($path, $rootPath = '/mnt') {
        // Remove any null bytes
        $path = str_replace("\0", '', $path);
        
        // Normalize path separators
        $path = str_replace('\\', '/', $path);
        
        // Remove multiple slashes
        $path = preg_replace('#/+#', '/', $path);
        
        // Resolve the real path
        $realPath = realpath($path);
        
        // If realpath fails, try to construct it safely
        if ($realPath === false) {
            // For paths that don't exist yet, validate the parent
            $parent = dirname($path);
            $realParent = realpath($parent);
            
            if ($realParent === false) {
                throw new SecurityException('Invalid path');
            }
            
            $realPath = $realParent . '/' . basename($path);
        }
        
        // Ensure the path is within the root
        $realRootPath = realpath($rootPath);
        if ($realRootPath === false) {
            throw new SecurityException('Invalid root path');
        }
        
        // Check if the real path starts with the root path
        if (strpos($realPath, $realRootPath) !== 0) {
            throw new SecurityException('Path outside allowed root: ' . $path);
        }
        
        return $realPath;
    }
    
    /**
     * Validate a filename (no path traversal characters)
     */
    public static function validateFilename($filename) {
        // Check for null bytes
        if (strpos($filename, "\0") !== false) {
            throw new SecurityException('Invalid filename: null byte');
        }
        
        // Check for path traversal
        if (preg_match('#(^|/)\.\.(/|$)#', $filename)) {
            throw new SecurityException('Invalid filename: path traversal');
        }
        
        // Check for absolute paths
        if ($filename[0] === '/' || $filename[0] === '\\') {
            throw new SecurityException('Invalid filename: absolute path');
        }
        
        // Check for dangerous characters
        if (preg_match('#[<>:"|?*]#', $filename)) {
            throw new SecurityException('Invalid filename: dangerous characters');
        }
        
        return true;
    }
    
    /**
     * Check if Unraid session is valid
     */
    public static function validateUnraidSession() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // In Unraid, the session should have certain markers
        // This is a basic check - adjust based on actual Unraid session structure
        if (!isset($_SESSION) || empty($_SESSION)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Rate limiting for operations
     */
    public static function checkRateLimit($operation, $limit = 100, $window = 60) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $key = 'rate_limit_' . $operation;
        $now = time();
        
        if (!isset($_SESSION[$key])) {
            $_SESSION[$key] = [];
        }
        
        // Clean old entries
        $_SESSION[$key] = array_filter($_SESSION[$key], function($timestamp) use ($now, $window) {
            return ($now - $timestamp) < $window;
        });
        
        // Check if limit exceeded
        if (count($_SESSION[$key]) >= $limit) {
            throw new SecurityException('Rate limit exceeded for operation: ' . $operation);
        }
        
        // Add current request
        $_SESSION[$key][] = $now;
        
        return true;
    }
    
    /**
     * Sanitize output for HTML display
     */
    public static function sanitizeOutput($string) {
        return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Validate file upload
     */
    public static function validateUpload($file) {
        // Check for upload errors
        if (!isset($file['error']) || is_array($file['error'])) {
            throw new SecurityException('Invalid upload parameters');
        }
        
        switch ($file['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_NO_FILE:
                throw new SecurityException('No file uploaded');
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                throw new SecurityException('File exceeds size limit');
            default:
                throw new SecurityException('Upload error: ' . $file['error']);
        }
        
        // Validate file size (max 10GB for Unraid)
        $maxSize = 10 * 1024 * 1024 * 1024; // 10GB
        if ($file['size'] > $maxSize) {
            throw new SecurityException('File too large');
        }
        
        // Validate filename
        self::validateFilename($file['name']);
        
        // Check if file was actually uploaded via HTTP POST
        if (!is_uploaded_file($file['tmp_name'])) {
            throw new SecurityException('Invalid upload');
        }
        
        return true;
    }
    
    /**
     * Log security event
     */
    public static function logSecurityEvent($event, $details = []) {
        $logFile = '/var/log/explorerx/security.log';
        $dir = dirname($logFile);
        
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $user = $_SERVER['REMOTE_USER'] ?? 'unknown';
        
        $logEntry = [
            'timestamp' => $timestamp,
            'event' => $event,
            'ip' => $ip,
            'user' => $user,
            'details' => $details
        ];
        
        $logLine = json_encode($logEntry) . "\n";
        file_put_contents($logFile, $logLine, FILE_APPEND);
    }
    
    /**
     * Check if path is safe to delete
     */
    public static function isSafeToDelete($path, $rootPath = '/mnt') {
        $realPath = realpath($path);
        
        if ($realPath === false) {
            return false;
        }
        
        // Never allow deletion of root itself
        if ($realPath === $rootPath) {
            return false;
        }
        
        // List of protected paths
        $protectedPaths = [
            '/boot',
            '/etc',
            '/usr',
            '/var',
            '/bin',
            '/sbin',
            '/lib',
            '/lib64',
            '/root',
            '/mnt/disks',
            '/mnt/remotes'
        ];
        
        foreach ($protectedPaths as $protected) {
            if (strpos($realPath, $protected) === 0) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Get safe operation limits
     */
    public static function getOperationLimits() {
        return [
            'max_file_size' => 10 * 1024 * 1024 * 1024, // 10GB
            'max_files_per_operation' => 1000,
            'max_directory_depth' => 20,
            'max_filename_length' => 255,
            'max_path_length' => 4096
        ];
    }
}

/**
 * Custom security exception class
 */
class SecurityException extends Exception {
    public function __construct($message, $code = 403, Exception $previous = null) {
        parent::__construct($message, $code, $previous);
        
        // Log security exception
        ExplorerX_Security::logSecurityEvent('security_exception', [
            'message' => $message,
            'code' => $code,
            'trace' => $this->getTraceAsString()
        ]);
    }
}
