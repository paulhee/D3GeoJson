<?php
    $tablename=$_GET["tablename"];//表名称
    $datetime=$_GET["datetime"];//第1页
    $mysqli = new mysqli("localhost","root","admin","bigdata");
    if(!$mysqli){
        die('Could not connect:'.mysql_error());
    }
    $sql = "select * from `" .$tablename ."` where `时间` like '%" .$datetime ."%'";//查询
    // $sql = "select * from " .$tablename;//查询全部数据
    $result = $mysqli->query($sql);
    $data = array();
    while($row = $result->fetch_assoc()){
        $data[] = $row;
    }
    $result_json = array('status'=>"success",'data' => $data);
    $mysqli->close();
    //输出响应
    //echo json_encode($arr);
    echo json_encode($result_json);
?>