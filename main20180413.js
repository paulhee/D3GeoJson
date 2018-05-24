//点击TOC标签栏收缩展开功能
$(document).ready(function() {
    // Store variables
    var accordion_head = $('.father'),
        accordion_body = $('.sub-menu');
    // Open the first tab on load
    accordion_head.first().addClass('active').next().slideDown('normal');
    // Click function
    accordion_head.on('click', function(event) {
        // Disable header links
        event.preventDefault();
        // Show and hide the tabs on click
        if ($(this).attr('class') != 'active'){
            accordion_body.slideUp('normal');
            $(this).next().stop(true,true).slideToggle('normal');
            accordion_head.removeClass('active');
            $(this).addClass('active');
        }
        else {
            accordion_body.slideUp('normal');
            accordion_head.removeClass('active');
        }
    });
});

//初始化地图
function initDemoMap(){
    var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '重庆市地理信息中心'
    });
    var LeafletMap = L.tileLayer("https://api.mapbox.com/styles/v1/paulhee/cjdnz7b0p066i2spf0cx8u0wh/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGF1bGhlZSIsImEiOiJjamRuejZiaWswZ3F5Mnhwa2MzYnRjOGk3In0.03hUpjD-1h79z5XJJ_w6Qg");
    // var TiandiMap = L.tileLayer()
    var baseLayers = {
        "Satellite": Esri_WorldImagery,
        "LeafletMap":LeafletMap
    };
    var map = L.map('map', {
        layers: [ Esri_WorldImagery ]
    });
    //图层控制控件
    var layerControl = L.control.layers(baseLayers);
    layerControl.addTo(map);

    //添加画图控件
    var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    var drawcontrol = new L.Control.Draw({
        edit:{
            featureGroup:drawnItems
        }
    });
    map.addControl(drawcontrol);
    map.on('draw:created',function (e) {
        var type = e.layerType,
            layer = e.layer;
        drawnItems.addLayer(layer);
    });

    //加载中国地图的geojson文件
    function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }
    var transform = d3.geoTransform({point: projectPoint}),
        path = d3.geoPath().projection(transform);
    d3.json("./Data/china.json", function(error, collection){
        if (error) throw error;
        var svg = d3.select(map.getPanes().overlayPane).append("svg").attr("class","leaflet-zoom-animated"),
            g = svg.append("g").attr("class", "leaflet-zoom-hide");
        var feature = g.selectAll("path").data(collection.features).enter().append("path").attr("class","leaflet-clickable");
        function reset() {
            var bounds = path.bounds(collection),
                topLeft = bounds[0],
                bottomRight = bounds[1];
            svg .attr("width", bottomRight[0] - topLeft[0])
                .attr("height", bottomRight[1] - topLeft[1])
                .style("left", topLeft[0] + "px")
                .style("top", topLeft[1] + "px");
            g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
            feature.attr("d", path).attr("stroke",function (d) {
                var value = d.properties.type;
                if(value){
                    var c = mycolor[parseInt(value)-1];
                    if (value == "1"){
                        var cc =c;
                    }
                    return c;
                }
                else {
                    return "rgb(10,205,0)";
                }
            }).attr('stroke-width', 1).attr('fill','none').attr("class","leaflet-clickable");
        }
        map.on("viewreset", reset);
        map.on("zoomend",reset);
        reset();
    });

    map.setView([29.578787, 106.544229], 6);

    return {
        map: map,
        layerControl: layerControl
    };
}

// demo map
var mapStuff = initDemoMap();
var map = mapStuff.map;
var layerControl = mapStuff.layerControl;
var handleError = function(err){
    console.log('handleError...');
    console.log(err);
};

// var color = d3.scaleQuantize().range(["rgb(255,158,25)","rgb(243,48,48)","rgb(255,0,0)","rgb(0,255,0)"]);
var mycolor = new Array("rgb(0,255,0)","rgb(255,158,25)","rgb(243,48,48)","rgb(255,0,0)");
// Use Leaflet to implement a D3 geometric transformation.
function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}
var transform = d3.geoTransform({point: projectPoint}),
    path = d3.geoPath().projection(transform);

//交通数据
function RealTimeTraffic() {
    var svg = document.getElementById("svg_RealTimeTraffic");
    if (svg == null){
        $(".loading").css("display","block");//显示加载过程的图标
        d3.json("./Data/20180108_20180112.json", function(error, collection){
            if (error) throw error;
            var svg = d3.select(map.getPanes().overlayPane).append("svg").attr("class","leaflet-zoom-animated").attr("id","svg_RealTimeTraffic"),
                g = svg.append("g").attr("class", "leaflet-zoom-hide");
            var feature = g.selectAll("path").data(collection.features).enter().append("path").attr("class","leaflet-clickable");
            function reset() {
                var bounds = path.bounds(collection),
                    topLeft = bounds[0],
                    bottomRight = bounds[1];
                svg .attr("width", bottomRight[0] - topLeft[0])
                    .attr("height", bottomRight[1] - topLeft[1])
                    .style("left", topLeft[0] + "px")
                    .style("top", topLeft[1] + "px");
                g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
                feature.attr("d", path).attr("stroke",function (d) {
                    var value = d.properties.type;
                    if(value){
                        var c = mycolor[parseInt(value)-1];
                        if (value == "1"){
                            var cc =c;
                        }
                        return c;
                    }
                    else {
                        return "rgb(10,205,0)";
                    }
                }).attr('stroke-width', 1).attr('fill','none').attr("class","leaflet-clickable");
            }
            map.on("viewreset", reset);
            map.on("zoomend",reset);
            reset();
            $(".loading").css("display","none");//关闭加载过程的图标
        });
    }else {
        svg.parentNode.removeChild(svg);
    }

}

