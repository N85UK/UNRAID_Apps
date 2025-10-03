<?php
/* Binary Installation Script for File Manager Plugin */

// Check if this is a valid request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}

// Install FileBrowser binary directly
$output = array();
$return_var = 0;

// Check if binary already exists
if (file_exists('/usr/local/bin/filebrowser')) {
    http_response_code(200);
    echo json_encode(array('status' => 'success', 'message' => 'FileBrowser binary already installed'));
    exit;
}

// Determine architecture
$arch = trim(shell_exec('uname -m'));
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
        http_response_code(500);
        echo json_encode(array('status' => 'error', 'message' => "Unsupported architecture: $arch"));
        exit;
}

$fb_version = 'v2.44.0';
$fb_url = "https://github.com/filebrowser/filebrowser/releases/download/$fb_version/linux-$fb_arch-filebrowser.tar.gz";

// Download and install
$commands = array(
    "cd /tmp",
    "wget -O filebrowser.tar.gz '$fb_url'",
    "tar -xzf filebrowser.tar.gz",
    "mv filebrowser /usr/local/bin/filebrowser",
    "chmod +x /usr/local/bin/filebrowser",
    "rm -f filebrowser.tar.gz"
);

foreach ($commands as $cmd) {
    exec($cmd . ' 2>&1', $output, $return_var);
    if ($return_var !== 0) {
        http_response_code(500);
        echo json_encode(array('status' => 'error', 'message' => 'Installation failed', 'command' => $cmd, 'output' => $output));
        exit;
    }
}

// Verify installation
if (file_exists('/usr/local/bin/filebrowser')) {
    http_response_code(200);
    echo json_encode(array('status' => 'success', 'message' => 'FileBrowser binary installed successfully', 'version' => $fb_version));
} else {
    http_response_code(500);
    echo json_encode(array('status' => 'error', 'message' => 'Installation completed but binary not found'));
}
?>