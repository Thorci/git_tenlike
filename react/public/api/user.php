<?php

session_start();
require_once('./CONFIG.php');

header('Content-Type: application/json; charset=utf-8');
$_GET['ctype'] ='json';

class User {

    public static function Query (string $query, string $types, $inputs){return Query($query, $types, $inputs);}


//Műveletek
    static function login($user, $password){
        $result = User::Query("SELECT user_login(?, ?) AS result", 'ss', [$user, $password])[0];
        if ($result['result']=="Success"){
            $_SESSION['user'] = array_column(User::Query("SELECT `user` FROM `users` WHERE `user`=?", 's', [$user]), "user", "string")[0];
            return array('user'=>$_SESSION['user'], 'logged'=>1, 'result'=>'Sikeres bejelentkezés!');
        }else{
            $_SESSION['user'] = '';
            return array('user'=>$_SESSION['user'], 'logged'=>0, 'result'=>$result['result']);
        }
    }

    static function Subscribe($subscribe){
       return User::Query("SELECT user_subscribe(?, ?) AS result", 'ss', [$_SESSION['user'], $subscribe])[0];
    }
    
    static function Unsubscribe($subscribe){
       return User::Query("SELECT user_unsubscribe(?, ?) AS result", 'ss', [$_SESSION['user'], $subscribe])[0];
    }


    static function registration($user, $email, $password){
        return User::Query("SELECT user_new(?, ?, ?) AS result", 'sss', [$user, $email, $password])[0];
    }

    static function Delete($password){
        return User::Query("SELECT user_delete(?, ?) AS result", 'ss', [$_SESSION['user'], $password])[0];
    }

    static function SetPassword($password, $newPassword){
        return User::Query("SELECT user_set_password(?, ?, ?) AS result", 'sss', [$_SESSION['user'], $password, $newPassword])[0];
    }

    static function verification($user, $code){
        return User::Query("SELECT user_verification(?, ?) AS result", 'si', [$user, $code])[0];
    }

    static function passwordRecoveryRequest($user){
        return User::Query("SELECT user_password_recovery_request(?) AS result", 's', [$user])[0];
    }

    static function passwordRecovery($user, $code){
        return User::Query("SELECT user_password_recovery(?, ?) AS result", 'si', [$user, $code])[0];
    }

    static function logout(){
        $_SESSION['user']='';
        session_destroy();
        return (object) array('user'=>'', 'logged'=>0, 'result'=>'Kijelentkeztél!');
    }

    static function SetProfile($profile){
        User::Query("REPLACE into `user_profiles` (`user`,`profile`) values(?, ?)", 'ss', [$_SESSION['user'], $profile]);
        return (object) array('result'=>'Profil módosítva!', 'profile'=>$profile);
    }

    static function SetDescription($description){
        User::Query("REPLACE into `user_descriptions` (`user`, `description`) values(?, ?)", 'ss', [$_SESSION['user'], $description]);
        return (object) array('result'=>'Leírás módosítva!', 'description'=>$description);
    }

    static function SetEmail($password, $email){
        return User::Query("SELECT user_set_email(?,?,?) AS result", 'sss', [$_SESSION['user'], $password, $email])[0];
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
        $result = User::Query("SELECT `user`, `email` FROM `users` WHERE `user`=?", 's', [$user])[0];
        if (isset($_SESSION['user']) && $result['user']==$_SESSION['user']){
            $protects = User::Query("SELECT user_get_available_protects(?) AS protects", 's', [$user])[0];
            $result = array_merge($result, $protects);
            $result['logged'] = 1; 
        }else{
            $result['logged']=0; $result['email']=""; $result['protects']="";
        };
        $result = array_merge($result, (array) User::Subscribed($user));
        $result['basic']=1;
        return $result;
    }  
    public static function GetDescription($user){
        return User::Query("SELECT `description` FROM `user_descriptions` WHERE `user`=?", 's', [$user])[0];
    }  
    public static function GetProfile($user){
        return User::Query("SELECT `profile` FROM `user_profiles` WHERE `user`=?", 's', [$user])[0];
    }

    static function Subscribed($subscribe){
        $result = User::Query("select EXISTS(SELECT `subscribe` FROM `user_subscribes` WHERE (`user`=? AND `subscribe`=?)) as `result`", 'ss', [$_SESSION['user'], $subscribe])[0];

        if ($result['result'] == 1){
            return (object) array('subscribed'=>1);
        }else{
            return (object) array('subscribed'=>0);
        }
    }

    //Felhasználók keresése
    public static function GetAllUser(){
        return array_column(User::Query("SELECT `user` FROM `users`", '', []), "user", "string");
    }

    public static function GetPopular(){
        return array_column(User::Query("SELECT `user` FROM `users`", '', []), "user", "string");
    }
    public static function GetFollowed(){
        return array_column(User::Query("SELECT `subscribe` FROM `user_subscribes` WHERE `user`=?", 's', [$_SESSION['user']]), "subscribe", "string");
    }
    public static function Getburns(){
        return array_column(User::Query("SELECT `subscribe`
        FROM `user_subscribes` where datediff(current_date(),`date`)<30
        GROUP BY `subscribe`
        ORDER BY count(`subscribe`) DESC", '', []), "subscribe", "string");
    } 
    public static function GetRecommend(){
        return array_column(User::Query("SELECT `subscribe` FROM
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
        ORDER BY count(`subscribe`) DESC", '', []), "subscribe", "string");
    }








    static function Search($text, $in){
        $text       = is_null($text)   ? '' : $text;
        $in         = is_null($in)     ? '' : $in;
        return array_column(User::Query("CALL user_search(?, ?)", 'ss', [$text, $in]),"user","string");
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
                case 'verification'         : return User::verification($_GET['user'], $_GET['code'])['result']; break;
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
                case 'setemail'             : return User::SetEmail($_POST['password'], $_POST['email']); break;  
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

if ($_GET['ctype']=='img'){
    echo $msg;
}else{
    echo(json_encode($msg, JSON_UNESCAPED_UNICODE));
}



?>