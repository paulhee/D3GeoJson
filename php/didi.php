<?php
    date_default_timezone_set("Asia/Shanghai");//设置时间戳转换
    set_time_limit(0);//设置访问超时
    $tablename=$_GET["tablename"];//表名称
    $mysqli = new mysqli("localhost:3306","root","admin","bigdata");
    if(!$mysqli){
        die('Could not connect:'.mysql_error());
    }
    $distinctIDsql = "select * from " .$tablename;//查询全部数据
    $result_ID = $mysqli->query($distinctIDsql);
    //echo $distinctIDsql ."<br>";
    $data = array();
    $count=0;
    while($row = $result_ID->fetch_assoc()){
        $jwd=array();
        $orderID = $row["ID"];
        $guijistr = $row["guiji"];
        $guijilist = explode(";", $guijistr);
        foreach($guijilist as $item){
            $ii =  explode(",", $item);
            if(count($ii) > 3){
                $lon=$ii[0];
                $lat=$ii[1];
                $timestamp=$ii[2];
                //echo $timestamp ."<br>";
                //$speed=$ii[3];
                //$direction=$ii[4];
                //$data_source=$ii[5];
                //$coord_system=$ii[6];
                $jwd[] = array(floatval($lon),floatval($lat),floatval($timestamp));
            }
        }
        $data[]=array('geo'=>$jwd,'count'=>"1");//'lonlat'=>$jwd,
    }
    $result_json = $data;//array('status'=>"success",'data' => $data)
    $mysqli->close();
    echo json_encode($result_json);
?>