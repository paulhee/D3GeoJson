<?php
    $tablename=$_GET["tablename"];//表名称
    $datetime=$_GET["datetime"];//第1页
    $mysqli = new mysqli("localhost","root","admin","bigdata");
    if(!$mysqli){
        die('Could not connect:'.mysql_error());
    }
    $timelist = array('2018-04-25','2018-04-26','2018-04-27','2018-04-28','2018-04-29','2018-04-30','2018-05-01','2018-05-02','2018-05-03','2018-05-04');
    $spotName = array('磁器口牌坊','鑫记杂货铺','横街','老字号总汇','小重庆碑','宝善宫','巴渝民居馆','西门','少妇尿童','钟家大院');
    foreach($timelist as $item){
        $data = array();
        foreach($spotName as $sn){
            $sql = "select count(*) from " .$tablename ." where spotName='" .$sn ."' AND enteredDay='" .$item ."'" ;//查询
            //echo $sql .'<br>';
            $result_count = $mysqli->query($sql);
            $totalRow = $result_count->fetch_row()[0];//一共多少行
            //echo $totalRow .'<br>';
            $data[] = array('spotName'=>$sn,'count'=>$totalRow);
        }
        $result_json[] = array('status'=>"success","datetime"=>$item,'data' => $data);
    }
    $mysqli->close();
    //输出响应
    echo json_encode($result_json);
?>