<?php
    $tablename=$_GET["tablename"];//表名称
    $mysqli = new mysqli("localhost","root","admin","bigdata");
    if(!$mysqli){
        die('Could not connect:'.mysql_error());
    }
    $distinctIDsql = "select DISTINCT id from " .$tablename;//查询全部数据
    $result_ID = $mysqli->query($distinctIDsql);
    $data = array();
    $count=0;
    while($row = $result_ID->fetch_assoc()){
    	 $Onesql = "select * from " .$tablename ." where id = '" .$row["id"] ."'";
    	 $result_One = $mysqli->query($Onesql);
    	 $jwd=array();
    	 while($row1 = $result_One->fetch_assoc()){
                $jwd[] = array(floatval($row1["jd"]),floatval($row1["wd"]));
         }
         $data[]=$jwd;
    	 //echo $Onesql ."<br>";
    	 if($count == 10){
    	    break;
    	 }
    	 $count = $count+1;
    }
    $result_json = array('status'=>"success",'data' => $data);
    $mysqli->close();
    echo json_encode($result_json);
?>