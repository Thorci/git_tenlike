<?php

session_start();
require_once('./CONFIG.php');

header('Content-Type: application/json; charset=utf-8');
$_GET['ctype'] ='json';

class User {


    static function GetAnyData(string $user, string $queryString){
        $conn = new DB_conn();
        if ($user==0){
            $queryResult = $conn->mysqli->query($queryString);
            unset($conn);
            return $queryResult->fetch_all(MYSQLI_ASSOC);
        }//else

        $stmt = $conn->mysqli->prepare($queryString);
        $stmt->bind_param('s', $user);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);
        return $queryResult->fetch_all(MYSQLI_ASSOC);
    }





//Műveletek
    static function login($user, $password){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT user_login(?, ?) AS result");
        $stmt->bind_param('ss', $user, $password);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1){
            $result = $queryResult->fetch_object();
            if ($result->result=="Success"){
                $_SESSION['user'] = array_column(User::GetAnyData($user, "SELECT `user` FROM `users` WHERE `user`=?"), "user", "string")[0];
                return array('user'=>$_SESSION['user'], 'logged'=>1, 'result'=>'Sikeres bejelentkezés!');
            }else{
                $_SESSION['user'] = '';
                return array('user'=>$_SESSION['user'], 'logged'=>0, 'result'=>$result->result);
            }
        }
        return (object) array('result'=>'Error');
    }

    static function Subscribe($subscribe){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT user_subscribe(?, ?) AS result");
        $stmt->bind_param('ss', $_SESSION['user'], $subscribe);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1){
            $result = $queryResult->fetch_object();
            return (object) $result;
        }
        return (object) array('Err'=>'404');
    }
    
    static function Unsubscribe($subscribe){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT user_unsubscribe(?, ?) AS result");
        $stmt->bind_param('ss', $_SESSION['user'], $subscribe);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1){
            $result = $queryResult->fetch_object();
            return (object) $result;
        }
        return (object) array('Err'=>'404');
    }


    static function registration($user, $email, $password){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT user_new(?, ?, ?) AS result");
        $stmt->bind_param('sss', $user, $email, $password);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1){
            $result = $queryResult->fetch_object();
            return (object) $result;
        }
        return (object) array('Err'=>'404');
    }

    static function Delete($password){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT user_delete(?, ?) AS result");
        $stmt->bind_param('ss', $_SESSION['user'], $password);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1){
            $result = $queryResult->fetch_object();
            return (object) $result;
        }
        return (object) array('Err'=>'404');
    }

    static function SetPassword($password, $newPassword){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT user_set_password(?, ?, ?) AS result");
        $stmt->bind_param('sss', $_SESSION['user'], $password, $newPassword);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1){
            $result = $queryResult->fetch_object();
            return (object) $result;
        }
        return (object) array('Err'=>'404');
    }

    static function verification($user, $code){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT user_verification(?, ?) AS result");
        $stmt->bind_param('si', $user, $code);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1){
            $result = $queryResult->fetch_object();
            return (object) $result;
        }
        return (object) array('Err'=>'404');
    }

    static function passwordRecoveryRequest($user){
        return User::GetAnyData($user, "SELECT user_password_recovery_request(?) AS result")[0];
    }

    static function passwordRecovery($user, $code){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT user_password_recovery(?, ?) AS result");
        $stmt->bind_param('si', $user, $code);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1){
            $result = $queryResult->fetch_object();
            return (object) $result;
        }
        return (object) array('Err'=>'404');
    }

    static function logout(){
        $_SESSION['user']='';
        session_destroy();
        return (object) array('user'=>'', 'logged'=>0, 'result'=>'Kijelentkeztél!');
    }

    static function SetProfile($profile){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("REPLACE into `user_profiles` (`user`, `profile`) values(?, ?)");
        $stmt->bind_param('ss', $_SESSION['user'], $profile);
        $stmt->execute();
        $stmt->close();
        unset($conn);

        return (object) array('result'=>'Profil módosítva!', 'profile'=>$profile);
    }

    static function SetDescription($description){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("REPLACE into `user_descriptions` (`user`, `description`) values(?, ?)");
        $stmt->bind_param('ss', $_SESSION['user'], $description);
        $stmt->execute();
        $stmt->close();
        unset($conn);
        
        return (object) array('result'=>'Leírás módosítva!', 'description'=>$description);
    }


