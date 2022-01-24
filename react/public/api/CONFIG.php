<?php

define('DB_HOST', "127.0.0.1");
define('DB_USER', "tenlikeh");
define('DB_PASSWORD', "kisbetuNAGYBETU123");
define('DB_NAME', "tenlikeh_tenlike");

$connect = mysqli_connect(DB_HOST,DB_USER,DB_PASSWORD,DB_NAME);

if(!$connect)
{
	die('Kapcsolódási hiba: '.mysqli_connect_errno().' '.mysqli_connect_error());
}


mysqli_query($connect,"SET NAMES 'UTF8'");
mysqli_query($connect,"SET CHARACTER SET 'UTF8'");

class DB_conn{
	public $mysqli;
	public function __construct(){
		$this->mysqli = mysqli_connect(DB_HOST,DB_USER,DB_PASSWORD,DB_NAME);
		mysqli_query($this->mysqli,"SET NAMES 'UTF8'");
		mysqli_query($this->mysqli,"SET CHARACTER SET 'UTF8'");
	}

	public function __destruct(){
		$this->mysqli->close();
	}
}

?>