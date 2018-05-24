<?php
    $tablename=$_GET["tablename"];//表名称
    $page=$_GET["page"];//第1页
    $pageSize=50;//每页20条记录
    $mysqli = new mysqli("localhost","root","admin","bigdata");
    if(!$mysqli){
        die('Could not connect:'.mysql_error());
    }
    $sql = "select * from " .$tablename ." limit ".($page-1)*$pageSize ."," .$pageSize;//查询某页数据
    // $sql = "select * from " .$tablename;//查询全部数据
    $result = $mysqli->query($sql);
    //查询表中一共多少行
    $sql1 = "select count(*) from " .$tablename;
    $result_count = $mysqli->query($sql1);
    $totalRow = $result_count->fetch_row()[0];//一共多少行
    $totalPage = ceil($totalRow/$pageSize);//计算一共多少页
    $data = array();
    while($row = $result->fetch_assoc()){
        $data[] = $row;
    }
    $result_json = array('status'=>"success",'pSize'=>$pageSize,'cPage'=>$page,'totals'=>$totalRow,'totalPage'=>$totalPage,'data' => $data);
    // $result_json = array('status'=>"success","totals"=>$totalRow,'data' => $data);
    // $result_json = $data;
    //$arr['dt'] = $dt;
    $mysqli->close();
    //输出响应
    //echo json_encode($arr);
    echo json_encode($result_json);
?>