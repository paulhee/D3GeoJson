<?php
    set_time_limit(0);
    $tablename=$_GET["tablename"];//表名称
    $enteredDay=$_GET["enteredDay"];
    $mysqli = new mysqli("localhost","root","admin","bigdata");
    if(!$mysqli){
        die('Could not connect:'.mysql_error());
    }
    $distinctIDsql = "select DISTINCT mac from " .$tablename ." where enteredDay = '" .$enteredDay ."'";//查询全部数据
    $result_ID = $mysqli->query($distinctIDsql);
    //echo $distinctIDsql ."<br>";
    $data = array();
    $count=0;
    while($row = $result_ID->fetch_assoc()){
            $Onesql = "select * from " .$tablename ." where mac = '" .$row["mac"] ."' and enteredDay = '" .$enteredDay ."'";
            //echo $Onesql ."<br>";
            $result_One = $mysqli->query($Onesql);
            $num_rows=mysqli_num_rows($result_One);
            $jwd=array();
            while($row1 = $result_One->fetch_assoc()){
                $jwd[] = array(floatval($row1["jd"]),floatval($row1["wd"]));
            }
            if($num_rows == 1){
                $jwd[] = $jwd[0];
            }
            $color=array('normal'=>array('color'=>"rgba(200, 40, 0, 1)"));//"rgba(" .rand(1,255) ."," .rand(1,255) ."," .rand(1,255) .",1)"
            $data[]=array('coords'=>$jwd,'lineStyle'=>$color);//'lonlat'=>$jwd,
            //echo $Onesql ."<br>";
            if($count == 5000){
               break;
            }
            $count = $count+1;
    }
    $result_json = $data;//array('status'=>"success",'data' => $data)
    $mysqli->close();
    echo json_encode($result_json);
?>