<?php
/* FileBrowser Binary Installation Script (enhanced build copy with shutdown handler) */

// Minimal visible errors; present errors as JSON
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

if (!ob_get_level()) ob_start();
$__fm_start = microtime(true);

register_shutdown_function(function() {
    $lastError = error_get_last();
    if ($lastError && in_array($lastError['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        if (ob_get_length()) ob_clean();
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'Fatal error: ' . ($lastError['message'] ?? '(unknown)'),
            'file' => ($lastError['file'] ?? '(unknown)'),
            'line' => ($lastError['line'] ?? 0),
            'timestamp' => date('Y-m-d H:i:s'),
            'phase' => 'shutdown-fatal'
        ]);
        return;
    }
    $buffer = ob_get_contents();
    $hasOutput = trim((string)$buffer) !== '';
    if (!$hasOutput) {
        if (ob_get_length()) ob_clean();
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'Script ended with no output (unexpected).',
            'timestamp' => date('Y-m-d H:i:s'),
            'phase' => 'shutdown-empty'
        ]);
    }
});

set_error_handler(function($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) return;
    throw new ErrorException($message, 0, $severity, $file, $line);
});

set_exception_handler(function($e) {
    if (ob_get_length()) ob_clean();
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Uncaught exception: ' . $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine(), 'timestamp' => date('Y-m-d H:i:s')]);
    exit(1);
});

header('Content-Type: application/json');

$__fm_start = microtime(true);

function jsonExit($status, $message, $data = []) {
    if (ob_get_length()) ob_clean();
    $response = array_merge([
        'status' => $status,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s'),
        'duration_ms' => (int) round((microtime(true) - $GLOBALS['__fm_start']) * 1000)
    ], $data);
    echo json_encode($response, JSON_UNESCAPED_SLASHES);
    exit;
}

set_error_handler(function($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) return;
    jsonExit('error', "PHP Error: $message in $file on line $line", ['error_severity' => $severity]);
});

if (php_sapi_name() === 'cli') {
    $_SERVER['REQUEST_METHOD'] = 'POST';
} elseif ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    jsonExit('error', 'Method not allowed');
}

function logDebug($message) {
    $isUnraid = file_exists('/etc/unraid-version');
    if ($isUnraid) {
        $logFile = '/var/log/file-manager/install.log';
    } else {
        $baseDir = dirname(__DIR__, 2);
        $logFile = $baseDir . '/logs/install.log';
    }
    $logDir = dirname($logFile);
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - $message\n", FILE_APPEND);
}

