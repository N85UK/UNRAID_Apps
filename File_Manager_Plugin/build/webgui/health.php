<?php
// Simple health check endpoint to verify PHP execution + JSON output (build copy).
header('Content-Type: application/json');
$info = [
  'status' => 'ok',
  'message' => 'File Manager plugin PHP layer responding (build)',
  'timestamp' => date('Y-m-d H:i:s'),
  'php_version' => PHP_VERSION,
  'sapi' => php_sapi_name(),
  'loaded_extensions' => count(get_loaded_extensions()),
];

echo json_encode($info, JSON_UNESCAPED_SLASHES);
