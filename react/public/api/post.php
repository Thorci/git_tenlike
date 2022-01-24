<?php


session_start();
require_once('./CONFIG.php');

if (!isset($_SESSION['user'])) $_SESSION['user']='';

class Post {





    /**
     * @method GetAnyData
     * @param string $title Post címe
     * @param string $publisher Post publikálója
     * @param string $queryString Előkészített lekérdezés
     */
    static function GetAnyData(string $id, string $queryString, string $type='i'){
        $conn = new DB_conn();
        if ($id==0){
            $queryResult = $conn->mysqli->query($queryString);
            unset($conn);
            return $queryResult->fetch_all(MYSQLI_ASSOC);
        }//else

        $stmt = $conn->mysqli->prepare($queryString);
        $stmt->bind_param($type, $id);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        return $queryResult->fetch_all(MYSQLI_ASSOC);
    }

//Adott cikk lekérdezései
    static function GetBasicData($id){
        $result = Post::GetAnyData($id, "SELECT * FROM `posts` WHERE `id`=?");
        if (count($result)>0){
            $result=$result[0];
            if (isset($_SESSION['user']) && $result['publisher']==$_SESSION['user']) $result['editable'] = 1; else $result['editable'] = 0;
            if (isset($_SESSION['user'])) $result['commentable'] = 1; else $result['commentable'] = 0;
            $result['basic']=1;
            return $result;
        }else{
            return array("result"=>'Nincs ilyen bejegyzés!');
        }
    }
    static function GetContent($id){
        $result = Post::GetAnyData($id, "SELECT `content`, `posts_id` as `id`   FROM `post_contents` WHERE `posts_id`=?");
        if (count($result)>0){return $result[0];}
        return array('content'=>'');
    }
    static function GetDescription($id){
        $result = Post::GetAnyData($id, "SELECT `description`, `posts_id` as `id` FROM `post_descriptions` WHERE `posts_id`=?");
        if (count($result)>0){return $result[0];}
        return array('description'=>'');
    }
    static function GetChildren($id){
        $result = array();
        $temp = Post::GetAnyData($id, "SELECT `id` FROM `posts` WHERE `parent_id`=?");
        if ($temp!=null) $result['children'] = array_column($temp, 'id'); else $result["children"]=array();
        return $result;
    }
    static function GetCategories(){
        $result = array();
        $temp = Post::GetAnyData(0, "SELECT `name` FROM `post_categories`");
        if ($temp!=null) $result['categories'] = array_column($temp, 'name'); else $result["categories"]=array();
        return $result;
    }
    static function GetLabels($id){
        $result = array();
        $temp = Post::GetAnyData($id, "SELECT `label` FROM `post_labels` WHERE `posts_id`=?");
        if ($temp!=null) $result['labels'] = array_column($temp, 'label'); else $result["labels"]=array();
        return $result;
    }

