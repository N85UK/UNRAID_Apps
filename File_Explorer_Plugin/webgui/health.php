<?php
header('Content-Type: application/json');
$status = ['ok'=>true,'service'=>'file-explorer','timestamp'=>date('c')];
echo json_encode($status);
?>