<?php 


require_once('./CONFIG.php');

$conn = new DB_conn();
$stmt = $conn->mysqli->prepare(
    "SELECT `users`.`user`, `code`, `email` from `user_signup_verification`
        LEFT JOIN `users` ON `user_signup_verification`.`user`=`users`.`user`
        WHERE `sended`=0");
$stmt->execute();
$queryResult = $stmt->get_result();

if ($queryResult->num_rows > 0){
    $result = $queryResult->fetch_all(MYSQLI_ASSOC);
    foreach($result as $e){
        //Email küldése
        if (mail($e['email'],'Fiók aktiválása','tenlike.hu/src/api/user.php?request=verification&user='.$e['user'].'&code='.$e['code'])){
            //Ha minden jól ment
            $stmt = $conn->mysqli->prepare(
                "UPDATE `user_signup_verification`
                    SET `sended` = 1
                    WHERE `user`=?");
            $stmt->bind_param('s', $e['user']);
            $stmt->execute();
            $queryResult = $stmt->get_result();
        }
    }
}



$stmt->close();
unset($conn);
?>