<?php 


require_once('./CONFIG.php');

$conn = new DB_conn();
$stmt = $conn->mysqli->prepare("CALL __post_protect_unset_by_date()");
$stmt->execute();
$stmt->close();
unset($conn);
?>