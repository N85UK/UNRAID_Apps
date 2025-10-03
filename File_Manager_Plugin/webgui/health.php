<?php
// Simple health check endpoint to verify PHP execution + JSON output.
header('Content-Type: application/json');
$ts = microtime(true);
$info = [
  'status' => 'ok',
  'message' => 'File Manager plugin PHP layer responding',
  'timestamp' => date('Y-m-d H:i:s'),
  'php_version' => PHP_VERSION,
  'sapi' => php_sapi_name(),
  'loaded_extensions' => count(get_loaded_extensions()),
  'uptime_seconds' => (function(){
      $uptime = @file_get_contents('/proc/uptime');
      if ($uptime) { return (float) explode(' ', trim($uptime))[0]; }
      return null;
  })(),
  'memory_usage_bytes' => memory_get_usage(),
];

echo json_encode($info, JSON_UNESCAPED_SLASHES);
