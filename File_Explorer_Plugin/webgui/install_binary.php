<?php
// Minimal FileBrowser installer - scaffold
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
    // Very small installer for prototype: download FileBrowser for linux/amd64
    $version = 'v2.44.0';
    $arch = trim(shell_exec('uname -m')) ?: 'x86_64';
    $fbArch = $arch === 'x86_64' ? 'amd64' : (strpos($arch,'arm')!==false? 'arm64': 'amd64');

    $url = "https://github.com/filebrowser/filebrowser/releases/download/$version/linux-$fbArch-filebrowser.tar.gz";
    $tmp = '/tmp/file-explorer-install-'.uniqid();
    mkdir($tmp,0755,true);
    $out = "$tmp/filebrowser.tar.gz";
    $cmd = "curl -L -f -s -o '$out' '$url'";
    exec($cmd,$o,$r);
    if ($r !== 0) throw new Exception('Download failed');
    // quick size check
    if (!file_exists($out) || filesize($out)<1000) throw new Exception('Download invalid');

    // Extract and move binary
    chdir($tmp);
    exec("tar -xzf '$out' 2>&1",$o,$r);
    if ($r !== 0) throw new Exception('Extract failed');

    $bin = "$tmp/filebrowser";
    if (!file_exists($bin)) throw new Exception('binary not found');
    if (!is_executable($bin)) chmod($bin,0755);

    $final = '/usr/local/bin/filebrowser';
    rename($bin,$final);
    chmod($final,0755);

    jsonExit('success','installed',['path'=>$final]);
} catch (Exception $e) {
    jsonExit('error',$e->getMessage());
}
?>