try {
    logDebug('Starting FileBrowser installation');
    logDebug('Request method: '.($_SERVER['REQUEST_METHOD'] ?? 'unknown'));

    logDebug('Checking network connectivity...');
    $networkTest = shell_exec('curl -s --connect-timeout 5 --max-time 10 https://github.com >/dev/null && echo "OK" || echo "FAIL"');
    if (trim($networkTest) !== 'OK') {
        throw new Exception('No internet connectivity detected. Please check network settings.');
    }
    logDebug('Network connectivity confirmed');

    $isUnraid = file_exists('/etc/unraid-version');
    $baseDir = dirname(__DIR__, 2);
    $binaryPath = $isUnraid ? '/usr/local/bin/filebrowser' : $baseDir . '/bin/filebrowser';

    if (file_exists($binaryPath)) {
        $testCmd = escapeshellarg($binaryPath) . " version 2>&1";
        exec($testCmd, $testOutput, $testReturn);
        if ($testReturn === 0 && !empty($testOutput)) {
            logDebug('FileBrowser binary already exists and is working');
            jsonExit('success', 'FileBrowser binary already installed', ['path' => $binaryPath]);
        } else {
            logDebug('Existing binary is not working, removing it');
            unlink($binaryPath);
        }
    }

    $arch = trim(shell_exec('uname -m'));
    $os = trim(shell_exec('uname -s'));
    logDebug("Detected OS: $os, Architecture: $arch");

    switch (strtolower($os)) {
        case 'linux': $osName = 'linux'; break;
        case 'darwin': $osName = 'darwin'; break;
        default: throw new Exception("Unsupported OS: $os. Supported OS: Linux, macOS (Darwin)");
    }
    switch ($arch) {
        case 'x86_64': $fbArch = 'amd64'; break;
        case 'aarch64':
        case 'arm64': $fbArch = 'arm64'; break;
        case 'armv7l': $fbArch = 'armv7'; break;
        default: throw new Exception("Unsupported architecture: $arch. Supported architectures: x86_64 (amd64), aarch64/arm64 (arm64), armv7l (armv7)");
    }

    $version = 'v2.44.0';
    $downloadUrl = "https://github.com/filebrowser/filebrowser/releases/download/$version/$osName-$fbArch-filebrowser.tar.gz";
    logDebug("Download URL: $downloadUrl");

    $maxRetries = 3; $urlAccessible = false;
    for ($retry = 1; $retry <= $maxRetries; $retry++) {
        logDebug("Testing URL accessibility (attempt $retry/$maxRetries)");
        $testCmd = "curl -I --connect-timeout 10 --max-time 30 '$downloadUrl' 2>/dev/null | head -n 1 | grep -E 'HTTP/[0-9.]+ (200|302)' >/dev/null && echo 'OK' || echo 'FAIL'";
        $urlTest = trim(shell_exec($testCmd));
        if ($urlTest === 'OK') { $urlAccessible = true; logDebug("URL is accessible on attempt $retry"); break; }
        logDebug("URL test failed on attempt $retry");
        if ($retry < $maxRetries) { $waitTime = $retry * 2; logDebug("Waiting {$waitTime}s before retry..."); sleep($waitTime);} }
    if (!$urlAccessible) { $manualUrl = "https://github.com/filebrowser/filebrowser/releases/download/$version/linux-$fbArch-filebrowser.tar.gz"; throw new Exception('Download URL not accessible. Manual: '.$manualUrl); }

    $availableBlocks = (int)trim(shell_exec("df /tmp | tail -1 | awk '{print $4}'"));
    $availableMB = $availableBlocks * 512 / 1024 / 1024;
    logDebug("Available disk space: {$availableMB}MB");
    if ($availableMB < 50) throw new Exception("Insufficient disk space: {$availableMB}MB available, need >= 50MB");

    $tempDir = '/tmp/filebrowser_install_' . uniqid(); mkdir($tempDir, 0755, true); logDebug("Created temp directory: $tempDir");
    $downloadCmd = "curl -L -f --connect-timeout 10 --max-time 300 --retry 5 --retry-delay 2 --retry-max-time 120 -o '$tempDir/filebrowser.tar.gz' '$downloadUrl' 2>&1"; logDebug("Executing: $downloadCmd");
    exec($downloadCmd, $downloadOutput, $downloadReturn);
    if ($downloadReturn !== 0) {
        $errorOutput = strtolower(implode(' ', $downloadOutput));
        logDebug('Download failed: '.implode('\n', $downloadOutput));
        if (strpos($errorOutput,'could not resolve host')!==false) throw new Exception('Network error: DNS resolution failed.');
        if (strpos($errorOutput,'connection timed out')!==false) throw new Exception('Network error: Connection timed out.');
        if (strpos($errorOutput,'ssl')!==false) throw new Exception('SSL error during download.');
        if (strpos($errorOutput,'403')!==false) throw new Exception('Access denied (403) / rate limited.');
        if (strpos($errorOutput,'404')!==false) throw new Exception('File not found (404) for this architecture/version.');
        throw new Exception('Download failed after retries.');
    }

    if (!file_exists("$tempDir/filebrowser.tar.gz")) throw new Exception('Downloaded file missing');
    $fileSize = filesize("$tempDir/filebrowser.tar.gz"); logDebug("Downloaded file size: $fileSize bytes");
    if ($fileSize < 1000) { $content = file_get_contents("$tempDir/filebrowser.tar.gz"); if (strpos($content,'Not Found')!==false||strpos($content,'404')!==false) throw new Exception('Download returned 404 page'); throw new Exception('Downloaded file too small, likely error page'); }

    $extractCmd = "cd '$tempDir' && tar -xzf filebrowser.tar.gz 2>&1 && ls -la filebrowser"; logDebug("Executing: $extractCmd");
    exec($extractCmd, $extractOutput, $extractReturn);
    if ($extractReturn !== 0) { logDebug('Extraction failed: '.implode('\n',$extractOutput)); throw new Exception('Extraction failed'); }
    if (!file_exists("$tempDir/filebrowser")) { $listOutput = shell_exec("ls -la '$tempDir/' 2>&1"); logDebug('Post-extract listing: '.$listOutput); throw new Exception('Extracted binary not found'); }
    if (!is_executable("$tempDir/filebrowser")) { chmod("$tempDir/filebrowser", 0755); logDebug('Set execute permission on extracted binary'); }

    $testExtractedCmd = "$tempDir/filebrowser version 2>&1"; exec($testExtractedCmd, $testExtractedOutput, $testExtractedReturn);
    if ($testExtractedReturn !== 0) { logDebug('Extracted binary test failed: '.implode('\n',$testExtractedOutput)); throw new Exception('Extracted binary test failed'); }
    logDebug('Binary extraction and test successful');

    $finalPath = $binaryPath; $binDir = dirname($finalPath); if (!is_dir($binDir)) mkdir($binDir,0755,true);
    if (file_exists($finalPath)) { $backupPath = $finalPath.'.backup.'.time(); logDebug("Backing up existing binary to $backupPath"); rename($finalPath,$backupPath);}    
    $moveCmd = "mv '$tempDir/filebrowser' '$finalPath' 2>&1"; logDebug("Executing: $moveCmd"); exec($moveCmd, $moveOutput, $moveReturn);
    if ($moveReturn !== 0) { logDebug('Move failed: '.implode('\n',$moveOutput)); throw new Exception('Move failed'); }
    chmod($finalPath,0755); logDebug('Set binary permissions');
    exec("rm -rf '$tempDir'"); logDebug('Cleaned up temporary files');

    if (!file_exists($finalPath)) throw new Exception('Installation verification failed: binary missing');
    if (!is_executable($finalPath)) throw new Exception('Installation verification failed: not executable');

    $finalTestCmd = "$finalPath version 2>&1"; exec($finalTestCmd, $finalTestOutput, $finalTestReturn); if ($finalTestReturn !== 0) { logDebug('Final binary test failed: '.implode('\n',$finalTestOutput)); throw new Exception('Final binary test failed'); }
    $versionOutput = trim(implode('\n',$finalTestOutput)); logDebug('Installation completed successfully');
    jsonExit('success', 'FileBrowser binary installed successfully', ['version'=>$version,'path'=>$finalPath,'binary_version'=>$versionOutput,'architecture'=>$arch]);
} catch (Exception $e) {
    logDebug('Exception: '.$e->getMessage());
    http_response_code(500);
    $isUnraid = file_exists('/etc/unraid-version');
    $baseDir = dirname(__DIR__, 2);
    $logPath = $isUnraid ? '/var/log/file-manager/install.log' : $baseDir . '/logs/install.log';
    jsonExit('error', $e->getMessage(), ['log_file' => $logPath]);
}
?>