function lianjia(filename) {
    $("#map").css('display',"block");
    $("#table").css('display',"none");
    var svg = document.getElementById("svg_"+filename);
    if (svg == null){
        $(".loading").css("display","block");//显示加载过程的图标
        d3.json("Data/"+filename+".json", function(error, collection){
            if (error) throw error;
            var svg = d3.select(map.getPanes().overlayPane).append("svg").attr("class","leaflet-zoom-animated").attr("id","svg_"+filename),
                g = svg.append("g").attr("class", "leaflet-zoom-hide");
            var feature = g.selectAll("path").data(collection.features).enter().append("path").attr("class","leaflet-clickable");
            function reset() {
                var bounds = path.bounds(collection),
                    topLeft = bounds[0],
                    bottomRight = bounds[1];
                svg .attr("width", bottomRight[0] - topLeft[0])
                    .attr("height", bottomRight[1] - topLeft[1])
                    .style("left", topLeft[0] + "px")
                    .style("top", topLeft[1] + "px");
                g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
                feature.attr("d", path).attr("stroke","rgb(10,205,0)").attr('stroke-width', 1).attr('fill','rgb(10,205,0)').attr("r","200").attr("class","leaflet-clickable");
            }
            map.on("viewreset", reset);
            map.on("zoomend",reset);
            reset();
            $(".loading").css("display","none");//关闭加载过程的图标
        });
    }else {
        svg.parentNode.removeChild(svg);
    }
}

function is_weixin() {
    return /MicroMessenger/i.test(navigator.userAgent);
}

function is_android() {
    return navigator.userAgent.toLowerCase().match(/(Android|SymbianOS)/i);
}

function is_ios() {
    return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
}

function CQ315HOUSE() {
    if (is_weixin()) {
        if (typeof WeixinJSBridge == "undefined") {
            if (document.addEventListener) {
                document.addEventListener("WeixinJSBridgeReady", init, false);

            } else if (document.attachEvent) {
                document.attachEvent("WeixinJSBridgeReady", init);
                document.attachEvent("onWeixinJSBridgeReady", init);
            }
        } else {
            init();
        }
    } else {
        //百度
        // window.location.href = "bdapp://map/direction?origin=name:广电大厦|latlng:29.599861,106.503806&destination=name:海王星科技大厦|latlng:29.620452,106.516103&mode=driving&sy=0&region=重庆市";
        // window.location.href = "iosamap://"
        //高德
        window.location.href ="http://uri.amap.com/navigation?from=106.503806,29.599861,startpoint&to=106.516103,29.620452,endpoint&mode=car&policy=0&src=mypage&coordinate=gaode&callnative=1";
    }

}

d3.json("Data/china.json", function(error, collection){
    if (error) throw error;
    var svg = d3.select(map.getPanes().overlayPane).append("svg").attr("class","leaflet-zoom-animated"),
        g = svg.append("g").attr("class", "leaflet-zoom-hide");
    var feature = g.selectAll("path").data(collection.features).enter().append("path").attr("class","leaflet-clickable").attr("fill","#000").attr("fill-opacity","0.2").attr("stroke","#fff").attr("stroke-width","1.5px");
    function reset() {
        var bounds = path.bounds(collection),
            topLeft = bounds[0],
            bottomRight = bounds[1];
        svg .attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");
        g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
        feature.attr("d", path).attr("class","leaflet-clickable");
    }
    map.on("viewreset", reset);
    map.on("zoomend",reset);
    reset();
});

window.onload = function() {
    var left = document.getElementById("left");
    var right = document.getElementById("right");
    var middle = document.getElementById("middle");
    var middleWidth=5;
    middle.onmousedown = function(e) {
        var disX = (e || event).clientX;
        middle.left = middle.offsetLeft;
        document.onmousemove = function(e) {
            var iT = middle.left + ((e || event).clientX - disX);
            var e = e||window.event,tarnameb=e.target||e.srcElement;
            maxT=document.body.clientWidth;
            iT < 0 && (iT = 0);
            iT > maxT && (iT = maxT);
            middle.style.left = left.style.width = iT + "px";
            right.style.width = document.body.clientWidth - iT -middleWidth + "px";
            right.style.left = iT+middleWidth+"px";
            return false
        };
        document.onmouseup = function() {
            document.onmousemove = null;
            document.onmouseup = null;
            middle.releaseCapture && middle.releaseCapture()
        };
        middle.setCapture && middle.setCapture();
        return false
    };
};