    static function GetAllData($id){
        $result = array();
        $result = array_merge($result, (array) Post::GetBasicData($id));
        $result = array_merge($result, (array) Post::GetContent($id));
        $result = array_merge($result, (array) Post::GetDescription($id));
        $result = array_merge($result, (array) Post::GetChildren($id));
        $result = array_merge($result, (array) Post::GetLabels($id));

        return (object) $result;
    }



//Cikkek keresése
    public static function GetAllPost(){
        return Post::GetAnyData(0, "SELECT `id` FROM `posts`");
    }
    public static function GetPopular(){
        return array_column(Post::GetAnyData(0, "SELECT `id` FROM `posts` INNER JOIN `post_descriptions` ON `id`=`posts_id` ORDER BY `score` DESC"), "id", "int");
    } 
    public static function GetMyPosts(){
        return array_column(Post::GetAnyData($_SESSION['user'], "SELECT `id` FROM `posts` WHERE `publisher`=? ORDER BY `score` DESC", "s"), "id", "int");
    } 
    public static function GetBurns(){
        return array_column(Post::GetAnyData(0,
        "   SELECT `parent_id`
            FROM `posts` where datediff(current_date(),`created`)<3 AND NOT isnull(`parent_id`)
            GROUP BY `parent_id`
            ORDER BY count(`id`) DESC"
        ), "parent_id", "int");
    }
    public static function GetRecommend(){
        //Kommentelt cikkeket kommentelők kommentjeit összesíti, hogy melyik cikkeket kommentelték majd sorba állítja
        //Ajánlott felhasználók: Kedvelt felhasználókat kedvelő felhasználók által kedvelt felhasználók összeszámolása és sorba állítása

        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare(
            "SELECT `id` FROM
                (SELECT `id` , `posts`.`publisher` AS `publisher` FROM `posts` INNER JOIN
                    (SELECT `parent_id` FROM `posts` INNER JOIN
                        (SELECT `publisher` FROM
                            (SELECT `publisher` FROM `posts` INNER JOIN
                                (SELECT `parent_id` FROM `posts` WHERE `publisher`=? GROUP BY `parent_id`)
                                AS `my_posts_parents` #saját cikkek szülei
                                ON `posts`.`parent_id`=`my_posts_parents`.`parent_id`)
                            AS `mates`
                            WHERE `publisher` != 'a'
                            GROUP BY `publisher`)
                        AS `distinct_mates`
                        ON `posts`.`publisher`=`distinct_mates`.`publisher`)
                    AS `post_mates`
                    ON `posts`.`id`=`post_mates`.`parent_id`)
                AS `recommended`
            WHERE NOT `id` IS NULL AND `publisher`!=?
            GROUP BY `id`
            ORDER BY count(`id`) DESC");
        $stmt->bind_param('ss', $_SESSION['user'], $_SESSION['user']);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        $temp = $queryResult->fetch_all(MYSQLI_ASSOC);
        $temp =  array_column($temp,"id","int");
        if (count($temp)>0){
            return  $temp;
        }else{
            return array();
        }
    } 


    public static function GetFresh(){
        return array_column(Post::GetAnyData(0, "SELECT `id` FROM `posts` INNER JOIN `post_descriptions` ON `id`=`posts_id` ORDER BY `created` DESC LIMIT 100"), "id", "int");
    } 
    public static function GetFollowed(){
        return array_column(Post::GetAnyData($_SESSION['user'],
            "   SELECT `id` FROM `posts`
                INNER JOIN `post_descriptions`   ON `id`=`posts_id`
                JOIN (SELECT `subscribe` from `user_subscribes`where `user`=?) AS `table` on `subscribe`=`publisher`
                ORDER BY `score` DESC",
        "s"), "id", "int");
    } 
    public static function GetUserPosts($user){
        return array_column(Post::GetAnyData($user, "SELECT `id` FROM `posts` WHERE `publisher`=? ORDER BY `score` DESC", 's'), "id", "int");
    }   

    static function Search($text, $in, $category, $labels, $sort, $direction){
        $text       = is_null($text)         ? '' : $text; 
        $in         = is_null($in)           ? '' : $in; 
        $category   = is_null($category)     ? '' : $category; 
        $labels     = is_null($labels)       ? '' : $labels; 
        $sort       = is_null($sort)         ? '' : $sort; 
        $direction  = is_null($direction)    ? '' : $direction; 

        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("CALL post_search(?, ?, ?, ?, ?, ?)");
        $stmt->bind_param('ssssss', $text, $in, $category, $labels, $sort, $direction);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        $temp = $queryResult->fetch_all(MYSQLI_ASSOC);
        $temp =  array_column($temp,"id","int");
        if (count($temp)>0){
            return  $temp;
        }else{
            return array();
        }
    }





//Cikk műveletek
/**
 * post_new
 * post_check
 * post_protect_set
 * post_protect_unset
 * post_description_set
 * post_content_set
 * post_label_add
 * post_label_delete
 * post_category_set
 * post_emoticon_set
 * post_title_set
 */

    static function new($title, $user, $parent_id, $keep_alive){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT post_new(?, ?, ?, ?) AS result");
        $stmt->bind_param('ssii', $title, $user, $parent_id, $keep_alive);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1){
            $result = $queryResult->fetch_object();
            if (is_numeric($result->result)){
                $result->id=intval($result->result);
            }
        }else{
            $result = array('Err'=>'404');
        }
        return  $result;
    }
    static function check($user, $post_id, $check_level){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT post_check(?, ?, ?) AS result");
        $stmt->bind_param('sii', $user, $post_id, $check_level);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1)
            return $queryResult->fetch_object();
        
