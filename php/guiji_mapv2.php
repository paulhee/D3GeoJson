<?php
    ini_set('memory_limit','204800M');
    date_default_timezone_set("Asia/Shanghai");
    set_time_limit(0);
    $tablename=$_GET["tablename"];//表名称
    $enteredDay=$_GET["enteredDay"];
    $mysqli = new mysqli("172.16.4.206:3306","root","admin","bigdata");
    if(!$mysqli){
        die('Could not connect:'.mysql_error());
    }
    $distinctIDsql = "select jd,wd,enteredTime from " .$tablename ." where people='4' and enteredDay = '" .$enteredDay ."'";//查询全部数据
    $result_ID = $mysqli->query($distinctIDsql);
    $data = array();
    $count=0;
    while($row = $result_ID->fetch_assoc()){
        $coordinates = array('type'=>'Point','coordinates'=>array(floatval($row["jd"]),floatval($row["wd"])));
        //$temp=array('geometry'=>$coordinates,'time'=>strtotime($row["enteredTime"]));
        //array_push($data,$temp);
        echo json_encode($coordinates);
        $count=$count+1;
        if($count > 5)
        {
            break;
        }
    }
    $result_json = $data;
    $mysqli->close();
    //echo json_encode($result_json);
?>              