//控制左侧TOC显示与隐藏
function middleclick() {
    if ($("#left").css("display") == "block"){
        $("#left").css("display","none");
    }else {
        $("#left").css("display","block");
    }
}

//选中与否改变图标颜色
$(function () {
    //修改点中的颜色
    $(".fa-map").click(function (event) {
        var target = $(event.target);
        if (target.css("color") != "rgb(255, 0, 0)"){
            target.css("color","red");//选中
        }else {
            target.css("color","rgb(121, 121, 121)");//未选中
        }
    });

    // 删除功能
    function delectRowData(node){
        // 获取到当前的tr node
        var tr = node.parentNode.parentNode;
        // 获取到当前渲染tr 所使用的数据
        var rowData = document.querySelector('table').GM('getRowData', tr);
        // 执行删除操作
        if(window.confirm('确认要删除['+rowData.name+']?')){
            window.alert('当然这只是个示例,并不会真实删除,要不然每天我每天就光填demo数据了.');
        }
    }
});


function table_load(tablename) {
    $(".loading").css("display","flex");//显示加载过程的图标
    $("#map").css('display',"none");
    $("#table").css('display',"block");
    var xmlHttp = GetXmlHttpObject();// XMLHttpRequest对象用于在后台与服务器交换数据
    if (xmlHttp == null){
        alert("Browser does not support HTTP Request");
        return;
    }
    // var tablename="xiaoqu";
    var url = "./php/main.php?tablename="+tablename+"&page=1";
    xmlHttp.onreadystatechange=stateChanged(xmlHttp);
    xmlHttp.open("GET",url,false);
    xmlHttp.send();
    var responseText = xmlHttp.responseText;//从服务器获得数据
    var responseJson = JSON.parse(responseText);
    var columnDataJson = new Array();
    for (var i =0;i<responseJson.data.length;i++){
        for (var key in responseJson.data[i]){
            //key 即为字段名称
            var item = {"key":key,'remind':key,'text':key,'sorting':'DESC'};
            columnDataJson.push(item);
        }
        break;
    }
    columnDataJson.push({"key":'action','remind':'the action','width':'10%','text':'<div>操作</div>','template':function(action, rowObject){
                        return '<span class="plugin-action del-action" onclick="delectRowData(this)" learnLink-id="'+rowObject.id+'">删除</span>';
                    }});
    var table = document.querySelector('table');
    table.GM({
        supportRemind:true,
        gridManagerName:'test',
        height:'400px',
        supportAjaxPage:true,
        supportSorting:true,
        isCombSorting:false,
        disableCache:true,
        ajax_url:url,
        ajax_type:'POST',
        supportMenu:true,
        query:{test:22},
        dataKey:'data',
        pageSize:20,
        sizeData:20,
        columnData:columnDataJson,
        // 分页前事件
        pagingBefore:function(query){
            console.log('pagingBefore', query);
        },
        // 分页后事件
        pagingAfter: function(data){
            console.log('pagingAfter', data);
        },
        // 分页后事件
        pagingAfter: function(data){
            console.log('pagingAfter', data);
        },
        // 排序前事件
        sortingBefore: function (data) {
            console.log('sortBefore', data);
        },
        // 排序后事件
        sortingAfter: function (data) {
            console.log('sortAfter', data);
        },
        // 宽度调整前事件
        adjustBefore: function (event) {
            console.log('adjustBefore', event);
        },
        // 宽度调整后事件
        adjustAfter: function (event) {
            console.log('adjustAfter', event);
        },
        // 拖拽前事件
        dragBefore: function (event) {
            console.log('dragBefore', event);
        },
        // 拖拽后事件
        dragAfter: function (event) {
            console.log('dragAfter', event);
        }
    },function(query){
        // 渲染完成后的回调函数
        console.log('渲染完成后的回调函数:', query);
    });
    // var responseJson = JSON.parse(responseText);
    // // alert(responseJson);
    // var table_thead_tr = document.getElementById("table-style").children[0].children[0];
    // for (var i =0;i<responseJson.length;i++){
    //     for (var key in responseJson[i]){
    //         var th = document.createElement("th");
    //         th.innerText = key;
    //         th.setAttribute("data-field",key);
    //         th.setAttribute("data-align","center");
    //         th.setAttribute("data-sortable","true");
    //         table_thead_tr.appendChild(th);
    //     }
    //     break;
    // }
    // $("#table-style").bootstrapTable({data:responseJson});
    //$('#table').bootstrapTable('destroy');//取消显示表格
    
    $(".loading").css("display","none");//关闭加载过程的图标
}

//为不同浏览器创建不同 XMLHTTP 对象
function GetXmlHttpObject()
{
    var xmlHttp=null;
    try
    {
        // Firefox, Opera 8.0+, Safari
        xmlHttp=new XMLHttpRequest();
    }
    catch (e)
    {
        // Internet Explorer
        try
        {
            xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e)
        {
            xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    return xmlHttp;
}

//每当 XMLHTTP 对象的状态发生改变，则执行该函数。
function stateChanged(xmlHttp1)
{
    if (xmlHttp1.readyState==4 || xmlHttp1.readyState=="complete")
    {
        alert(xmlHttp1.responseText);
    }
}