        return  array('Err'=>'404');
    }
    static function protect_set($user, $post_id){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT post_protect_set(?, ?) AS result");
        $stmt->bind_param('si', $user, $post_id);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1){
            $result = $queryResult->fetch_object();
            $result->protect=1;
            $temp = Post::GetBasicData($post_id);
            if (count($temp)>0)
                return array_merge((array)$result, (array)$temp);
                else
                return $result;
        }
        
        return  array('result'=>'Sikertelen!');
    }
    static function protect_unset($user, $post_id){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT post_protect_unset(?, ?) AS result");
        $stmt->bind_param('si', $user, $post_id);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1){
            $result = $queryResult->fetch_object();
            $result->protect=0;
            return $result;
        }
        
        return array('result'=>'Sikertelen!');
    }
    static function description_set($user, $post_id, $description){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT post_description_set(?, ?, ?) AS result");
        $stmt->bind_param('sis', $user, $post_id, $description);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1){
        return array_merge((array) $queryResult->fetch_object(),  Post::GetDescription($post_id));
        }
        
        return  Post::GetDescription($post_id);
    }
    static function content_set($user, $post_id, $content){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT post_content_set(?, ?, ?) AS result");
        $stmt->bind_param('sis', $user, $post_id, $content);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1){
            return array_merge((array) $queryResult->fetch_object(), (array) Post::GetContent($post_id));
        }
        
        return  Post::GetContent($post_id);
    }
    static function label_add($user, $post_id, $label){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT post_label_add(?, ?, ?) AS result");
        $stmt->bind_param('sis', $user, $post_id, $label);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1)
            return array_merge((array)$queryResult->fetch_object(), Post::GetLabels($post_id));
        
        return  array('Err'=>'404');
    }
    static function label_delete($user, $post_id, $label){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT post_label_delete(?, ?, ?) AS result");
        $stmt->bind_param('sis', $user, $post_id, $label);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1)
            return array_merge((array)$queryResult->fetch_object(), Post::GetLabels($post_id));
        
        return  array('Err'=>'404');
    }
    static function category_set($user, $post_id, $category){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT post_category_set(?, ?, ?) AS result");
        $stmt->bind_param('sis', $user, $post_id, $category);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1)
            return $queryResult->fetch_object();
        
        return  array('Err'=>'404');
    }
    static function emoticon_set($user, $post_id, $emoticon){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT post_emoticon_set(?, ?, ?) AS result");
        $stmt->bind_param('sis', $user, $post_id, $emoticon);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1)
            return $queryResult->fetch_object();
        
        return  array('Err'=>'404');
    }
    static function title_set($user, $post_id, $title){
        $conn = new DB_conn();
        $stmt = $conn->mysqli->prepare("SELECT post_title_set(?, ?, ?) AS result");
        $stmt->bind_param('sis', $user, $post_id, $title);
        $stmt->execute();
        $queryResult = $stmt->get_result();
        $stmt->close();
        unset($conn);

        if ($queryResult->num_rows == 1)
            return array_merge((array)$queryResult->fetch_object(),Post::GetBasicData($post_id));
        
        return  array('Err'=>'404');
    }
    

    //Kéréskezelő
    static function requestHandler(){
        if (isset($_GET['request'])){
            switch ($_GET['request']){
                case 'basic'        : return Post::GetBasicData     ($_GET["id"]);  break;
                case 'content'      : return Post::GetContent       ($_GET["id"]);  break;
                case 'description'  : return Post::GetDescription   ($_GET["id"]);  break;
                case 'children'     : return Post::GetChildren      ($_GET["id"]);  break;
                case 'labels'       : return Post::GetLabels        ($_GET["id"]);  break;
                case 'all'          : return Post::GetAllData       ($_GET["id"]);  break;
                case 'search'       : return Post::Search           ($_GET['text'], $_GET['in'], $_GET['category'], $_GET['labels'], $_GET['sort'], $_GET['direction']); break;

                case 'categories'   : return Post::GetCategories    ();            break;

                case 'popular'      : return Post::GetPopular       ();            break;
                case 'myposts'      : return Post::GetMyPosts       ();            break;
                case 'burn'         : return Post::GetBurns         ();            break;
                case 'recommend'    : return Post::GetRecommend     ();            break;
                case 'fresh'        : return Post::GetFresh         ();            break;
                case 'follow'       : return Post::GetFollowed      ();            break;
                case 'userarticles' : return Post::GetUserPosts     ($_GET['user']); break;
                default:
                    break;
            }
        }

        if (isset($_POST['action'])){
            switch ($_POST['action']){
                case 'new'              : return Post::new               ($_POST['title'], $_SESSION['user'], $_POST['parent_id'], $_POST['keep_alive']);   break;
                case 'protect'          : return Post::protect_set       ($_SESSION['user'], intval($_POST['id']));                             break;
                case 'unprotect'        : return Post::protect_unset     ($_SESSION['user'], intval($_POST['id']));                             break;
                case 'setdescription'   : return Post::description_set   ($_SESSION['user'], $_POST['id'], $_POST['description']);      break;
                case 'setcontent'       : return Post::content_set       ($_SESSION['user'], $_POST['id'], $_POST['content']);          break;
                case 'addlabel'         : return Post::label_add         ($_SESSION['user'], $_POST['id'], $_POST['label']);            break;
                case 'deletelabel'      : return Post::label_delete      ($_SESSION['user'], $_POST['id'], $_POST['label']);            break;
                case 'setcategory'      : return Post::category_set      ($_SESSION['user'], $_POST['id'], $_POST['category']);         break;
                case 'setemoticon'      : return Post::emoticon_set      ($_SESSION['user'], $_POST['id'], $_POST['emoticon']);         break;
                case 'settitle'         : return Post::title_set         ($_SESSION['user'], $_POST['id'], $_POST['title']);            break;
                


                default:
                    break;
            }
        }
    }



}














$msg = Post::requestHandler();

//echo(json_encode(Post::GetAllData('asd','asd'), JSON_UNESCAPED_UNICODE));
//echo(json_encode(Post::GetAllPost('asd','asd'), JSON_UNESCAPED_UNICODE));
echo(json_encode($msg, JSON_UNESCAPED_UNICODE));








?>

