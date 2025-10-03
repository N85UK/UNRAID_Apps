<?php
/* FileBrowser Binary Installation Script */

// Ensure proper JSON output
ob_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Function to ensure JSON output on exit
function jsonExit($status, $message, $data = []) {
    // Clean any output buffer
    if (ob_get_length()) ob_clean();
    
    $response = array_merge([
        'status' => $status,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ], $data);
    
    echo json_encode($response);
    exit;
}

// Set error handler to return JSON
set_error_handler(function($severity, $message, $file, $line) {
    jsonExit('error', "PHP Error: $message in $file on line $line");
});

// Allow both GET and POST for testing
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    jsonExit('error', 'Method not allowed');
}

function logDebug($message) {
    $logFile = '/var/log/file-manager/install.log';
    $logDir = dirname($logFile);
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - $message\n", FILE_APPEND);
}

try {
    logDebug('Starting FileBrowser installation');
    
    // Check network connectivity first
    logDebug('Checking network connectivity...');
    $networkTest = shell_exec('curl -s --connect-timeout 5 --max-time 10 https://github.com >/dev/null && echo "OK" || echo "FAIL"');
    if (trim($networkTest) !== 'OK') {
        throw new Exception('No internet connectivity detected. Please check network settings.');
    }
    logDebug('Network connectivity confirmed');
    
    // Check if binary already exists
    if (file_exists('/usr/local/bin/filebrowser')) {
        // Verify it's executable and working
        $testCmd = "/usr/local/bin/filebrowser --version 2>&1";
        exec($testCmd, $testOutput, $testReturn);
        if ($testReturn === 0 && !empty($testOutput)) {
            logDebug('FileBrowser binary already exists and is working');
            jsonExit('success', 'FileBrowser binary already installed', ['path' => '/usr/local/bin/filebrowser']);
        } else {
            logDebug('Existing binary is not working, removing it');
            unlink('/usr/local/bin/filebrowser');
        }
    }
    
    // Detect architecture
    $arch = trim(shell_exec('uname -m'));
    logDebug("Detected architecture: $arch");
    
    switch ($arch) {
        case 'x86_64':
            $fbArch = 'amd64';
            break;
        case 'aarch64':
            $fbArch = 'arm64';
            break;
        case 'armv7l':
            $fbArch = 'armv7';
            break;
        default:
            $supported = ['x86_64 (amd64)', 'aarch64 (arm64)', 'armv7l (armv7)'];
            throw new Exception("Unsupported architecture: $arch. Supported architectures: " . implode(', ', $supported));
    }
    
    $version = 'v2.44.0';
    
    // Use primary download source with retry logic
    $downloadUrl = "https://github.com/filebrowser/filebrowser/releases/download/$version/linux-$fbArch-filebrowser.tar.gz";
    logDebug("Download URL: $downloadUrl");
    
    // Test URL accessibility with retries
    $maxRetries = 3;
    $urlAccessible = false;
    
    for ($retry = 1; $retry <= $maxRetries; $retry++) {
        logDebug("Testing URL accessibility (attempt $retry/$maxRetries)");
        
        $testCmd = "curl -I --connect-timeout 10 --max-time 30 '$downloadUrl' 2>/dev/null | head -n 1 | grep -E 'HTTP/[0-9.]+ (200|302)' >/dev/null && echo 'OK' || echo 'FAIL'";
        $urlTest = trim(shell_exec($testCmd));
        
        if ($urlTest === 'OK') {
            $urlAccessible = true;
            logDebug("URL is accessible on attempt $retry");
            break;
        } else {
            logDebug("URL test failed on attempt $retry");
            if ($retry < $maxRetries) {
                $waitTime = $retry * 2; // Exponential backoff: 2s, 4s, 6s
                logDebug("Waiting {$waitTime}s before retry...");
                sleep($waitTime);
            }
        }
    }
    
    if (!$urlAccessible) {
        $manualUrl = "https://github.com/filebrowser/filebrowser/releases/download/$version/linux-$fbArch-filebrowser.tar.gz";
        throw new Exception('Download URL is not accessible after ' . $maxRetries . ' attempts. Please check your internet connection and try again later. If the problem persists, you can manually download from: ' . $manualUrl . ' and place the extracted binary at /usr/local/bin/filebrowser');
    }
    
    // Check available disk space (need at least 50MB)
    $diskSpaceCmd = "df /tmp | tail -1 | awk '{print $4}'";
    $availableBlocks = (int)trim(shell_exec($diskSpaceCmd));
    $availableMB = $availableBlocks * 512 / 1024 / 1024; // Convert to MB
    
    logDebug("Available disk space: {$availableMB}MB");
    
    if ($availableMB < 50) {
        throw new Exception("Insufficient disk space: {$availableMB}MB available, need at least 50MB for download and extraction.");
    }
    
    // Create temporary directory
    $tempDir = '/tmp/filebrowser_install_' . uniqid();
    mkdir($tempDir, 0755, true);
    logDebug("Created temp directory: $tempDir");
    
    // Download with curl (enhanced retry logic)
    $downloadCmd = "curl -L -f --connect-timeout 10 --max-time 300 --retry 5 --retry-delay 2 --retry-max-time 120 -o '$tempDir/filebrowser.tar.gz' '$downloadUrl' 2>&1";
    logDebug("Executing: $downloadCmd");
    exec($downloadCmd, $downloadOutput, $downloadReturn);
    
    if ($downloadReturn !== 0) {
        $errorMsg = 'Download failed after retries: ' . implode('\n', $downloadOutput);
        logDebug($errorMsg);
        
        // Check if it's a common error
        $errorOutput = strtolower(implode(' ', $downloadOutput));
        if (strpos($errorOutput, 'could not resolve host') !== false) {
            throw new Exception('Network error: Could not resolve hostname. Please check your DNS settings.');
        } elseif (strpos($errorOutput, 'connection timed out') !== false) {
            throw new Exception('Network error: Connection timed out. Please check your internet connection.');
        } elseif (strpos($errorOutput, 'ssl') !== false) {
            throw new Exception('SSL error: There may be an issue with SSL certificates. Try again later.');
        } elseif (strpos($errorOutput, '403') !== false) {
            throw new Exception('Access denied (403): The download may be rate-limited. Please wait a few minutes and try again.');
        } elseif (strpos($errorOutput, '404') !== false) {
            throw new Exception('File not found (404): The FileBrowser version may not be available for your architecture.');
        } else {
            throw new Exception($errorMsg);
        }
    }
    
    // Verify download
    if (!file_exists("$tempDir/filebrowser.tar.gz")) {
        throw new Exception('Downloaded file not found after download attempt');
    }
    
    $fileSize = filesize("$tempDir/filebrowser.tar.gz");
    logDebug("Downloaded file size: $fileSize bytes");
    
    if ($fileSize < 1000) {
        $content = file_get_contents("$tempDir/filebrowser.tar.gz");
        if (strpos($content, 'Not Found') !== false || strpos($content, '404') !== false) {
            throw new Exception('Download failed: File not found on server (404 error)');
        }
        throw new Exception("Downloaded file too small ($fileSize bytes), likely an error page instead of the binary");
    }
    
    // Extract with better error handling
    $extractCmd = "cd '$tempDir' && tar -xzf filebrowser.tar.gz 2>&1 && ls -la filebrowser";
    logDebug("Executing: $extractCmd");
    exec($extractCmd, $extractOutput, $extractReturn);
    
    if ($extractReturn !== 0) {
        $errorMsg = 'Extraction failed: ' . implode('\n', $extractOutput);
        logDebug($errorMsg);
        throw new Exception($errorMsg);
    }
    
    // Verify extraction
    if (!file_exists("$tempDir/filebrowser")) {
        $listCmd = "ls -la '$tempDir/' 2>&1";
        $listOutput = shell_exec($listCmd);
        logDebug("Directory contents after extraction: $listOutput");
        throw new Exception('Extracted binary not found. Archive may be corrupted or contain different file structure.');
    }
    
    // Check if binary is executable
    if (!is_executable("$tempDir/filebrowser")) {
        logDebug('Setting executable permissions on extracted binary');
        chmod("$tempDir/filebrowser", 0755);
    }
    
    // Test the binary before installation
    $testExtractedCmd = "$tempDir/filebrowser --version 2>&1";
    exec($testExtractedCmd, $testExtractedOutput, $testExtractedReturn);
    
    if ($testExtractedReturn !== 0) {
        $errorMsg = 'Extracted binary test failed: ' . implode('\n', $testExtractedOutput);
        logDebug($errorMsg);
        throw new Exception($errorMsg);
    }
    
    logDebug('Binary extraction and test successful');
    
    // Move to final location with backup
    $finalPath = '/usr/local/bin/filebrowser';
    if (file_exists($finalPath)) {
        $backupPath = $finalPath . '.backup.' . time();
        logDebug("Creating backup of existing binary: $backupPath");
        rename($finalPath, $backupPath);
    }
    
    $moveCmd = "mv '$tempDir/filebrowser' '$finalPath' 2>&1";
    logDebug("Executing: $moveCmd");
    exec($moveCmd, $moveOutput, $moveReturn);
    
    if ($moveReturn !== 0) {
        $errorMsg = 'Move failed: ' . implode('\n', $moveOutput);
        logDebug($errorMsg);
        throw new Exception($errorMsg);
    }
    
    // Set permissions
    chmod($finalPath, 0755);
    logDebug('Set binary permissions');
    
    // Cleanup
    exec("rm -rf '$tempDir'");
    logDebug('Cleaned up temporary files');
    
    // Final verification
    if (!file_exists($finalPath)) {
        throw new Exception('Installation verification failed: binary not found at final location');
    }
    
    if (!is_executable($finalPath)) {
        throw new Exception('Installation verification failed: binary is not executable');
    }
    
    // Test final installation
    $finalTestCmd = "$finalPath --version 2>&1";
    exec($finalTestCmd, $finalTestOutput, $finalTestReturn);
    
    if ($finalTestReturn !== 0) {
        $errorMsg = 'Final binary test failed: ' . implode('\n', $finalTestOutput);
        logDebug($errorMsg);
        throw new Exception($errorMsg);
    }
    
    $versionOutput = trim(implode('\n', $finalTestOutput));
    logDebug('Installation completed successfully');
    jsonExit('success', 'FileBrowser binary installed successfully', [
        'version' => $version,
        'path' => $finalPath,
        'binary_version' => $versionOutput,
        'architecture' => $arch
    ]);
    
} catch (Exception $e) {
    logDebug('Exception: ' . $e->getMessage());
    http_response_code(500);
    jsonExit('error', $e->getMessage(), ['log_file' => '/var/log/file-manager/install.log']);
}
?>