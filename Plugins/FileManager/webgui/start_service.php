<?php
/* Service Management Script for File Manager Plugin */

// Check if this is a valid request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}

// Execute the service start command
$output = array();
$return_var = 0;

exec('/usr/local/emhttp/plugins/file-manager/scripts/file-manager-service.sh start 2>&1', $output, $return_var);

if ($return_var === 0) {
    http_response_code(200);
    echo json_encode(array('status' => 'success', 'message' => 'Service start command executed', 'output' => $output));
} else {
    http_response_code(500);
    echo json_encode(array('status' => 'error', 'message' => 'Failed to start service', 'output' => $output));
}
?>