//Adatlekérések
    static function logged(){
        if (isset($_SESSION['user'])){
            return (object) array('user'=>$_SESSION['user'], 'logged'=>1);
        }else{
            return (object) array('user'=>'');
        }
    }
    public static function GetBasic($user){
        $result = User::GetAnyData($user, "SELECT `user` FROM `users` WHERE `user`=?")[0];
        $protects = User::GetAnyData($user, "SELECT user_get_available_protects(?) AS protects")[0];
        $result = array_merge($result, $protects);
        if (isset($_SESSION['user']) && $result['user']==$_SESSION['user']) $result['logged'] = 1; else {$result['logged']=0; $result['protects']="";};
        $result = array_merge($result, (array) User::Subscribed($user));
        $result['basic']=1;
        return $result;
    }  
    public static function GetDescription($user){
        $result = User::GetAnyData($user, "SELECT `description` FROM `user_descriptions` WHERE `user`=?")[0];
        return $result;
    }  
    public static function GetProfile($user){
        $result = User::GetAnyData($user, "SELECT `profile` FROM `user_profiles` WHERE `user`=?")[0];
        return $result;
    }  
    static function Subscribed($subscribe){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT `subscribe` FROM `user_subscribes` WHERE (`user`=? AND `subscribe`=?)");
        $stmt->bind_param('ss', $_SESSION['user'], $subscribe);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1){
            return (object) array('subscribed'=>1);
        }
        return (object) array('subscribed'=>0);
    }

    //Felhasználók keresése
    public static function GetAllUser(){
        return User::GetAnyData(0, "SELECT `user` FROM `users`");
    }

    public static function GetPopular(){
        return array_column(User::GetAnyData(0, "SELECT `user` FROM `users`"), "user", "string");
    }
    public static function GetFollowed(){
        return array_column(User::GetAnyData($_SESSION['user'], "SELECT `subscribe` FROM `user_subscribes` WHERE `user`=?"), "subscribe", "string");
    }
    public static function Getburns(){
        return array_column(User::GetAnyData(0,
            "   SELECT `subscribe`
                FROM `user_subscribes` where datediff(current_date(),`date`)<30
                GROUP BY `subscribe`
                ORDER BY count(`subscribe`) DESC"
        ), "subscribe", "string");
    } 
    public static function GetRecommend(){
        return array_column(User::GetAnyData($_SESSION['user'],
            "SELECT `subscribe` FROM
            (SELECT `subscribe` FROM `user_subscribes` INNER JOIN 
                (SELECT `user` FROM `user_subscribes` INNER JOIN
                    (SELECT `subscribe` FROM `user_subscribes` WHERE `user`=?)
                    AS `subscribed`
                    ON `subscribed`.`subscribe`=`user_subscribes`.`subscribe`
                    GROUP BY `user`)
                AS `mates`
                ON `user_subscribes`.`user`=`mates`.`user`)
            AS `possible_offers`
            GROUP BY `subscribe`
            ORDER BY count(`subscribe`) DESC
        "
        ), "subscribe", "string");
    }
    static function Search($text, $in){
        $text       = is_null($text)   ? '' : $text;
        $in         = is_null($in)     ? '' : $in;

        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("CALL user_search(?, ?)");
        $stmt->bind_param('ss', $text, $in);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        $temp = $queryResult->fetch_all(MYSQLI_ASSOC);
        $temp =  array_column($temp,"user","string");
        if (count($temp)>0){
            return  $temp;
        }else{
            return array();
        }
    }











    public static function UploadIMG(){
        $target_dir = "../../uploads/";
        $imageFileType = strtolower(pathinfo(basename($_FILES["img"]["name"]),PATHINFO_EXTENSION));
        $target_file = $target_dir.$_SESSION['user'].'.'.$imageFileType;
        // Check if image file is a actual image or fake image
        if(getimagesize($_FILES["img"]["tmp_name"]) == false){
            return array("result"=>"File is not an image.");
        }else if ($_FILES["img"]["size"] > 500000){
            return array("result"=>"Sorry, your file is too large.");
        }else if($imageFileType != "jpg" && $imageFileType != "jpeg") {
            return array("result"=>"Sorry, only JPG, JPEG files are allowed.");
        }else if (move_uploaded_file($_FILES["img"]["tmp_name"], $target_file)){
            return array("result"=>"The file ". htmlspecialchars( basename( $_FILES["img"]["name"])). " has been uploaded.");
            } else {
            return array("result"=>"Sorry, there was an error uploading your file.");
            }
    }

    public static function DeleteIMG(){
        $img = "../../uploads/".$_SESSION['user'].'.jpg';
        if (file_exists($img)){
            unlink($img);
            return array("result"=>"Profilkép eltávolítva!");
        }else{
            return array("result"=>"Nincs profilkép feltöltve!");
        }
    }
 
    public static function GetIMG($user){
        $_GET['ctype'] = 'img';
        $img='../../uploads/'.$user.'.jpg'; //this can also be a url
            header('Content-type: jpg');
        if (file_exists($img)){
            $img = file_get_contents($img);
        }else{
            $img = file_get_contents("../../uploads/0.jpg");
        }
        return $img;
    }
















    //Kéréskezelő
    static function requestHandler(){
        if (isset($_GET['request'])){
            switch ($_GET['request']){
                case 'verification'         : return User::verification($_GET['user'], $_GET['code'])->result; break;
                case 'passwordrecoveryrequest'  : return User::passwordRecoveryRequest($_GET['user']); break;
                case 'passwordrecovery'     : return User::passwordRecovery($_GET['user'], $_GET['code']); break;
                case 'basic'                : return User::GetBasic($_GET['user']); break;   
                case 'logged'               : return User::logged(); break;
                case 'subscribed'           : return User::Subscribed($_GET["subscribe"]); break;
                case 'profile'              : return User::GetProfile($_GET['user']); break;
                case 'description'          : return User::GetDescription($_GET['user']); break;
                case 'img'                  : return User::GetIMG($_GET['user']); break;

                case 'popular'              : return User::GetPopular(); break;
                case 'burn'                 : return User::GetBurns(); break;
                case 'followed'             : return User::GetFollowed(); break;
                case 'recommend'            : return User::GetRecommend(); break;
                case 'search'               : return User::Search     ($_GET['text'], $_GET['in']); break;
                default:
                    break;
            }
        }

        if (isset($_POST['action'])){
            switch ($_POST['action']){
                case 'login'                : return User::login($_POST['user'], $_POST['password']); break;
                case 'registration'         : return User::registration($_POST['user'], $_POST['email'], $_POST['password']); break;
                case 'subscribe'            : return User::Subscribe($_POST["subscribe"]);
                case 'unsubscribe'          : return User::Unsubscribe($_POST["subscribe"]);
                case 'logout'               : return User::logout(); break;  
                case 'setprofile'           : return User::SetProfile($_POST['profile']); break;  
                case 'setdescription'       : return User::SetDescription($_POST['description']); break; 
                case 'setpassword'          : return User::SetPassword($_POST['password'], $_POST['newpassword']); break;  
                case 'delete'               : return User::Delete($_POST['password']); break;  
                case 'uploadimg'            : return User::UploadIMG(); break;    
                case 'deleteimg'            : return User::DeleteIMG(); break;  

                default:
                    break;
            }
        }
    }



}














$msg = User::requestHandler();

//echo(json_encode(Post::GetAllData('asd','asd'), JSON_UNESCAPED_UNICODE));
//echo(json_encode(Post::GetAllPost('asd','asd'), JSON_UNESCAPED_UNICODE));
if ($_GET['ctype']=='img'){
    echo $msg;
}else{
    echo(json_encode($msg, JSON_UNESCAPED_UNICODE));
}



?>