<?php
    $tablename=$_GET["tablename"];//表名称
    $datetime=$_GET["datetime"];//第1页
    $mysqli = new mysqli("localhost","root","admin","bigdata");
    if(!$mysqli){
        die('Could not connect:'.mysql_error());
    }
    for ($i=1; $i<=30; $i++)
    {
        if ($i < 10){
            $datetimestr = $datetime .'-0' .strval($i);
            $sql = "select 时间,AQI,X,Y,COP,NO2P from `" .$tablename ."` where `时间` like '%" .$datetime .'-0' .strval($i) ."%'";//查询
            //echo $sql ."<br>";
        }
        else {
            $datetimestr = $datetime .'-' .strval($i);
            $sql = "select 时间,AQI,X,Y,COP,NO2P from `" .$tablename ."` where `时间` like '%" .$datetime .'-' .strval($i) ."%'";//查询
            //echo $sql ."<br>";
        }

        // $sql = "select * from " .$tablename;//查询全部数据
        $result = $mysqli->query($sql);
        $data = array();
        while($row = $result->fetch_assoc()){
            $data[] = $row;
        }
        $result_json[] = array('status'=>"success","datetime"=>$datetimestr,'data' => $data);
    }
    $mysqli->close();
    //输出响应
    //echo json_encode($arr);
    echo json_encode($result_json);
?>