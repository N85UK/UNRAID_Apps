<?php
// Minimal FileBrowser installer - hardened scaffold
ini_set('display_errors', 0);
error_reporting(E_ALL);
if (!ob_get_level()) ob_start();

register_shutdown_function(function(){
    $err = error_get_last();
    if ($err) {
        if (ob_get_length()) ob_clean();
        header('Content-Type: application/json');
        echo json_encode(['status'=>'error','message'=>'Fatal: '.$err['message'],'file'=>$err['file'],'line'=>$err['line']]);
        return;
    }
    $buf = ob_get_contents();
    if (trim((string)$buf) === '') {
        if (ob_get_length()) ob_clean();
        header('Content-Type: application/json');
        echo json_encode(['status'=>'error','message'=>'No output']);
    }
});

function jsonExit($status,$message,$data=[]) {
    if (ob_get_length()) ob_clean();
    header('Content-Type: application/json');
    echo json_encode(array_merge(['status'=>$status,'message'=>$message],$data));
    exit;
}

try {
    // Multi-arch detection
    $arch = trim(shell_exec('uname -m')) ?: 'x86_64';
    switch ($arch) {
        case 'x86_64': $fbArch = 'amd64'; break;
        case 'aarch64': case 'arm64': $fbArch = 'arm64'; break;
        case 'armv7l': $fbArch = 'armv7'; break;
        default: $fbArch = 'amd64';
    }

    $version = isset($_POST['version']) ? $_POST['version'] : 'v2.44.0';
    $checksum = isset($_POST['checksum']) ? $_POST['checksum'] : null; // optional sha256 from caller

    $url = "https://github.com/filebrowser/filebrowser/releases/download/$version/linux-$fbArch-filebrowser.tar.gz";
    $tmp = '/tmp/file-explorer-install-'.uniqid();
    mkdir($tmp,0755,true);
    $out = "$tmp/filebrowser.tar.gz";
    $cmd = "curl -L -f -s -o '$out' '$url'";
    exec($cmd,$o,$r);
    if ($r !== 0) throw new Exception('Download failed');

    if (!file_exists($out) || filesize($out)<1000) throw new Exception('Download invalid');

    // If caller supplied expected checksum, verify sha256
    if ($checksum) {
        $sha = hash_file('sha256', $out);
        if (strcasecmp($sha, $checksum) !== 0) throw new Exception('Checksum mismatch (sha256)');
    }

    // Extract and move binary
    chdir($tmp);
    exec("tar -xzf '$out' 2>&1",$o,$r);
    if ($r !== 0) throw new Exception('Extract failed');

    $bin = "$tmp/filebrowser";
    if (!file_exists($bin)) throw new Exception('binary not found');
    if (!is_executable($bin)) chmod($bin,0755);

    $final = '/usr/local/bin/filebrowser';
    if (!is_dir(dirname($final))) mkdir(dirname($final),0755,true);
    // Backup existing binary if present
    if (file_exists($final)) rename($final, $final.'.backup.'.time());
    rename($bin,$final);
    chmod($final,0755);

    // Persist plugin config dir
    $cfgDir = '/boot/config/plugins/file-explorer';
    if (!is_dir($cfgDir)) mkdir($cfgDir,0755,true);
    $dbPath = $cfgDir.'/filebrowser.db';
    // Create empty DB placeholder if needed
    if (!file_exists($dbPath)) touch($dbPath);

    jsonExit('success','installed',['path'=>$final,'arch'=>$fbArch]);
} catch (Exception $e) {
    jsonExit('error',$e->getMessage());
}
?>