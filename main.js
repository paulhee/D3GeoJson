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
    var GDVector = L.tileLayer('http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',{subdomains: "1234"});
    var GDImage =L.layerGroup([
        L.tileLayer('http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',{subdomains: "1234"}),
        L.tileLayer('http://t{s}.tianditu.cn/DataServer?T=cta_w&X={x}&Y={y}&L={z}',{subdomains: "1234"})
    ]);
    var CustomerMap = L.tileLayer('http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}');
    // var TiandiMap = L.tileLayer()
    var baseLayers = {
        "Satellite": Esri_WorldImagery,
        "LeafletMap":LeafletMap,
        "高德地图":GDVector,
        "高德影像":GDImage,
        "灰底色地图":CustomerMap
    };
    var map = L.map('map', {
        layers: [ CustomerMap ]
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

    function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }
    var transform = d3.geoTransform({point: projectPoint}),
        path = d3.geoPath().projection(transform);

    //加载中国地图的geojson文件
    // chinajson();
    // d3.json("./Data/china.json", function(error, collection){
    //     if (error) throw error;
    //     var svg = d3.select(map.getPanes().overlayPane).append("svg").attr("class","leaflet-zoom-animated"),
    //         g = svg.append("g").attr("class", "leaflet-zoom-hide");
    //     var feature = g.selectAll("path").data(collection.features).enter().append("path").attr("class","leaflet-clickable");
    //     function reset() {
    //         var bounds = path.bounds(collection),
    //             topLeft = bounds[0],
    //             bottomRight = bounds[1];
    //         svg .attr("width", bottomRight[0] - topLeft[0])
    //             .attr("height", bottomRight[1] - topLeft[1])
    //             .style("left", topLeft[0] + "px")
    //             .style("top", topLeft[1] + "px");
    //         g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
    //         feature.attr("d", path).attr("stroke",function (d) {
    //             var value = d.properties.type;
    //             if(value){
    //                 var c = mycolor[parseInt(value)-1];
    //                 if (value == "1"){
    //                     var cc =c;
    //                 }
    //                 return c;
    //             }
    //             else {
    //                 return "rgb(10,205,0)";
    //             }
    //         }).attr('stroke-width', 1).attr('fill','none').attr("class","leaflet-clickable");
    //     }
    //     map.on("viewreset", reset);
    //     map.on("zoomend",reset);
    //     reset();
    // });

    //加载重庆地图
    loadgeojson('Data/cq_qx2000.json');

    map.setView([29.982511,107.592873],8);

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

var mycolor = new Array("rgb(0,255,0)","rgb(255,158,25)","rgb(243,48,48)","rgb(255,0,0)");
// Use Leaflet to implement a D3 geometric transformation.
function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}
var transform = d3.geoTransform({point: projectPoint});
var path = d3.geoPath().projection(transform);

//交通数据
function RealTimeTraffic(sourcedata) {
    if(sourcedata == '百度'){
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
    }else {
        alert('暂无数据！');
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
            var feature = g.selectAll("path").data(collection.features).enter().append("path").attr("class","leaflet-clickable").attr('r','5');
            function reset() {
                var bounds = path.bounds(collection),
                    topLeft = bounds[0],
                    bottomRight = bounds[1];
                svg .attr("width", bottomRight[0] - topLeft[0])
                    .attr("height", bottomRight[1] - topLeft[1])
                    .style("left", topLeft[0] + "px")
                    .style("top", topLeft[1] + "px");
                g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
                feature.attr("d", path).attr("stroke","rgb(10,205,0)").attr('stroke-width', 1).attr('fill','rgb(10,205,0)').attr("r","5").attr("class","leaflet-clickable");
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

// function is_weixin() {
//     return /MicroMessenger/i.test(navigator.userAgent);
// }
//
// function is_android() {
//     return navigator.userAgent.toLowerCase().match(/(Android|SymbianOS)/i);
// }
//
// function is_ios() {
//     return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
// }

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

//控制左侧TOC宽度
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
            target.attr('value','checked');
        }else {
            target.css("color","rgb(121, 121, 121)");//未选中
            target.attr('value','unchecked');
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
    var url = "./php/main.php?tablename="+tablename+"&page=1";
    $.post(url,function (data) {
        var responseJson = JSON.parse(data);
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
        $(".loading").css("display","none");//关闭加载过程的图标
    });
    // var xmlHttp = GetXmlHttpObject();// XMLHttpRequest对象用于在后台与服务器交换数据
    // if (xmlHttp == null){
    //     alert("Browser does not support HTTP Request");
    //     return;
    // }
    // var tablename="xiaoqu";

    // xmlHttp.onreadystatechange=stateChanged(xmlHttp);
    // xmlHttp.open("GET",url,false);
    // xmlHttp.send();
    // var responseText = xmlHttp.responseText;//从服务器获得数据

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

//leaflet+ECharts3模拟人口流动
function population(e) {
    $("#map").css('display',"block");
    $("#table").css('display',"none");
    if (e.attributes['value'].value == 'checked'){
        //未选中
        // overlay._option.series= [];
        // var option = overlay._option;
        // overlay._ec.clear();
        // overlay._ec.dispose();
        // overlay._unbindEvent();
        // overlay.setOption(option);
        overlay._ec.clear();
        overlay._option={series:[]};
    }
    if(e.attributes['value'].value == 'unchecked'){
        //选中
        leafletecharts_population();
    }
    // cqjson();
}

//各省会城市经纬度坐标
var geoCoordMap = {
    "北京":[116.395645,39.929986],"上海":[121.487899,31.249162],"天津":[117.210813,39.14393],"重庆":[106.530635,29.544606],"安徽":[117.216005,31.859252],"合肥":[117.282699,31.866942],"安庆":[117.058739,30.537898],"蚌埠":[117.35708,32.929499],"亳州":[115.787928,33.871211],"巢湖":[117.88049,31.608733],"池州":[117.494477,30.660019],"滁州":[118.32457,32.317351],"阜阳":[115.820932,32.901211],"淮北":[116.791447,33.960023],"淮南":[117.018639,32.642812],"黄山":[118.29357,29.734435],"六安":[116.505253,31.755558],"马鞍山":[118.515882,31.688528],"宿州":[116.988692,33.636772],"铜陵":[117.819429,30.94093],"芜湖":[118.384108,31.36602],"宣城":[118.752096,30.951642],"福建":[117.984943,26.050118],"福州":[119.330221,26.047125],"龙岩":[117.017997,25.078685],"南平":[118.181883,26.643626],"宁德":[119.542082,26.656527],"莆田":[119.077731,25.44845],"泉州":[118.600362,24.901652],"三明":[117.642194,26.270835],"厦门":[118.103886,24.489231],"漳州":[117.676205,24.517065],"甘肃":[102.457625,38.103267],"兰州":[103.823305,36.064226],"白银":[104.171241,36.546682],"定西":[104.626638,35.586056],"甘南":[102.917442,34.992211],"嘉峪关":[98.281635,39.802397],"金昌":[102.208126,38.516072],"酒泉":[98.508415,39.741474],"临夏":[103.215249,35.598514],"陇南":[104.934573,33.39448],"平凉":[106.688911,35.55011],"庆阳":[107.644227,35.726801],"天水":[105.736932,34.584319],"武威":[102.640147,37.933172],"张掖":[100.459892,38.93932],"广东":[113.394818,23.408004],"广州":[113.30765,23.120049],"潮州":[116.630076,23.661812],"东莞":[113.763434,23.043024],"佛山":[113.134026,23.035095],"河源":[114.713721,23.757251],"惠州":[114.410658,23.11354],"江门":[113.078125,22.575117],"揭阳":[116.379501,23.547999],"茂名":[110.931245,21.668226],"梅州":[116.126403,24.304571],"清远":[113.040773,23.698469],"汕头":[116.72865,23.383908],"汕尾":[115.372924,22.778731],"韶关":[113.594461,24.80296],"深圳":[114.025974,22.546054],"阳江":[111.97701,21.871517],"云浮":[112.050946,22.937976],"湛江":[110.365067,21.257463],"肇庆":[112.479653,23.078663],"中山":[113.42206,22.545178],"珠海":[113.562447,22.256915],"东沙群岛":[117.309186,19.083978],"广西":[108.924274,23.552255],"南宁":[108.297234,22.806493],"百色":[106.631821,23.901512],"北海":[109.122628,21.472718],"崇左":[107.357322,22.415455],"防城港":[108.351791,21.617398],"桂林":[110.26092,25.262901],"贵港":[109.613708,23.103373],"河池":[108.069948,24.699521],"贺州":[111.552594,24.411054],"来宾":[109.231817,23.741166],"柳州":[109.422402,24.329053],"钦州":[108.638798,21.97335],"梧州":[111.305472,23.485395],"玉林":[110.151676,22.643974],"贵州":[106.734996,26.902826],"贵阳":[106.709177,26.629907],"安顺":[105.92827,26.228595],"毕节":[105.300492,27.302612],"六盘水":[104.852087,26.591866],"铜仁":[109.196161,27.726271],"遵义":[106.93126,27.699961],"黔西南":[104.900558,25.095148],"黔东南":[107.985353,26.583992],"黔南":[107.523205,26.264536],"海南":[100.624066,36.284364],"海口":[110.330802,20.022071],"白沙":[109.358586,19.216056],"保亭":[109.656113,18.597592],"昌江":[109.0113,19.222483],"儋州":[109.413973,19.571153],"澄迈":[109.996736,19.693135],"东方":[108.85101,18.998161],"定安":[110.32009,19.490991],"琼海":[110.414359,19.21483],"琼中":[109.861849,19.039771],"乐东":[109.062698,18.658614],"临高":[109.724101,19.805922],"陵水":[109.948661,18.575985],"三亚":[109.522771,18.257776],"屯昌":[110.063364,19.347749],"万宁":[110.292505,18.839886],"文昌":[110.780909,19.750947],"五指山":[109.51775,18.831306],"三沙":[112.342491,16.843901],"西沙群岛":[111.79977,16.219423],"南沙群岛":[114.736439,10.370353],"河北":[115.661434,38.61384],"石家庄":[114.522082,38.048958],"保定":[115.49481,38.886565],"沧州":[116.863806,38.297615],"承德":[117.933822,40.992521],"邯郸":[114.482694,36.609308],"衡水":[115.686229,37.746929],"廊坊":[116.703602,39.518611],"秦皇岛":[119.604368,39.945462],"唐山":[118.183451,39.650531],"邢台":[114.520487,37.069531],"张家口":[114.893782,40.811188],"河南":[113.486804,34.157184],"济源":[112.609183,35.073092],"郑州":[113.649644,34.75661],"安阳":[114.351807,36.110267],"鹤壁":[114.29777,35.755426],"焦作":[113.211836,35.234608],"开封":[114.351642,34.801854],"洛阳":[112.447525,34.657368],"漯河":[114.046061,33.576279],"南阳":[112.542842,33.01142],"平顶山":[113.300849,33.745301],"濮阳":[115.026627,35.753298],"三门峡":[111.181262,34.78332],"商丘":[115.641886,34.438589],"新乡":[113.91269,35.307258],"信阳":[114.085491,32.128582],"许昌":[113.835312,34.02674],"周口":[114.654102,33.623741],"驻马店":[114.049154,32.983158],"黑龙江":[128.047414,47.356592],"哈尔滨":[126.657717,45.773225],"大庆":[125.02184,46.596709],"大兴安岭":[124.196104,51.991789],"鹤岗":[130.292472,47.338666],"黑河":[127.50083,50.25069],"鸡西":[130.941767,45.32154],"佳木斯":[130.284735,46.81378],"牡丹江":[129.608035,44.588521],"七台河":[131.019048,45.775005],"齐齐哈尔":[123.987289,47.3477],"双鸭山":[131.171402,46.655102],"绥化":[126.989095,46.646064],"伊春":[128.910766,47.734685],"湖北":[112.410562,31.209316],"武汉":[114.3162,30.581084],"鄂州":[114.895594,30.384439],"恩施":[109.517433,30.308978],"黄冈":[114.906618,30.446109],"黄石":[115.050683,30.216127],"荆门":[112.21733,31.042611],"荆州":[112.241866,30.332591],"潜江":[112.768768,30.343116],"神农架":[110.487231,31.595768],"十堰":[110.801229,32.636994],"随州":[113.379358,31.717858],"天门":[113.12623,30.649047],"仙桃":[113.387448,30.293966],"咸宁":[114.300061,29.880657],"襄阳":[112.176326,32.094934],"孝感":[113.935734,30.927955],"宜昌":[111.310981,30.732758],"湖南":[111.720664,27.695864],"长沙":[112.979353,28.213478],"常德":[111.653718,29.012149],"郴州":[113.037704,25.782264],"衡阳":[112.583819,26.898164],"怀化":[109.986959,27.557483],"娄底":[111.996396,27.741073],"邵阳":[111.461525,27.236811],"湘潭":[112.935556,27.835095],"湘西":[109.745746,28.317951],"益阳":[112.366547,28.588088],"永州":[111.614648,26.435972],"岳阳":[113.146196,29.378007],"张家界":[110.48162,29.124889],"株洲":[113.131695,27.827433],"江苏":[119.368489,33.013797],"南京":[118.778074,32.057236],"常州":[119.981861,31.771397],"淮安":[119.030186,33.606513],"连云港":[119.173872,34.601549],"南通":[120.873801,32.014665],"苏州":[120.619907,31.317987],"宿迁":[118.296893,33.95205],"泰州":[119.919606,32.476053],"无锡":[120.305456,31.570037],"徐州":[117.188107,34.271553],"盐城":[120.148872,33.379862],"扬州":[119.427778,32.408505],"镇江":[119.455835,32.204409],"江西":[115.676082,27.757258],"南昌":[115.893528,28.689578],"抚州":[116.360919,27.954545],"赣州":[114.935909,25.845296],"吉安":[114.992039,27.113848],"景德镇":[117.186523,29.303563],"九江":[115.999848,29.71964],"萍乡":[113.859917,27.639544],"上饶":[117.955464,28.457623],"新余":[114.947117,27.822322],"宜春":[114.400039,27.81113],"鹰潭":[117.03545,28.24131],"吉林":[126.564544,43.871988],"长春":[125.313642,43.898338],"白城":[122.840777,45.621086],"白山":[126.435798,41.945859],"辽源":[125.133686,42.923303],"四平":[124.391382,43.175525],"松原":[124.832995,45.136049],"通化":[125.94265,41.736397],"延边":[129.485902,42.896414],"辽宁":[122.753592,41.6216],"沈阳":[123.432791,41.808645],"鞍山":[123.007763,41.118744],"本溪":[123.778062,41.325838],"朝阳":[120.446163,41.571828],"大连":[121.593478,38.94871],"丹东":[124.338543,40.129023],"抚顺":[123.92982,41.877304],"阜新":[121.660822,42.01925],"葫芦岛":[120.860758,40.74303],"锦州":[121.147749,41.130879],"辽阳":[123.172451,41.273339],"盘锦":[122.073228,41.141248],"铁岭":[123.85485,42.299757],"营口":[122.233391,40.668651],"内蒙古":[114.415868,43.468238],"呼和浩特":[111.660351,40.828319],"阿拉善":[105.695683,38.843075],"包头":[109.846239,40.647119],"巴彦淖尔":[107.423807,40.76918],"赤峰":[118.930761,42.297112],"鄂尔多斯":[109.993706,39.81649],"呼伦贝尔":[119.760822,49.201636],"通辽":[122.260363,43.633756],"乌海":[106.831999,39.683177],"乌兰察布":[113.112846,41.022363],"锡林郭勒":[116.02734,43.939705],"兴安盟":[122.048167,46.083757],"宁夏":[106.155481,37.321323],"银川":[106.206479,38.502621],"固原":[106.285268,36.021523],"石嘴山":[106.379337,39.020223],"吴忠":[106.208254,37.993561],"中卫":[105.196754,37.521124],"青海":[96.202544,35.499761],"西宁":[101.767921,36.640739],"果洛":[100.223723,34.480485],"海东":[102.085207,36.51761],"海北":[100.879802,36.960654],"海西":[97.342625,37.373799],"黄南":[102.0076,35.522852],"玉树":[97.013316,33.00624],"山东":[118.527663,36.09929],"济南":[117.024967,36.682785],"滨州":[117.968292,37.405314],"东营":[118.583926,37.487121],"德州":[116.328161,37.460826],"菏泽":[115.46336,35.26244],"济宁":[116.600798,35.402122],"莱芜":[117.684667,36.233654],"聊城":[115.986869,36.455829],"临沂":[118.340768,35.072409],"青岛":[120.384428,36.105215],"日照":[119.50718,35.420225],"泰安":[117.089415,36.188078],"威海":[122.093958,37.528787],"潍坊":[119.142634,36.716115],"烟台":[121.309555,37.536562],"枣庄":[117.279305,34.807883],"淄博":[118.059134,36.804685],"山西":[112.515496,37.866566],"太原":[112.550864,37.890277],"长治":[113.120292,36.201664],"大同":[113.290509,40.113744],"晋城":[112.867333,35.499834],"晋中":[112.738514,37.693362],"临汾":[111.538788,36.099745],"吕梁":[111.143157,37.527316],"朔州":[112.479928,39.337672],"忻州":[112.727939,38.461031],"阳泉":[113.569238,37.869529],"运城":[111.006854,35.038859],"陕西":[109.503789,35.860026],"西安":[108.953098,34.2778],"安康":[109.038045,32.70437],"宝鸡":[107.170645,34.364081],"汉中":[107.045478,33.081569],"商洛":[109.934208,33.873907],"铜川":[108.968067,34.908368],"渭南":[109.483933,34.502358],"咸阳":[108.707509,34.345373],"延安":[109.50051,36.60332],"榆林":[109.745926,38.279439],"四川":[102.89916,30.367481],"成都":[104.067923,30.679943],"阿坝":[102.228565,31.905763],"巴中":[106.757916,31.869189],"达州":[107.494973,31.214199],"德阳":[104.402398,31.13114],"甘孜":[101.969232,30.055144],"广安":[106.63572,30.463984],"广元":[105.819687,32.44104],"乐山":[103.760824,29.600958],"凉山":[102.259591,27.892393],"泸州":[105.44397,28.89593],"南充":[106.105554,30.800965],"眉山":[103.84143,30.061115],"绵阳":[104.705519,31.504701],"内江":[105.073056,29.599462],"攀枝花":[101.722423,26.587571],"遂宁":[105.564888,30.557491],"雅安":[103.009356,29.999716],"宜宾":[104.633019,28.769675],"资阳":[104.63593,30.132191],"自贡":[104.776071,29.359157],"西藏":[89.137982,31.367315],"拉萨":[91.111891,29.662557],"阿里":[81.107669,30.404557],"昌都":[97.185582,31.140576],"林芝":[94.349985,29.666941],"那曲":[92.067018,31.48068],"日喀则":[88.891486,29.269023],"山南":[91.750644,29.229027],"新疆":[85.614899,42.127001],"乌鲁木齐":[87.564988,43.84038],"阿拉尔":[81.291737,40.61568],"阿克苏":[80.269846,41.171731],"阿勒泰":[88.137915,47.839744],"巴音郭楞":[86.121688,41.771362],"博尔塔拉":[82.052436,44.913651],"昌吉":[87.296038,44.007058],"哈密":[93.528355,42.858596],"和田":[79.930239,37.116774],"喀什":[75.992973,39.470627],"克拉玛依":[84.88118,45.594331],"克孜勒苏":[76.137564,39.750346],"石河子":[86.041865,44.308259],"塔城":[82.974881,46.758684],"图木舒克":[79.198155,39.889223],"吐鲁番":[89.181595,42.96047],"五家渠":[87.565449,44.368899],"伊犁":[81.297854,43.922248],"云南":[101.592952,24.864213],"昆明":[102.714601,25.049153],"保山":[99.177996,25.120489],"楚雄":[101.529382,25.066356],"大理":[100.223675,25.5969],"德宏":[98.589434,24.44124],"迪庆":[99.713682,27.831029],"红河":[103.384065,23.367718],"丽江":[100.229628,26.875351],"临沧":[100.092613,23.887806],"怒江":[98.859932,25.860677],"普洱":[100.980058,22.788778],"曲靖":[103.782539,25.520758],"昭通":[103.725021,27.340633],"文山":[104.089112,23.401781],"西双版纳":[100.803038,22.009433],"玉溪":[102.545068,24.370447],"浙江":[119.957202,29.159494],"杭州":[120.219375,30.259244],"湖州":[120.137243,30.877925],"嘉兴":[120.760428,30.773992],"金华":[119.652576,29.102899],"丽水":[119.929576,28.4563],"宁波":[121.579006,29.885259],"衢州":[118.875842,28.95691],"绍兴":[120.592467,30.002365],"台州":[121.440613,28.668283],"温州":[120.690635,28.002838],"舟山":[122.169872,30.03601],"香港":[114.186124,22.293586],"澳门":[113.557519,22.204118],"台湾":[120.961454,23.80406],"台北":[121.489971,25.094466],"奉节":[109.389389499999990,30.889680117699999],"云阳":[108.852146238000000,31.038226714099999],"开县":[108.377995471000010,31.272575588799999],"万州":[108.402622194000000,30.706243332900002],"忠县":[107.910764484000000,30.338410319000001],"梁平":[107.714335343000000,30.660834730200001],"潼南":[105.809971045000000,30.146244634199999],"合川":[106.319235500000000,30.063088707999999],"石柱":[108.293935609000000,30.095579528199998],"彭水":[108.262007272999990,29.355841616100001],"丰都":[107.826714980999990,29.886916030700000],"涪陵":[107.330024902999990,29.661108783400000],"长寿":[107.135825618000000,29.957007809099998],"渝北":[106.743323739999990,29.812777121400000],"北碚":[106.489884000000000,29.807282754700001],"沙坪坝":[106.364402579000000,29.626994193300000],"璧山":[106.188310258000000,29.563805370899999],"铜梁":[106.028999502000000,29.814735820300001],"永川":[105.870144549000000,29.293064630400000],"大足":[105.737580859000000,29.657361599700000],"荣昌":[105.502600892000000,29.467839677200001],"酉阳":[108.813159000000000,28.862904851700002],"黔江":[108.716274500000000,29.382012586500000],"武隆":[107.705224336000000,29.375791646500002],"南川":[107.167250987000000,29.138143280100000],"万盛":[106.913144415000000,28.913673965000001],"巴南":[106.714789000000000,29.331109346000002],"綦江":[106.668836883000000,28.872961968900000],"江津":[106.213751000000000,29.121698757200001],"秀山":[109.014207468000000,28.495267165600001],"垫江":[107.433509552000000,30.255813688400000],"巫溪":[109.349350121000000,31.505069445699998],"江北":[106.778625000000010,29.637439031600000],"九龙坡":[106.360098905000000,29.431104669500002],"南岸":[106.656865014000000,29.538332857200000],"渝中":[106.536627575000000,29.551963515699999],"巫山":[109.897122834000000,31.117045182999998],"大渡口":[106.424381999999990,29.388564348399999],"双桥":[105.783348952000000,29.499760536800000],"城口":[108.730809925000000,31.884094860299999]
};

var CQData = [
    [{name: '重庆'}, {name: '上海', value: 95}],
    [{name: '重庆'}, {name: '广州', value: 90}],
    [{name: '重庆'}, {name: '大连', value: 80}],
    [{name: '重庆'}, {name: '南宁', value: 70}],
    [{name: '重庆'}, {name: '南昌', value: 60}],
    [{name: '重庆'}, {name: '拉萨', value: 50}],
    [{name: '重庆'}, {name: '长春', value: 40}],
    [{name: '重庆'}, {name: '包头', value: 30}],
    [{name: '重庆'}, {name: '北京', value: 85}],
    [{name: '重庆'}, {name: '常州', value: 10}]
];

var CQData_out = [
    [{name: '渝中'}, {name: '城口', value: 95}],
    [{name: '渝中'}, {name: '万盛', value: 90}],
    [{name: '渝中'}, {name: '江北', value: 80}],
    [{name: '渝中'}, {name: '垫江', value: 70}],
    [{name: '渝中'}, {name: '大渡口', value: 60}],
    [{name: '渝中'}, {name: '沙坪坝', value: 50}],
    [{name: '渝中'}, {name: '璧山', value: 40}],
    [{name: '渝中'}, {name: '潼南', value: 30}],
    [{name: '渝中'}, {name: '万州', value: 20}],
    [{name: '渝中'}, {name: '巫溪', value: 10}]
];

var GZData = [
    [{name: '广州'}, {name: '福州', value: 95}],
    [{name: '广州'}, {name: '太原', value: 90}],
    [{name: '广州'}, {name: '长春', value: 80}],
    [{name: '广州'}, {name: '重庆', value: 70}],
    [{name: '广州'}, {name: '西安', value: 60}],
    [{name: '广州'}, {name: '成都', value: 50}],
    [{name: '广州'}, {name: '常州', value: 40}],
    [{name: '广州'}, {name: '北京', value: 30}],
    [{name: '广州'}, {name: '北海', value: 20}],
    [{name: '广州'}, {name: '海口', value: 10}]
];
var overlay;
function leafletecharts_population() {
    //leaflet上使用echarts
    overlay = new L.echartsLayer(map, echarts);
    var chartsContainer = overlay.getEchartsContainer();
    overlay.initECharts(chartsContainer);

    var planePath = 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z';
// var planePath = 'arrow';
    var convertData = function (data) {
        var res = [];
        for (var i = 0; i < data.length; i++) {
            var dataItem = data[i];
            var fromCoord = geoCoordMap[dataItem[0].name];
            var toCoord = geoCoordMap[dataItem[1].name];
            if (fromCoord && toCoord) {
                // res.push([{
                //     coord: fromCoord,
                //     lonlat:fromCoord
                // }, {
                //     coord: toCoord,
                //     lonlat:toCoord
                // }]);
                res.push({
                    'coords':[fromCoord,toCoord],
                    'lonlat':[fromCoord,toCoord]//自定义
                });
                //现在的写法{ coords:[[1,2],[2,3]] }
            }
        }
        return res;
    };

    var color = ['#a6c84c', '#ffa022', '#46bee9'];
    var series = [];
    [['重庆', CQData], ['渝中', CQData_out], ['广州', GZData]].forEach(function (item, i) {
        series.push(
            // {
            //     name: item[0] + ' Top10',
            //     type: 'lines',
            //     zlevel: 1,
            //     effect: {
            //         show: true,
            //         period: 6,
            //         trailLength: 0.7,
            //         color: '#fff',
            //         symbolSize: 3
            //     },
            //     lineStyle: {
            //         normal: {
            //             color: color[i],
            //             width: 0,
            //             curveness: 0.2
            //         }
            //     },
            //     data: convertData(item[1])
            // },
            {
                name: item[0] + ' Top10',
                type: 'lines',
                zlevel: 999,
                effect: {
                    show: true,
                    period: 6,
                    trailLength: 0,
                    symbol: planePath,
                    symbolSize: 15
                },
                lineStyle: {
                    normal: {
                        color: color[i],
                        width: 2,
                        opacity: 0.4,
                        curveness: 0.2
                    }
                },
                data: convertData(item[1])
            },
            {
                name: item[0] + ' Top10',
                type: 'effectScatter',
                coordinateSystem: 'geo',
                zlevel: 999,
                rippleEffect: {
                    brushType: 'stroke'
                },
                label: {
                    normal: {
                        show: true,
                        position: 'bottom',
                        formatter: '{b}'
                    }
                },
                symbolSize: function (val) {
                    return val[2] / 8;
                },
                itemStyle: {
                    normal: {
                        color: color[i]
                    }
                },
                data: item[1].map(function (dataItem) {
                    return {
                        name: dataItem[1].name,
                        value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value]),
                        lonlat:geoCoordMap[dataItem[1].name]//自定义，主要用于地图拖动、缩放时的计算
                    };
                })
            });
    });

    option = {
        title: {
            text: '人口模拟迁徙',
            subtext: 'Develop By paulhee',
            sublink :'https://www.didiaosuo.com',
            left: 'center',
            textStyle: {
                color: '#fff'
            }
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            x: 'right',
            y: 'center',
            data:['重庆 Top10', '渝中 Top10', '广州 Top10'],
            selected:{'重庆 Top10':false, '渝中 Top10':true, '广州 Top10':false},
            textStyle: {
                color: '#fff'
            },
            selectedMode: 'single'
        },
        geo: {
            map: '',
            label: {
                emphasis: {
                    show: false
                }
            },
            roam: true,//是否开启鼠标缩放和平移漫游
            itemStyle: {
                normal: {
                    areaColor: '#323c48',
                    borderColor: '#404a59'
                },
                emphasis: {
                    areaColor: '#2a333d'
                }
            }
        },
        visualMap:{
            type:'continuous' ,
            min:0,
            max:100,
            text:['High','Low'],
            textStyle: {
                color: '#fff'
            },
            realtime:false,
            calculable:true,
            hoverLink:true,
            inRange:{
                color:['aqua','lime','yellow','orange','#ff3333'],
            }
        },
        series: series
    };
// 使用刚指定的配置项和数据显示图表
    overlay.setOption(option);
}

function loadgeojson(jsonpath) {
    d3.json(jsonpath, function(error, collection){
        if (error) throw error;
        var svg = d3.select(map.getPanes().overlayPane).append("svg").attr("class","leaflet-zoom-animated"),
            g = svg.append("g").attr("class", "leaflet-zoom-hide");
        var feature = g.selectAll("path").data(collection.features).enter().append("path").attr("class","leaflet-clickable").attr("fill","#000").attr("fill-opacity","0.2").attr("stroke","#fff").attr("stroke-width","0.5px");
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
}

//leaflet+echarts
function AQIFunction1(tablename){
    $("#map").css('display',"block");
    // $("#map").empty();
    // mapStuff = initDemoMap();
    // map = mapStuff.map;
    $("#table").css('display',"none");
    $.post("./php/AQI.php?tablename="+tablename+"&datetime=2018-04-25",function (data) {
        var responseJson = JSON.parse(data);
        var seriesdata = new Array();
        for (var i =0;i<responseJson.data.length;i++){
            var item = responseJson.data[i];
            var StationName = item['StationName'];
            var AQI = item['AQI'];
            var X = item['X'];
            var Y = item['Y'];
            AQI = parseFloat(AQI);
            X = parseFloat(X);
            Y = parseFloat(Y);
            if (isNaN(AQI)){
                AQI = 0;
            }
            if (isNaN(X) || isNaN(Y)) {
                continue;
            }
            seriesdata.push({
                name:StationName,
                value:[X,Y,AQI],
                lonlat:[X,Y],
            });
        };
        //leaflet上使用echarts
        overlay = new L.echartsLayer(map, echarts);
        var chartsContainer = overlay.getEchartsContainer();
        overlay.initECharts(chartsContainer);
        option = {
            baseOption:{
                timeline:{
                    axisType:'',
                    autoPlay:true,
                    playInterval: 1000
                }
            },
            title: {
                text: '重庆市空气质量日报',
                subtext: 'Develop By paulhee',
                sublink :'https://www.didiaosuo.com',
                left: 'center',
                textStyle: {
                    color: '#fff'
                }
            },
            geo: {
                map: '',
                label: {
                    emphasis: {
                        show: false
                    }
                },
                roam: true,//是否开启鼠标缩放和平移漫游
                itemStyle: {
                    normal: {
                        areaColor: '#323c48',
                        borderColor: '#404a59'
                    },
                    emphasis: {
                        areaColor: '#2a333d'
                    }
                }
            },
            visualMap:{
                // min: 0,
                // max: 500,
                pieces: [
                    {min: 300, label: '严重污染'},            // (300, Infinity]
                    {min: 200, max: 300, label: '重度污染'},  // (200, 300]
                    {min: 150, max: 200, label: '中度污染'},  // (150, 200]
                    {min: 100, max: 150, label: '轻度污染'},  // (100, 150]
                    {min: 50, max: 100, label: '良'},   // (50, 100]
                    {min: 0, max: 50, label: '优'},       // (0, 50]
                ],
                color: ['#E0022B', '#E09107', '#A3E00B'],////['#d94e5d','#eac736','#50a3ba']
                // inRange: {
                //     color: ['#d94e5d','#eac736','#50a3ba'].reverse()
                // },
                textStyle: {
                    color: '#fff'
                }
            },
            series: [{
                name:'AQI',
                type: 'heatmap',
                coordinateSystem: 'geo',
                data:seriesdata
            }]
        };
    // 使用刚指定的配置项和数据显示图表
        overlay.setOption(option);
    })
}
//echarts
function AQIFunction(tablename){
    $("#map").css('display',"none");
    // $("#map").empty();
    $("#container_echarts").css('display',"block");
    $("#table").css('display',"none");
    var dom = document.getElementById("container_echarts");
    var myChart = echarts.init(dom);
    var app = {};
    option = null;
    app.title = '重庆市空气质量热力图';
    myChart.showLoading();
    $.get('Data/cq_qx2000.json', function (myJson){
        echarts.registerMap('MY', myJson) //注册
        var timelist=[];
        for (var i=1;i<31;i++){
            if (i < 10){
                timelist.push('04-0'+i.toString());
            }
            else {
                timelist.push('04-'+i.toString());
            }

        }
        var mydatetime ='2018-04';
        $.post("./php/AQI.php?tablename="+tablename+"&datetime="+mydatetime,function (data) {
            var option ={
                baseOption:{
                    timeline: {
                        axisType: 'category',
                        orient: 'vertical',
                        autoPlay: true,
                        inverse: true,
                        playInterval: 1000,
                        left: null,
                        right: 30,
                        top: 50,
                        bottom: 20,
                        width: 55,
                        height: null,
                        label: {
                            normal: {
                                textStyle: {
                                    color: '#ddd'
                                }
                            },
                            emphasis: {
                                textStyle: {
                                    color: '#fff'
                                }
                            }
                        },
                        symbol: 'circle',
                        lineStyle: {
                            color: '#555'
                        },
                        checkpointStyle: {
                            color: '#bbb',
                            borderColor: '#777',
                            borderWidth: 2
                        },
                        controlStyle: {
                            showNextBtn: false,
                            showPrevBtn: false,
                            normal: {
                                color: '#666',
                                borderColor: '#666'
                            },
                            emphasis: {
                                color: '#aaa',
                                borderColor: '#aaa'
                            }
                        },
                        data: timelist
                    },
                    title: {
                        text: '重庆市空气质量AQI热力图',
                        subtext: 'Develop By paulhee',
                        sublink :'https://www.didiaosuo.com',
                        left: 'center',
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    backgroundColor: 'rgba(64,74,89,0.8)',
                    // geo: {
                    //     map: '',
                    //     label: {
                    //         emphasis: {
                    //             show: false
                    //         }
                    //     },
                    //     roam: true,//是否开启鼠标缩放和平移漫游
                    //     itemStyle: {
                    //         normal: {
                    //             areaColor: '#323c48',
                    //             borderColor: '#404a59'
                    //         },
                    //         emphasis: {
                    //             areaColor: '#2a333d'
                    //         }
                    //     }
                    // },
                    bmap: {
                        center: [107.72009,29.871354],
                        zoom: 8.5,
                        roam: true
                    },
                    // visualMap:{
                    //     // pieces: [
                    //     //     {min: 300, label: '严重污染'},            // (300, Infinity]
                    //     //     {min: 200, max: 300, label: '重度污染'},  // (200, 300]
                    //     //     {min: 150, max: 200, label: '中度污染'},  // (150, 200]
                    //     //     {min: 100, max: 150, label: '轻度污染'},  // (100, 150]
                    //     //     {min: 50, max: 100, label: '良'},   // (50, 100]
                    //     //     {min: 0, max: 50, label: '优'}       // (0, 50]
                    //     // ],
                    //     min: 0,
                    //     max: 500,
                    //     splitNumber: 5,
                    //     // inRange: {
                    //     //     color: ['#E0022B', '#E09107', '#A3E00B'].reverse()
                    //     // },
                    //     color: ['#A3E00B', '#E09107', '#E0022B'],
                    //     textStyle: {
                    //         color: '#fff'
                    //     },
                    //     right:5
                    // },
                    visualMap: {
                        left:5,
                        top:1,
                        min: 0,
                        max: 500,
                        seriesIndex: 0,
                        calculable: true,
                        inRange: {
                            color: ['#E0022B', '#E09107', '#A3E00B'].reverse()
                        }
                    },
                    series: [
                        {
                            name:'AQI',
                            type: 'heatmap',
                            coordinateSystem: 'bmap',
                            data:[],//seriesdata
                            zlevel:19891015
                        },
                        {
                            name:'cq_map',
                            type: 'map',
                            map: 'MY',
                            roam:true,
                            itemStyle:{
                                normal:{
                                    opacity:0.5,
                                    borderWidth:2,
                                    borderColor:'#cccccc',
                                    areaColor:'rgba(128, 128, 128, 0)',
                                }
                            },
                            emphasis:{
                                itemStyle:{

                                }
                            },
                            zlevel:19891010
                        }]
                },
                options:[]
            };
            var responseJson = JSON.parse(data);
            for (var i =0;i<responseJson.length;i++){
                var seriesdata = new Array();
                for(var j =0;j<responseJson[i].data.length;j++){
                    var item = responseJson[i].data[j];
                    var StationName = item['StationName'];
                    var AQI = item['AQI'];
                    var X = item['X'];
                    var Y = item['Y'];
                    AQI = parseFloat(AQI);
                    X = parseFloat(X);
                    Y = parseFloat(Y);
                    if (isNaN(AQI)){
                        AQI = 0;
                    }
                    if (isNaN(X) || isNaN(Y)) {
                        continue;
                    }
                    seriesdata.push([X,Y,AQI]);
                }
                option.options.push({
                    title: {
                        text: responseJson[i].datetime+'重庆市空气质量AQI热力图'
                    },
                    series: {
                        data: seriesdata
                    }
                });
            };
            myChart.setOption(option);

            // myChart.setOption(
            //     option = {
            //         timeline: {
            //             axisType: 'category',
            //             orient: 'vertical',
            //             autoPlay: false,
            //             inverse: true,
            //             playInterval: 1000,
            //             left: null,
            //             right: 10,
            //             top: 20,
            //             bottom: 20,
            //             width: 55,
            //             height: null,
            //             label: {
            //                 normal: {
            //                     textStyle: {
            //                         color: '#ddd'
            //                     }
            //                 },
            //                 emphasis: {
            //                     textStyle: {
            //                         color: '#fff'
            //                     }
            //                 }
            //             },
            //             symbol: 'none',
            //             lineStyle: {
            //                 color: '#555'
            //             },
            //             checkpointStyle: {
            //                 color: '#bbb',
            //                 borderColor: '#777',
            //                 borderWidth: 2
            //             },
            //             controlStyle: {
            //                 showNextBtn: false,
            //                 showPrevBtn: false,
            //                 normal: {
            //                     color: '#666',
            //                     borderColor: '#666'
            //                 },
            //                 emphasis: {
            //                     color: '#aaa',
            //                     borderColor: '#aaa'
            //                 }
            //             },
            //             data: timelist
            //         },
            //         title: {
            //             text: '重庆市空气质量AQI热力图',
            //             subtext: 'Develop By paulhee',
            //             sublink :'https://www.didiaosuo.com',
            //             left: 'center',
            //             textStyle: {
            //                 color: '#fff'
            //             }
            //         },
            //         backgroundColor: 'rgba(64,74,89,0.8)',
            //         // geo: {
            //         //     map: '',
            //         //     label: {
            //         //         emphasis: {
            //         //             show: false
            //         //         }
            //         //     },
            //         //     roam: true,//是否开启鼠标缩放和平移漫游
            //         //     itemStyle: {
            //         //         normal: {
            //         //             areaColor: '#323c48',
            //         //             borderColor: '#404a59'
            //         //         },
            //         //         emphasis: {
            //         //             areaColor: '#2a333d'
            //         //         }
            //         //     }
            //         // },
            //         bmap: {
            //             center: [107.72009,29.871354],
            //             zoom: 8.5,
            //             roam: true
            //         },
            //         // visualMap:{
            //         //     // pieces: [
            //         //     //     {min: 300, label: '严重污染'},            // (300, Infinity]
            //         //     //     {min: 200, max: 300, label: '重度污染'},  // (200, 300]
            //         //     //     {min: 150, max: 200, label: '中度污染'},  // (150, 200]
            //         //     //     {min: 100, max: 150, label: '轻度污染'},  // (100, 150]
            //         //     //     {min: 50, max: 100, label: '良'},   // (50, 100]
            //         //     //     {min: 0, max: 50, label: '优'}       // (0, 50]
            //         //     // ],
            //         //     min: 0,
            //         //     max: 500,
            //         //     splitNumber: 5,
            //         //     // inRange: {
            //         //     //     color: ['#E0022B', '#E09107', '#A3E00B'].reverse()
            //         //     // },
            //         //     color: ['#A3E00B', '#E09107', '#E0022B'],
            //         //     textStyle: {
            //         //         color: '#fff'
            //         //     },
            //         //     right:5
            //         // },
            //         visualMap: {
            //             right:5,
            //             min: 0,
            //             max: 500,
            //             seriesIndex: 0,
            //             calculable: true,
            //             inRange: {
            //                 color: ['#E0022B', '#E09107', '#A3E00B'].reverse()
            //             }
            //         },
            //         series: [
            //         {
            //             name:'AQI',
            //             type: 'heatmap',
            //             coordinateSystem: 'bmap',
            //             data:seriesdata,
            //             zlevel:19891015
            //         },
            //         {
            //             name:'cq_map',
            //             type: 'map',
            //             map: 'MY',
            //             roam:true,
            //             itemStyle:{
            //                 normal:{
            //                     opacity:0.5,
            //                     borderWidth:2,
            //                     borderColor:'#cccccc',
            //                     areaColor:'rgba(128, 128, 128, 0)',
            //                 }
            //             },
            //             emphasis:{
            //                 itemStyle:{
            //
            //                 }
            //             },
            //             zlevel:19891010
            //         }]
            //     }
            // );
            // if (!app.inNode) {
            //     // 添加百度地图插件
            //     var bmap = myChart.getModel().getComponent('bmap').getBMap();
            //     bmap.addControl(new BMap.MapTypeControl());
            // }
            myChart.hideLoading();
        });
        if (option && typeof option === "object") {
            myChart.setOption(option, true);
        }
    });
}

//动态数据接入
// setInterval(function () {
//     for (var i = 0; i < 5; i++) {
//         data.shift();
//         data.push(randomData());
//     }
//     myChart.setOption({
//         series: [{
//             data: data
//         }]
//     });
// }, 1000);

function publicmail() {
    $("#map").css('display',"none");
    // $("#map").empty();
    $("#container_echarts").css('display',"block");
    $("#table").css('display',"none");
    var dom = document.getElementById("container_echarts");
    var myChart = echarts.init(dom);
    myChart.showLoading();
    // $.getJSON('./Data/publicmail.json',function (jsondata) {
    //     myChart.hideLoading();
    //     mapboxgl.accessToken = 'pk.eyJ1IjoicGF1bGhlZSIsImEiOiJjamRuejZiaWswZ3F5Mnhwa2MzYnRjOGk3In0.03hUpjD-1h79z5XJJ_w6Qg';
    //     myChart.setOption({
    //         visualMap: {
    //             show: true,
    //             calculable: true,
    //             realtime: false,
    //             inRange: {
    //                 // color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
    //                 color:['#ff3333','orange','yellow','lime','aqua'].reverse()
    //             },
    //             outOfRange: {
    //                 colorAlpha: 0
    //             },
    //             max: jsondata[1]
    //         },
    //         mapbox: {
    //             center: [106.55659,29.562201],
    //             zoom: 10,
    //             pitch: 50,
    //             bearing: -10,
    //             style: 'mapbox://styles/mapbox/light-v9',
    //             boxHeight: 50,
    //             // altitudeScale: 3e2,
    //             postEffect: {
    //                 enable: true,
    //                 SSAO: {
    //                     enable: true,
    //                     radius: 2,
    //                     intensity: 1.5
    //                 }
    //             },
    //             light: {
    //                 main: {
    //                     intensity: 1,
    //                     shadow: true,
    //                     shadowQuality: 'high'
    //                 },
    //                 ambient: {
    //                     intensity: 0
    //                 },
    //                 ambientCubemap: {
    //                     texture: './imgs/data-1491896094618-H1DmP-5px.hdr',
    //                     exposure: 1,
    //                     diffuseIntensity: 0.5
    //                 }
    //             }
    //         },
    //         // amap: {
    //         //     maxPitch: 60,
    //         //     pitch: 45,
    //         //     viewMode: '3D',
    //         //     zoom: 17,
    //         //     expandZoomRange: true,
    //         //     zooms: [3, 20],
    //         //     mapStyle: 'amap://styles/6bd7d0c78736ef803efcbda2d85f89a5',
    //         //     center: [106.55659,29.562201],
    //         //     // rotation: 100
    //         // },
    //         series: [{
    //             type: 'bar3D',
    //             shading: 'lambert',
    //             coordinateSystem: 'mapbox',
    //             barSize: 0.2,
    //             silent: true,
    //             data: jsondata[0],
    //             itemStyle: {
    //                 color: 'orange',
    //                 opacity: 1
    //             }
    //         }]
    //     });
    // });
    // $.getJSON('./Data/publicmail.json',function (jsondata) {
    //     myChart.setOption({
    //         amap: {
    //             maxPitch: 60,
    //             pitch: 45,
    //             viewMode: '3D',
    //             zoom: 17,
    //             expandZoomRange: true,
    //             zooms: [3, 20],
    //             mapStyle: 'amap://styles/6bd7d0c78736ef803efcbda2d85f89a5',
    //             center: [106.55659,29.562201],
    //             // rotation: 100
    //         },
    //         maptalks: {
    //             center: [-74.01164278497646, 40.70769573605318],
    //             zoom: 14,
    //             pitch: 55,
    //             baseLayer: {
    //                 'urlTemplate': 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    //                 'subdomains': ['a', 'b', 'c', 'd']
    //             },
    //             altitudeScale: 2,
    //             postEffect: {
    //                 enable: true,
    //                 FXAA: {
    //                     enable: true
    //                 }
    //             },
    //             light: {
    //                 main: {
    //                     intensity: 1,
    //                     shadow: true,
    //                     shadowQuality: 'high'
    //                 },
    //                 ambient: {
    //                     intensity: 0.
    //                 },
    //                 ambientCubemap: {
    //                     texture: '/asset/get/s/data-1491838644249-ry33I7YTe.hdr',
    //                     exposure: 1,
    //                     diffuseIntensity: 0.5,
    //                     specularIntensity: 2
    //                 }
    //             }
    //         },
    //         visualMap: {
    //             show: true,
    //             calculable: true,
    //             realtime: false,
    //             inRange: {
    //                 // color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
    //                 color:['#ff3333','orange','yellow','lime','aqua'].reverse()
    //             },
    //             outOfRange: {
    //                 colorAlpha: 0
    //             },
    //             max: jsondata[1]
    //         },
    //         series: [{
    //             type: 'bar3D',
    //             shading: 'lambert',
    //             coordinateSystem: 'amap',
    //             barSize: 0.2,
    //             silent: true,
    //             data: jsondata[0],
    //             itemStyle: {
    //                 color: 'orange',
    //                 opacity: 1
    //             }
    //         }]
    //     });
    //     // layer.render = function() {
    //     //     let series = myChart.getOption().series;
    //     //     myChart.setOption({
    //     //         series: []
    //     //     });
    //     //     myChart.setOption({
    //     //         series: series
    //     //     });
    //     // }
    //     var map = myChart.getModel().getComponent('amap').getAMap();
    //     var layer = myChart.getModel().getComponent('amap').getLayer();
    //     AMap.plugin(["AMap.ControlBar"], function() {
    //         var bar = new AMap.ControlBar();
    //         map.addControl(bar);
    //     });
    //     layer.render = function() {
    //         var series = myChart.getOption().series;
    //         myChart.setOption({
    //             series: []
    //         });
    //         myChart.setOption({
    //             series: series
    //         });
    //     }
    // })
    var multipolygon = new Array();
    $.getJSON('./Data/publicmail_raw.json',function (jsondata) {
        var valuedata = jsondata[0];
        var coefficient = 8;
        jsondata[1]=jsondata[1]*coefficient;
        for (var ii =0;ii<valuedata.length;ii++){
            var value = valuedata[ii].value;
            // var gcj = GPS.gcj_encrypt(value[0],value[1]);
            // valuedata[ii].value=[gcj.lat,gcj.lon,value[2]*coefficient];
            var gcj = coordtransform.wgs84togcj02(value[1],value[0]);
            valuedata[ii].value=[gcj[1],gcj[0],value[2]*coefficient];
        }
        $.getJSON('./Data/zcq.json',function (zcqjsondata) {
            // var zcq_features = zcqjsondata.features;
            // for(var iii = 0; iii< zcq_features.length; iii++){
            //     if (zcq_features[iii].geometry.type == 'MultiPolygon'){
            //         for(var iiii = 0; iiii < zcq_features[iii].geometry.coordinates.length;iiii++){
            //             multipolygon.push(zcq_features[iii].geometry.coordinates[iiii]);
            //         }
            //     }else {
            //         multipolygon.push(zcq_features[iii].geometry.coordinates);
            //     }
            //
            // }
            // const geometries = GeoJSON.toGeometry(zcqjsondata);//待测试
            // var zcq_maptalks = new maptalks.MultiPolygon(multipolygon, {
            //     visible : true,
            //     editable : true,
            //     cursor : null,
            //     shadowBlur : 0,
            //     shadowColor : 'black',
            //     draggable : false,
            //     dragShadow : false, // display a shadow during dragging
            //     // drawOnAxis : null,  // force dragging stick on a axis, can be: x, y
            //     symbol: {
            //         'lineColor' : '#34495e',
            //         'lineWidth' : 2,
            //         'polygonFill' : 'rgb(135,196,240)',
            //         'polygonOpacity' : 0.6
            //     }
            // });
            myChart.setOption({
                maptalks3D: {
                    center: [106.55659,29.562201],
                    zoom: 14,
                    pitch: 55,
                    zoomControl : {
                        'position'  : 'top-left',
                        'slider'    : true,
                        'zoomLevel' : true
                    },
                    layerSwitcherControl: {
                        'position'  : 'top-right',
                        // title of base layers
                        'baseTitle' : 'Base Layers',
                        // title of layers
                        'overlayTitle' : 'Layers',
                        // layers you don't want to manage with layer switcher
                        'excludeLayers' : [],
                        // css class of container element, maptalks-layer-switcher by default
                        'containerClass' : 'maptalks-layer-switcher'
                    },
                    baseLayer: new maptalks.GroupTileLayer('Base TileLayer', [
                        new maptalks.TileLayer('Carto light',{
                            'visible' : false,
                            'urlTemplate': 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                            'subdomains'  : ['a','b','c','d']
                        }),
                        new maptalks.TileLayer('Carto dark',{
                            'urlTemplate': 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                            'subdomains'  : ['a','b','c','d']
                        }),
                        new maptalks.TileLayer('天地图',{
                            'visible' : false,
                            'urlTemplate': 'http://t{s}.tianditu.com/DataServer?T=vec_c&x={x}&y={y}&l={z}',
                            'subdomains'  : ['1','2','3','4']
                        }),
                        new maptalks.TileLayer('百度地图',{
                            'visible' : false,
                            'urlTemplate': 'http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1',
                            'subdomains'  : [0,1,2,3,4,5,6,7,8,9]
                        }),
                        new maptalks.TileLayer('GoogleMap',{
                            'visible' : false,
                            'urlTemplate': 'http://www.google.cn/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i342009817!3m9!2sen-US!3sCN!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!4e0&token=32965',
                            'subdomains'  : ['1','2','3','4']
                        })
                    ]),
                    altitudeScale: 2,
                    postEffect: {
                        enable: true,
                        FXAA: {
                            enable: true
                        }
                    },
                    light: {
                        main: {
                            intensity: 1,
                            shadow: true,
                            shadowQuality: 'high'
                        },
                        ambient: {
                            intensity: 0.
                        },
                        ambientCubemap: {
                            texture: './imgs/data-1491838644249-ry33I7YTe.hdr',
                            exposure: 1,
                            diffuseIntensity: 0.5,
                            specularIntensity: 2
                        }
                    },
                    layers : [
                        // new maptalks.VectorLayer('v').addGeometry(zcq_maptalks)
                        // new maptalks.TileLayer('road', {
                        //     urlTemplate:'http://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png',
                        //     subdomains:['a','b','c','d'],
                        //     opacity:1
                        // })
                    ]
                },
                visualMap: {
                    show: true,
                    calculable: true,
                    realtime: false,
                    inRange: {
                        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                        // color:['#ff3333','orange','yellow','lime','aqua'].reverse()
                    },
                    outOfRange: {
                        colorAlpha: 0
                    },
                    max: jsondata[1]
                },
                series: [{
                    type: 'bar3D',
                    shading: 'lambert',
                    coordinateSystem: 'maptalks3D',
                    barSize: 1,
                    // minHeight:200,
                    silent: true,
                    data: jsondata[0],
                    itemStyle: {
                        color: 'orange',
                        opacity: 1
                    }
                }]
            });
            // layer.render = function() {
            //     let series = myChart.getOption().series;
            //     myChart.setOption({
            //         series: []
            //     });
            //     myChart.setOption({
            //         series: series
            //     });
            // }
            var maptalksIns = myChart.getModel().getComponent('maptalks3D').getMaptalks();
            // new maptalks.VectorLayer('vector').addGeometry(zcq_maptalks).addTo(maptalksIns);
            maptalksIns.on('click', function(e) {
                console.log(e)
            });
            myChart.hideLoading();
        });
    });

    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

function building1() {
    $("#map").css('display',"none");
    // $("#map").empty();
    $("#container_echarts").css('display',"block");
    $("#table").css('display',"none");
    $.getJSON('./Data/building_3.json',function (buildingjson) {
        $.getJSON('./Data/zcq.json',function (zcqjsondata) {
            var multipolygon = new Array();
            var zcq_features = zcqjsondata.features;
            for(var iii = 0; iii< zcq_features.length; iii++){
                if (zcq_features[iii].geometry.type == 'MultiPolygon'){
                    for(var iiii = 0; iiii < zcq_features[iii].geometry.coordinates.length;iiii++){
                        multipolygon.push(zcq_features[iii].geometry.coordinates[iiii]);
                    }
                }else {
                    multipolygon.push(zcq_features[iii].geometry.coordinates);
                }

            }
            var zcq_maptalks = new maptalks.MultiPolygon(multipolygon, {
                visible : true,
                editable : true,
                cursor : null,
                shadowBlur : 0,
                shadowColor : 'black',
                draggable : false,
                dragShadow : false, // display a shadow during dragging
                // drawOnAxis : null,  // force dragging stick on a axis, can be: x, y
                symbol: {
                    'lineColor' : '#34495e',
                    'lineWidth' : 2,
                    'polygonFill' : 'rgb(135,196,240)',
                    'polygonOpacity' : 0.6
                }
            });

            var center = [106.55659,29.562201];
            var map_talk = new maptalks.Map('container_echarts',
                {
                    center:  center,
                    zoom: 16,
                    zoomControl : {
                        'position'  : 'top-left',
                        'slider'    : true,
                        'zoomLevel' : true
                    },
                    zoomable:true,
                    centerCross:true,
                    zoomAnimation:true,
                    scrollWheelZoom:true,
                    scaleControl:true,
                    overviewControl : true,
                    pitch : 52,
                    layerSwitcherControl: {
                        'position'  : 'top-right',
                        // title of base layers
                        'baseTitle' : 'Base Layers',
                        // title of layers
                        'overlayTitle' : 'Layers',
                        // layers you don't want to manage with layer switcher
                        'excludeLayers' : [],
                        // css class of container element, maptalks-layer-switcher by default
                        'containerClass' : 'maptalks-layer-switcher'
                    },
                    // baseLayer : new maptalks.TileLayer('tile', {
                    //         // 'urlTemplate' : 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
                    //         // 'urlTemplate':'http://www.google.cn/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i342009817!3m9!2sen-US!3sCN!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!4e0&token=32965',// Google Maps
                    //         // 'urlTemplate': 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
                    //         // 'subdomains'  : ['a','b','c','d'],
                    //         //天地图
                    //         'urlTemplate': 'http://t{s}.tianditu.com/DataServer?T=vec_c&x={x}&y={y}&l={z}',
                    //         'subdomains'  : ['1','2','3','4'],
                    //         //百度
                    //         // 'urlTemplate' : 'http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1',
                    //         // 'subdomains'  : [0,1,2,3,4,5,6,7,8,9],
                    //     }),
                    baseLayer: new maptalks.GroupTileLayer('Base TileLayer', [
                        new maptalks.TileLayer('Carto light',{
                            'urlTemplate': 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                            'subdomains'  : ['a','b','c','d']
                        }),
                        new maptalks.TileLayer('Carto dark',{
                            'visible' : false,
                            'urlTemplate': 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                            'subdomains'  : ['a','b','c','d']
                        }),
                        new maptalks.TileLayer('天地图',{
                            'visible' : false,
                            'urlTemplate': 'http://t{s}.tianditu.com/DataServer?T=vec_c&x={x}&y={y}&l={z}',
                            'subdomains'  : ['1','2','3','4']
                        }),
                        new maptalks.TileLayer('百度地图',{
                            'visible' : false,
                            'urlTemplate': 'http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1',
                            'subdomains'  : [0,1,2,3,4,5,6,7,8,9]
                        }),
                        new maptalks.TileLayer('GoogleMap',{
                            'visible' : false,
                            'urlTemplate': 'http://www.google.cn/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i342009817!3m9!2sen-US!3sCN!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!4e0&token=32965',
                            'subdomains'  : ['1','2','3','4']
                        })
                    ]),
                    attribution : {
                        content : '&copy; <a href="https://www.didiaosuo.com">paulhee</a>'
                    },
                    layers : [
                        new maptalks.VectorLayer('v').addGeometry(zcq_maptalks)
                        // new maptalks.TileLayer('road', {
                        //     urlTemplate:'http://t{s}.tianditu.com/DataServer?T=cva_c&x={x}&y={y}&l={z}',
                        //     subdomains:['1', '2', '3', '4', '5'],
                        //     opacity:1
                        // })
                    ]
                });

            // new maptalks.control.Attribution({
            //     position : 'top-right',
            //     content : '<div class="heading">loading……</div>'
            // }).addTo(map_talk);

            var symbol = {
                'polygonOpacity' : 1,
                'polygonFill' : 'rgba(0, 255, 0, 1)'
            };

            buildingjson.features.forEach(function (f) {
                var height = 3;
                var JZDS_LC = parseInt(f.properties.JZDS_LC);
                if (!isNaN(JZDS_LC)){
                    height = JZDS_LC*3;
                }
                f.properties.height = height;
            });
            var buildingLayer = new maptalks.ExtrudePolygonLayer('buildings', buildingjson.features, {
                'forceRenderOnMoving' : true,
                'ambientLight' : [0, 0, 0]
            })
                .setStyle([
                    {
                        filter : ['==', 'type', 'ruins'],
                        symbol : { 'polygonFill' : '#bbb' }
                    },
                    {
                        filter : ['==', 'type', 'storage_tank'],
                        symbol : { 'polygonFill' : 'rgba(0, 255, 0, 1)' }
                    },
                    {
                        filter : ['==', 'type', 'hospital'],
                        symbol : { 'polygonFill' : 'rgba(255, 255, 0, 1)' }
                    },
                    {
                        filter : ['==', 'type', 'place_of_worship'],
                        symbol : { 'polygonFill' : 'rgba(0, 255, 255, 1)' }
                    },
                    {
                        filter : ['==', 'type', 'garage'],
                        symbol : { 'polygonFill' : 'rgba(0, 255, 255, 1)' }
                    },
                    {
                        filter : true,
                        symbol : { 'polygonFill' : '#bbb' }
                    }
                ]).addTo(map_talk);

            // //获取地图状态
            // function getStatus() {
            //     var extent = map_talk.getExtent(),
            //         ex = [
            //             '{',
            //             'xmin:' + extent.xmin.toFixed(5),
            //             ', ymin:' + extent.ymin.toFixed(5),
            //             ', xmax:' + extent.xmax.toFixed(5),
            //             ', ymax:' + extent.xmax.toFixed(5),
            //             '}'
            //         ].join('');
            //     var center = map_talk.getCenter();
            //     var mapStatus = [
            //         'Center : [' + [center.x.toFixed(5), center.y.toFixed(5)].join() + ']',
            //         'Extent : ' + ex,
            //         'Size : ' + map_talk.getSize().toArray().join(),
            //         'Zoom : ' + map_talk.getZoom(),
            //         'MinZoom : ' + map_talk.getMinZoom(),
            //         'MaxZoom : ' + map_talk.getMaxZoom(),
            //         'Projection : ' + map_talk.getProjection().code
            //     ];
            //
            //     document.getElementById('status').innerHTML = '<div style="background-color:rgba(13, 13, 13, 0.5);width:100%;height:100%;padding:10px 10px 10px 10px;font:13px bold sans-serif;color:#fff">' + mapStatus.join('<br>') + '</div>';
            // };
            // map_talk.on('zoomend moving moveend', getStatus);
            // getStatus();
            //限制地图区域
            // var extent = map_talk.getExtent();
            // // set map's max extent to map's extent at zoom 14
            // map_talk.setMaxExtent(extent);
            // map_talk.setZoom(map_talk.getZoom() - 2, { animation : false });
        });
    });
}

function building() {
    // /*********WMS服务***********/
    var wmsLayer = L.tileLayer.wms('http://localhost:8080/geoserver/cite/wms?', {
        layers: 'cite:building',
        zIndex: 99999999
    }).addTo(map);
    // /*********TMS服务***********/
    // var tmsLayer = L.tileLayer('http://127.0.0.1:8080/geoserver/cite/service/tms/1.0.0/test:gj@EPSG:4326@png/{z}/{x}/{y}.png', {
    //     tms: true
    // }).addTo(map);
    // /***leaflet1.0使用geoserver发布的pbf数据,需要leaflet.vectorgrid.js***/
    // var localUrl = "http://127.0.0.1:8080/geoserver/gwc/service/tms/1.0.0/test:gj@EPSG:4326@pbf/{z}/{x}/{-y}.pbf";
    // var localVectorTileOptions = {
    //     rendererFactory: L.canvas.tile,
    //     attribution: 'mycontributors',
    //     vectorTileLayerStyles: vectorTileStyling
    // };
    // var localPbfLayer = L.vectorGrid.protobuf(localUrl, localVectorTileOptions).addTo(map);
}
//mapv
function DiDi(tablename) {
    $("#map").css('display',"none");
    // $("#map").empty();
    $("#container_echarts").css('display',"block");
    $("#table").css('display',"none");
    //加载按钮，有问题
    // var dom = document.getElementById("container_echarts");
    // var myChart = echarts.init(dom);
    // myChart.showLoading();
    var taxiRoutes = [];
    $.get('Data/cq_qx2000.json', function (myJson){
        $.post("./php/didi.php?tablename="+tablename,function (data) {
            var driveData = JSON.parse(data);
            var bmap = new BMap.Map('container_echarts', {
                enableMapClick: false,
                // minZoom: 4
                //vectorMapLevel: 3
            });
            bmap.enableScrollWheelZoom();
            bmap.setMapStyle({
                styleJson: [
                    {
                        featureType: 'water',
                        elementType: 'all',
                        stylers: {
                            color: '#044161'
                        }
                    },
                    {
                        featureType: 'land',
                        elementType: 'all',
                        stylers: {
                            color: '#091934'
                        }
                    },
                    {
                        featureType: 'boundary',
                        elementType: 'geometry',
                        stylers: {
                            color: '#064f85'
                        }
                    },
                    {
                        featureType: 'railway',
                        elementType: 'all',
                        stylers: {
                            visibility: 'off'
                        }
                    },
                    {
                        featureType: 'highway',
                        elementType: 'geometry',
                        stylers: {
                            color: '#004981'
                        }
                    },
                    {
                        featureType: 'highway',
                        elementType: 'geometry.fill',
                        stylers: {
                            color: '#005b96',
                            lightness: 1
                        }
                    },
                    {
                        featureType: 'highway',
                        elementType: 'labels',
                        stylers: {
                            visibility: 'on'
                        }
                    },
                    {
                        featureType: 'arterial',
                        elementType: 'geometry',
                        stylers: {
                            color: '#004981',
                            lightness: -39
                        }
                    },
                    {
                        featureType: 'arterial',
                        elementType: 'geometry.fill',
                        stylers: {
                            color: '#00508b'
                        }
                    },
                    {
                        featureType: 'poi',
                        elementType: 'all',
                        stylers: {
                            visibility: 'on'
                        }
                    },
                    {
                        featureType: 'green',
                        elementType: 'all',
                        stylers: {
                            color: '#056197',
                            visibility: 'off'
                        }
                    },
                    {
                        featureType: 'subway',
                        elementType: 'all',
                        stylers: {
                            visibility: 'off'
                        }
                    },
                    {
                        featureType: 'manmade',
                        elementType: 'all',
                        stylers: {
                            visibility: 'off'
                        }
                    },
                    {
                        featureType: 'local',
                        elementType: 'all',
                        stylers: {
                            visibility: 'off'
                        }
                    },
                    {
                        featureType: 'arterial',
                        elementType: 'labels',
                        stylers: {
                            visibility: 'off'
                        }
                    },
                    {
                        featureType: 'boundary',
                        elementType: 'geometry.fill',
                        stylers: {
                            color: '#029fd4'
                        }
                    },
                    {
                        featureType: 'building',
                        elementType: 'all',
                        stylers: {
                            color: '#1a5787'
                        }
                    },
                    {
                        featureType: 'label',
                        elementType: 'all',
                        stylers: {
                            visibility: 'on'
                        }
                    },
                    {
                        featureType: 'poi',
                        elementType: 'labels.text.fill',
                        stylers: {
                            color: '#ffffff'
                        }
                    },
                    {
                        featureType: 'poi',
                        elementType: 'labels.text.stroke',
                        stylers: {
                            color: '#1e1c1c'
                        }
                    }
                ]
            });
            bmap.centerAndZoom(new BMap.Point(106.558027,29.558934), 10); // 初始化地图,设置中心点坐标和地图级别
            // 第一步创建mapv示例
            var mapv = new Mapv({
                drawTypeControl: true,
                map: bmap  // 百度地图的map实例
            });

            var layer = new Mapv.Layer({
                zIndex: 1,
                mapv: mapv,
                dataType: 'polyline',
                coordType: 'bd09ll',
                data: driveData,
                drawType: 'simple',
                drawOptions: {
                    lineWidth: 1,
                    shadowBlur: 10,
                    shadowColor: "rgba(250, 255, 0, 1)",
                    strokeStyle: "rgba(250, 250, 0, 2)"
                },
                animation: 'time',
                animationOptions: {
                    //scope: 60 * 60 * 3,
                    size: 5,
                    duration: 30000, // 动画时长, 单位毫秒
                    fps: 20,         // 每秒帧数
                    transition: "linear",
                }
                // animation: true,
                // animationOptions: {
                //     size: 1
                // }
            });
            layer.setMapv(mapv);
            var cq_layer = new Mapv.Layer({
                //mapv: mapv, // 对应的mapv实例
                zIndex: 1, // 图层层级
                dataType: 'polygon', // 数据类型，面类型
                data: myJson, // 数据
                dataRangeControl: false, // 值阈控件
                drawType: 'simple', // 展示形式
                drawOptions: { // 绘制参数
                    fillStyle: 'rgba(200, 200, 50, 1)', // 填充颜色
                    //strokeStyle: 'rgba(0, 0, 255, 1)', // 描边颜色
                    //lineWidth: 4, // 描边宽度
                    shadowColor: 'rgba(255, 255, 255, 1)', // 投影颜色
                    shadowBlur: 35,  // 投影模糊级数
                    globalCompositeOperation: 'lighter', // 颜色叠加方式
                    size: 5 // 半径
                }
            });
            cq_layer.setMapv(mapv);
        });
    });
}

//百度 echarts
function guiji1(tablename) {
    $("#map").css('display',"none");
    // $("#map").empty();
    $("#container_echarts").css('display',"block");
    $("#table").css('display',"none");
    var dom = document.getElementById("container_echarts");
    var myChart = echarts.init(dom);
    myChart.showLoading();
    var taxiRoutes = [];
    var enteredDay='2018-05-01';
    $.post("./php/guiji.php?tablename="+"realtimedata_201805_merge_people_time"+"&enteredDay="+enteredDay,function (data) {
        var mydata = JSON.parse(data);
        // var responseJson = JSON.parse(data);
        // if(responseJson.status == 'success'){
        //     var trace = responseJson.data;
        //     for (var i =0;i<trace.length;i++){
        //         taxiRoutes.push({
        //             coords: trace[i]
        //         });
        //     }
        // }
        // var mydata = responseJson.data;
        myChart.setOption(
            option={
                title: {
                    text: '磁器口景区游客轨迹',
                    subtext: '',
                    x: 'center',
                    textStyle: {
                        color: '#fff'
                    }
                },
                bmap: {
                    center: [106.456187, 29.587515],
                    zoom: 17,
                    roam: true,
                    mapStyle: {'styleJson': [{
                            'featureType': 'water',
                            'elementType': 'all',
                            'stylers': {
                                'color': '#031628'
                            }
                        }, {
                            'featureType': 'land',
                            'elementType': 'geometry',
                            'stylers': {
                                'color': '#000102'
                            }
                        }, {
                            'featureType': 'highway',
                            'elementType': 'all',
                            'stylers': {
                                'visibility': 'off'
                            }
                        }, {
                            'featureType': 'arterial',
                            'elementType': 'geometry.fill',
                            'stylers': {
                                'color': '#000000'
                            }
                        }, {
                            'featureType': 'arterial',
                            'elementType': 'geometry.stroke',
                            'stylers': {
                                'color': '#0b3d51'
                            }
                        }, {
                            'featureType': 'local',
                            'elementType': 'geometry',
                            'stylers': {
                                'color': '#000000'
                            }
                        }, {
                            'featureType': 'railway',
                            'elementType': 'geometry.fill',
                            'stylers': {
                                'color': '#000000'
                            }
                        }, {
                            'featureType': 'railway',
                            'elementType': 'geometry.stroke',
                            'stylers': {
                                'color': '#08304b'
                            }
                        }, {
                            'featureType': 'subway',
                            'elementType': 'geometry',
                            'stylers': {
                                'lightness': -70
                            }
                        }, {
                            'featureType': 'building',
                            'elementType': 'geometry.fill',
                            'stylers': {
                                'color': '#000000'
                            }
                        }, {
                            'featureType': 'all',
                            'elementType': 'labels.text.fill',
                            'stylers': {
                                'color': '#857f7f'
                            }
                        }, {
                            'featureType': 'all',
                            'elementType': 'labels.text.stroke',
                            'stylers': {
                                'color': '#000000'
                            }
                        }, {
                            'featureType': 'building',
                            'elementType': 'geometry',
                            'stylers': {
                                'color': '#022338'
                            }
                        }, {
                            'featureType': 'green',
                            'elementType': 'geometry',
                            'stylers': {
                                'color': '#062032'
                            }
                        }, {
                            'featureType': 'boundary',
                            'elementType': 'all',
                            'stylers': {
                                'color': '#465b6c'
                            }
                        }, {
                            'featureType': 'manmade',
                            'elementType': 'all',
                            'stylers': {
                                'color': '#022338'
                            }
                        }, {
                            'featureType': 'label',
                            'elementType': 'all',
                            'stylers': {
                                'visibility': 'off'
                            }
                        }]}
                },
                series: [
                    {
                        name:'巴渝民居馆',
                        type: 'effectScatter',
                        coordinateSystem: 'bmap',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                                formatter: '{b}'
                            }
                        },
                        symbolSize: function(val) {
                            return val[2] / 4;
                        },
                        showEffectOn: 'render',
                        itemStyle: {
                            normal: {
                                color: '#f4e925',
                                shadowBlur: 10,
                                shadowColor: '#333'
                            }
                        },
                        data: [{
                            name: '巴渝民居馆',
                            value:[106.457175,29.589819,30]
                        }]
                    },
                    {
                        name:'宝善宫',
                        type: 'effectScatter',
                        coordinateSystem: 'bmap',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                                formatter: '{b}'
                            }
                        },
                        symbolSize: function(val) {
                            return val[2] / 4;
                        },
                        showEffectOn: 'render',
                        itemStyle: {
                            normal: {
                                color: '#ff2200',
                                shadowBlur: 10,
                                shadowColor: '#333'
                            }
                        },
                        data: [{
                            name: '宝善宫',
                            value:[106.4577,29.585917,30]
                        }]
                    },
                    {
                        name:'磁器口牌坊',
                        type: 'effectScatter',
                        coordinateSystem: 'bmap',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                                formatter: '{b}'
                            }
                        },
                        symbolSize: function(val) {
                            return val[2] / 4;
                        },
                        showEffectOn: 'render',
                        itemStyle: {
                            normal: {
                                color: '#ff2200',
                                shadowBlur: 10,
                                shadowColor: '#333'
                            }
                        },
                        data: [{
                            name: '磁器口牌坊',
                            value:[106.458603,29.585199,30]
                        }]
                    },
                    {
                        name:'横街',
                        type: 'effectScatter',
                        coordinateSystem: 'bmap',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                                formatter: '{b}'
                            }
                        },
                        symbolSize: function(val) {
                            return val[2] / 4;
                        },
                        showEffectOn: 'render',
                        itemStyle: {
                            normal: {
                                color: '#ff2200',
                                shadowBlur: 10,
                                shadowColor: '#333'
                            }
                        },
                        data: [{
                            name: '横街',
                            value:[106.456806,29.588473,30]
                        }]
                    },
                    {
                        name:'老字号汇总',
                        type: 'effectScatter',
                        coordinateSystem: 'bmap',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                                formatter: '{b}'
                            }
                        },
                        symbolSize: function(val) {
                            return val[2] / 4;
                        },
                        showEffectOn: 'render',
                        itemStyle: {
                            normal: {
                                color: '#ff2200',
                                shadowBlur: 10,
                                shadowColor: '#333'
                            }
                        },
                        data: [{
                            name: '老字号汇总',
                            value:[106.458913,29.587805,30]
                        }]
                    },
                    {
                        name:'少妇尿童',
                        type: 'effectScatter',
                        coordinateSystem: 'bmap',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                                formatter: '{b}'
                            }
                        },
                        symbolSize: function(val) {
                            return val[2] / 4;
                        },
                        showEffectOn: 'render',
                        itemStyle: {
                            normal: {
                                color: '#ff2200',
                                shadowBlur: 10,
                                shadowColor: '#333'
                            }
                        },
                        data: [{
                            name: '少妇尿童',
                            value:[106.457673,29.588822,30]
                        }]
                    },
                    {
                        name:'西门',
                        type: 'effectScatter',
                        coordinateSystem: 'bmap',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                                formatter: '{b}'
                            }
                        },
                        symbolSize: function(val) {
                            return val[2] / 4;
                        },
                        showEffectOn: 'render',
                        itemStyle: {
                            normal: {
                                color: '#ff2200',
                                shadowBlur: 10,
                                shadowColor: '#333'
                            }
                        },
                        data: [{
                            name: '西门',
                            value:[106.454655,29.584056,30]
                        }]
                    },
                    {
                        name:'小重庆碑',
                        type: 'effectScatter',
                        coordinateSystem: 'bmap',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                                formatter: '{b}'
                            }
                        },
                        symbolSize: function(val) {
                            return val[2] / 4;
                        },
                        showEffectOn: 'render',
                        itemStyle: {
                            normal: {
                                color: '#ff2200',
                                shadowBlur: 10,
                                shadowColor: '#333'
                            }
                        },
                        data: [{
                            name: '小重庆碑',
                            value:[106.459155,29.58819,30]
                        }]
                    },
                    {
                        name:'鑫记杂货铺',
                        type: 'effectScatter',
                        coordinateSystem: 'bmap',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                                formatter: '{b}'
                            }
                        },
                        symbolSize: function(val) {
                            return val[2] / 4;
                        },
                        showEffectOn: 'render',
                        itemStyle: {
                            normal: {
                                color: '#ff2200',
                                shadowBlur: 10,
                                shadowColor: '#333'
                            }
                        },
                        data: [{
                            name: '鑫记杂货铺',
                            value:[106.456905,29.58512,30]
                        }]
                    },
                    {
                        name:'钟家大院',
                        type: 'effectScatter',
                        coordinateSystem: 'bmap',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                                formatter: '{b}'
                            }
                        },
                        symbolSize: function(val) {
                            return val[2] / 4;
                        },
                        showEffectOn: 'render',
                        itemStyle: {
                            normal: {
                                color: '#ff2200',
                                shadowBlur: 10,
                                shadowColor: '#333'
                            }
                        },
                        data: [{
                            name: '钟家大院',
                            value:[106.458872,29.585784,30]
                        }]
                    },
                    {
                        type: 'lines',
                        coordinateSystem: 'bmap',
                        polyline: true,
                        data: mydata,
                        silent: true,
                        lineStyle: {
                            normal: {
                                opacity: 0.2,
                                width: 2
                            }
                        },
                        progressiveThreshold: 500,
                        progressive: 100
                    },
                    {
                        type: 'lines',
                        coordinateSystem: 'bmap',
                        polyline: true,
                        data: mydata,
                        lineStyle: {
                            normal: {
                                width: 0.02
                            }
                        },
                        effect: {
                            constantSpeed: 40,
                            show: true,
                            trailLength: 0.02,
                            symbolSize: 4
                        },
                        zlevel: 19891015
                    }
                ]
            }
        );
        myChart.hideLoading();
    });
}
//leaflet 未成功
function guiji1(tablename) {
    $("#map").css('display',"block");
    $("#table").css('display',"none");
    var enteredDay='2018-05-01';
    $.post("./php/guiji.php?tablename="+"realtimedata_201805_merge_tourist"+"&enteredDay="+enteredDay,function (data) {
        var mydata = JSON.parse(data);
        //leaflet上使用echarts
        overlay = new L.echartsLayer(map, echarts);
        var chartsContainer = overlay.getEchartsContainer();
        overlay.initECharts(chartsContainer);
        option = {
            baseOption:{
                timeline:{
                    axisType:'',
                    autoPlay:true,
                    playInterval: 1000
                }
            },
            title: {
                text: '爱驴网游客轨迹',
                subtext: 'Develop By paulhee',
                sublink :'https://www.didiaosuo.com',
                left: 'center',
                textStyle: {
                    color: '#fff'
                }
            },
            geo: {
                map: '',
                label: {
                    emphasis: {
                        show: false
                    }
                },
                roam: true,//是否开启鼠标缩放和平移漫游
                itemStyle: {
                    normal: {
                        areaColor: '#323c48',
                        borderColor: '#404a59'
                    },
                    emphasis: {
                        areaColor: '#2a333d'
                    }
                }
            },
            series: [
                {
                    name:'巴渝民居馆',
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    zlevel: 2,
                    rippleEffect: {
                        brushType: 'stroke'
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}'
                        }
                    },
                    symbolSize: function(val) {
                        return val[2] / 4;
                    },
                    showEffectOn: 'render',
                    itemStyle: {
                        normal: {
                            color: '#f4e925',
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    data: [{
                        name: '巴渝民居馆',
                        value:[106.447092798968,29.585918252941,30],
                        lonlat:[106.447092798968,29.585918252941,30]
                    }]
                },
                {
                    name:'宝善宫',
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    zlevel: 2,
                    rippleEffect: {
                        brushType: 'stroke'
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}'
                        }
                    },
                    symbolSize: function(val) {
                        return val[2] / 4;
                    },
                    showEffectOn: 'render',
                    itemStyle: {
                        normal: {
                            color: '#ff2200',
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    data: [{
                        name: '宝善宫',
                        value:[106.44728139929,29.5821828708554,30],
                        lonlat:[106.44728139929,29.5821828708554,30]
                    }]
                },
                {
                    name:'磁器口牌坊',
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    zlevel: 2,
                    rippleEffect: {
                        brushType: 'stroke'
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}'
                        }
                    },
                    symbolSize: function(val) {
                        return val[2] / 4;
                    },
                    showEffectOn: 'render',
                    itemStyle: {
                        normal: {
                            color: '#ff2200',
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    data: [{
                        name: '磁器口牌坊',
                        value:[106.448185244656,29.5814330127009,30],
                        lonlat:[106.448185244656,29.5814330127009,30]
                    }]
                },
                {
                    name:'横街',
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    zlevel: 2,
                    rippleEffect: {
                        brushType: 'stroke'
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}'
                        }
                    },
                    symbolSize: function(val) {
                        return val[2] / 4;
                    },
                    showEffectOn: 'render',
                    itemStyle: {
                        normal: {
                            color: '#ff2200',
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    data: [{
                        name: '横街',
                        value:[106.446506733396,29.5846164698294,30],
                        lonlat:[106.446506733396,29.5846164698294,30]
                    }]
                },
                {
                    name:'老字号汇总',
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    zlevel: 2,
                    rippleEffect: {
                        brushType: 'stroke'
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}'
                        }
                    },
                    symbolSize: function(val) {
                        return val[2] / 4;
                    },
                    showEffectOn: 'render',
                    itemStyle: {
                        normal: {
                            color: '#ff2200',
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    data: [{
                        name: '老字号汇总',
                        value:[106.448624971171,29.5840520801472,30],
                        lonlat:[106.448624971171,29.5840520801472,30]
                    }]
                },
                {
                    name:'小重庆',
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    zlevel: 2,
                    rippleEffect: {
                        brushType: 'stroke'
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}'
                        }
                    },
                    symbolSize: function(val) {
                        return val[2] / 4;
                    },
                    showEffectOn: 'render',
                    itemStyle: {
                        normal: {
                            color: '#ff2200',
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    data: [{
                        name: '小重庆',
                        value:[106.44883938047,29.5844743982304,30],
                        lonlat:[106.44883938047,29.5844743982304,30]
                    }]
                },
                {
                    name:'鑫记杂货铺',
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    zlevel: 2,
                    rippleEffect: {
                        brushType: 'stroke'
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}'
                        }
                    },
                    symbolSize: function(val) {
                        return val[2] / 4;
                    },
                    showEffectOn: 'render',
                    itemStyle: {
                        normal: {
                            color: '#ff2200',
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    data: [{
                        name: '鑫记杂货铺',
                        value:[106.446595104185,29.5813697214482,30],
                        lonlat:[106.446595104185,29.5813697214482,30]
                    }]
                },
                {
                    type: 'lines',
                    coordinateSystem: 'geo',
                    polyline: true,
                    data: mydata,
                    silent: true,
                    lineStyle: {
                        normal: {
                            opacity: 0.2,
                            width: 1
                        }
                    },
                    progressiveThreshold: 500,
                    progressive: 100
                },
                {
                    type: 'lines',
                    coordinateSystem: 'geo',
                    polyline: true,
                    data: mydata,
                    lineStyle: {
                        normal: {
                            width: 0.02
                        }
                    },
                    effect: {
                        constantSpeed: 40,
                        show: true,
                        trailLength: 0.02,
                        symbolSize: 2
                    },
                    zlevel: 1
                }
            ]
        };
        // 使用刚指定的配置项和数据显示图表
        overlay.setOption(option);
    });
}
//maptalks
function guiji2(tablename) {
    $("#map").css('display',"none");
    $("#container_echarts").css('display',"block");
    $("#table").css('display',"none");
    var dom = document.getElementById("container_echarts");
    var myChart = echarts.init(dom);
    myChart.showLoading();
    var enteredDay='2018-05-01';
    $.post("./php/guiji.php?tablename="+"realtimedata_201805_merge_touristWGS"+"&enteredDay="+enteredDay,function (data) {
        var mydata = JSON.parse(data);
        var option = {
            maptalks3D: {
                center: [106.4473,29.5823],
                zoom: 16,
                // pitch: 55,
                zoomControl : {
                    'position'  : 'top-left',
                    'slider'    : true,
                    'zoomLevel' : true
                },
                layerSwitcherControl: {
                    'position'  : 'top-right',
                    // title of base layers
                    'baseTitle' : 'Base Layers',
                    // title of layers
                    'overlayTitle' : 'Layers',
                    // layers you don't want to manage with layer switcher
                    'excludeLayers' : [],
                    // css class of container element, maptalks-layer-switcher by default
                    'containerClass' : 'maptalks-layer-switcher'
                },
                baseLayer: {
                    'urlTemplate': 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
                    'subdomains': ['a', 'b', 'c', 'd']
                },
                altitudeScale: 2,
                postEffect: {
                    enable: true,
                    FXAA: {
                        enable: true
                    }
                },
                light: {
                    main: {
                        intensity: 1,
                        shadow: true,
                        shadowQuality: 'high'
                    },
                    ambient: {
                        intensity: 0.
                    },
                    ambientCubemap: {
                        texture: './imgs/data-1491838644249-ry33I7YTe.hdr',
                        exposure: 1,
                        diffuseIntensity: 0.5,
                        specularIntensity: 2
                    }
                },
                layers : [
                    // new maptalks.VectorLayer('v').addGeometry(zcq_maptalks)
                    // new maptalks.TileLayer('road', {
                    //     urlTemplate:'http://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png',
                    //     subdomains:['a','b','c','d'],
                    //     opacity:1
                    // })
                ]
            },
            series: [
                {
                    type: 'scatter3D',
                    name:'巴渝民居馆',
                    coordinateSystem: 'maptalks3D',
                    zlevel: 2,
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}',
                            textStyle:{
                                color:'#000000',
                                fontWeight:'bolder'
                            }
                        }
                    },
                    symbolSize: 10,
                    itemStyle: {
                        color: [1,1,1,1],
                        opacity: 0.8
                    },
                    data: [{
                        name: '巴渝民居馆',
                        value:[106.44677323249758,29.586121837686434,5]
                    }]
                },
                {
                    name:'宝善宫',
                    type: 'scatter3D',
                    coordinateSystem: 'maptalks3D',
                    zlevel: 2,
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}',
                            textStyle:{
                                color:'#000000',
                                fontWeight:'bolder'
                            }
                        }
                    },
                    symbolSize: 10,
                    itemStyle: {
                        color: [1,1,1,1],
                        opacity: 0.8
                    },
                    data: [{
                        name: '宝善宫',
                        value:[106.44729425116597,29.58222586360869,5]
                    }]
                },
                {
                    name:'磁器口牌坊',
                    type: 'scatter3D',
                    coordinateSystem: 'maptalks3D',
                    zlevel: 2,
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}',
                            textStyle:{
                                color:'#000000',
                                fontWeight:'bolder'
                            }
                        }
                    },
                    symbolSize: 10,
                    itemStyle: {
                        color: [1,1,1,1],
                        opacity: 0.8
                    },
                    data: [{
                        name: '磁器口牌坊',
                        value:[106.44819596057485,29.58151843384318,5]
                    }]
                },
                {
                    name:'横街',
                    type: 'scatter3D',
                    coordinateSystem: 'maptalks3D',
                    zlevel: 2,
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}',
                            textStyle:{
                                color:'#000000',
                                fontWeight:'bolder'
                            }
                        }
                    },
                    symbolSize: 10,
                    itemStyle: {
                        color: [1,1,1,1],
                        opacity: 0.8
                    },
                    data: [{
                        name: '横街',
                        value:[106.44640314741744,29.58477192565061,5]
                    }]
                },
                {
                    name:'老字号汇总',
                    type: 'scatter3D',
                    coordinateSystem: 'maptalks3D',
                    zlevel: 2,
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}',
                            textStyle:{
                                color:'#000000',
                                fontWeight:'bolder'
                            }
                        }
                    },
                    symbolSize: 10,
                    itemStyle: {
                        color: [1,1,1,1],
                        opacity: 0.8
                    },
                    data: [{
                        name: '老字号汇总',
                        value:[106.44850820027501,29.584128066314076,5]
                    }]
                },
                {
                    name:'少妇尿童',
                    type: 'scatter3D',
                    coordinateSystem: 'maptalks3D',
                    zlevel: 2,
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}',
                            textStyle:{
                                color:'#000000',
                                fontWeight:'bolder'
                            }
                        }
                    },
                    symbolSize: 10,
                    itemStyle: {
                        color: [1,1,1,1],
                        opacity: 0.8
                    },
                    data: [{
                        name: '少妇尿童',
                        value:[106.44727002270676,29.585130420427358,5]
                    }]
                },
                {
                    name:'西门',
                    type: 'scatter3D',
                    coordinateSystem: 'maptalks3D',
                    zlevel: 2,
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}',
                            textStyle:{
                                color:'#000000',
                                fontWeight:'bolder'
                            }
                        }
                    },
                    symbolSize: 10,
                    itemStyle: {
                        color: [1,1,1,1],
                        opacity: 0.8
                    },
                    data: [{
                        name: '西门',
                        value:[106.44424852005132,29.580334126231094,5]
                    }]
                },
                {
                    name:'小重庆碑',
                    type: 'scatter3D',
                    coordinateSystem: 'maptalks3D',
                    zlevel: 2,
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}',
                            textStyle:{
                                color:'#000000',
                                fontWeight:'bolder'
                            }
                        }
                    },
                    symbolSize: 10,
                    itemStyle: {
                        color: [1,1,1,1],
                        opacity: 0.8
                    },
                    data: [{
                        name: '小重庆碑',
                        value:[106.44875036815979,29.58451602985505,5]
                    }]
                },
                {
                    name:'鑫记杂货铺',
                    type: 'scatter3D',
                    coordinateSystem: 'maptalks3D',
                    zlevel: 2,
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}',
                            textStyle:{
                                color:'#000000',
                                fontWeight:'bolder'
                            }
                        }
                    },
                    symbolSize: 10,
                    itemStyle: {
                        color: [1,1,1,1],
                        opacity: 0.8
                    },
                    data: [{
                        name: '鑫记杂货铺',
                        value:[106.44649891688616,29.58142014221494,5]
                    }]
                },
                {
                    name:'钟家大院',
                    type: 'scatter3D',
                    coordinateSystem: 'maptalks3D',
                    zlevel: 2,
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}',
                            textStyle:{
                                color:'#000000',
                                fontWeight:'bolder'
                            }
                        }
                    },
                    symbolSize: 10,
                    itemStyle: {
                        color: [1,1,1,1],
                        opacity: 0.8
                    },
                    data: [{
                        name: '钟家大院',
                        value:[106.44846531130852,29.582106661238353,5]
                    }]
                },
                {
                    type: 'lines3D',
                    coordinateSystem: 'maptalks3D',
                    effect: {
                        show: true,
                        constantSpeed: 5,
                        trailWidth: 2,
                        trailLength: 0.4,
                        trailOpacity: 1,
                        spotIntensity: 10
                    },
                    blendMode: 'lighter',//是叠加模式，该模式可以让数据集中的区域因为叠加而产生高亮的效果
                    polyline: true,
                    lineStyle: {
                        width: 0.1,
                        color: 'rgb(200, 40, 0)',
                        opacity: 0.
                    },
                    data: mydata
                }
            ]
        };
        myChart.setOption(option);
        var maptalksIns = myChart.getModel().getComponent('maptalks3D').getMaptalks();
        maptalksIns.on('click', function(e) {
            console.log(e)
        });
        myChart.hideLoading();
    });
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}
//mapv
function guiji(tablename) {
    $("#map").css('display',"none");
    // $("#map").empty();
    $("#container_echarts").css('display',"block");
    $("#table").css('display',"none");
    //加载按钮，有问题
    var dom = document.getElementById("container_echarts");
    var myChart = echarts.init(dom);
    myChart.showLoading();
    var enteredDay='2018-05-01';
    $.post("./php/guiji_mapv.php?tablename="+"realtimedata_201805_merge_people_time"+"&enteredDay="+enteredDay,function (data) {
        var driveData = JSON.parse(data);
        // // 添加时间戳
        // for (var i = 0; i < driveData.length; i++) {
        //     var geo = driveData[i].geo;
        //     for (var j = 0; j < geo.length; j++) {
        //         geo[j].push(new Date().getTime() / 1000 + 10 * 60 * j);
        //     }
        // }
        var bmap = new BMap.Map('container_echarts', {
            enableMapClick: false,
            // minZoom: 4
            //vectorMapLevel: 3
        });
        bmap.enableScrollWheelZoom();
        bmap.setMapStyle({
            styleJson: [
                {
                    featureType: 'water',
                    elementType: 'all',
                    stylers: {
                        color: '#044161'
                    }
                },
                {
                    featureType: 'land',
                    elementType: 'all',
                    stylers: {
                        color: '#091934'
                    }
                },
                {
                    featureType: 'boundary',
                    elementType: 'geometry',
                    stylers: {
                        color: '#064f85'
                    }
                },
                {
                    featureType: 'railway',
                    elementType: 'all',
                    stylers: {
                        visibility: 'off'
                    }
                },
                {
                    featureType: 'highway',
                    elementType: 'geometry',
                    stylers: {
                        color: '#004981'
                    }
                },
                {
                    featureType: 'highway',
                    elementType: 'geometry.fill',
                    stylers: {
                        color: '#005b96',
                        lightness: 1
                    }
                },
                {
                    featureType: 'highway',
                    elementType: 'labels',
                    stylers: {
                        visibility: 'on'
                    }
                },
                {
                    featureType: 'arterial',
                    elementType: 'geometry',
                    stylers: {
                        color: '#004981',
                        lightness: -39
                    }
                },
                {
                    featureType: 'arterial',
                    elementType: 'geometry.fill',
                    stylers: {
                        color: '#00508b'
                    }
                },
                {
                    featureType: 'poi',
                    elementType: 'all',
                    stylers: {
                        visibility: 'on'
                    }
                },
                {
                    featureType: 'green',
                    elementType: 'all',
                    stylers: {
                        color: '#056197',
                        visibility: 'off'
                    }
                },
                {
                    featureType: 'subway',
                    elementType: 'all',
                    stylers: {
                        visibility: 'off'
                    }
                },
                {
                    featureType: 'manmade',
                    elementType: 'all',
                    stylers: {
                        visibility: 'off'
                    }
                },
                {
                    featureType: 'local',
                    elementType: 'all',
                    stylers: {
                        visibility: 'off'
                    }
                },
                {
                    featureType: 'arterial',
                    elementType: 'labels',
                    stylers: {
                        visibility: 'off'
                    }
                },
                {
                    featureType: 'boundary',
                    elementType: 'geometry.fill',
                    stylers: {
                        color: '#029fd4'
                    }
                },
                {
                    featureType: 'building',
                    elementType: 'all',
                    stylers: {
                        color: '#1a5787'
                    }
                },
                {
                    featureType: 'label',
                    elementType: 'all',
                    stylers: {
                        visibility: 'on'
                    }
                },
                {
                    featureType: 'poi',
                    elementType: 'labels.text.fill',
                    stylers: {
                        color: '#ffffff'
                    }
                },
                {
                    featureType: 'poi',
                    elementType: 'labels.text.stroke',
                    stylers: {
                        color: '#1e1c1c'
                    }
                }
            ]
        });
        bmap.centerAndZoom(new BMap.Point(106.456187, 29.587515), 17); // 初始化地图,设置中心点坐标和地图级别
        // 第一步创建mapv示例
        var mapv = new Mapv({
            drawTypeControl: true,
            map: bmap  // 百度地图的map实例
        });

        var layer = new Mapv.Layer({
            zIndex: 1,
            mapv: mapv,
            dataType: 'polyline',
            coordType: 'bd09ll',
            data: driveData,
            drawType: 'simple',
            drawOptions: {
                lineWidth: 1,
                shadowBlur: 10,
                shadowColor: "rgba(250, 255, 0, 1)",
                strokeStyle: "rgba(250, 250, 0, 2)"
            },
            animation: 'time',
            animationOptions: {
                //scope: 60 * 60 * 3,
                size: 5,
                duration: 30000, // 动画时长, 单位毫秒
                fps: 20,         // 每秒帧数
                transition: "linear",
            }
            // animation: true,
            // animationOptions: {
            //     size: 1
            // }
        });
        layer.setMapv(mapv);
        //点图层
        var poitlayer = new Mapv.Layer({
            mapv: mapv, // 对应的mapv实例
            zIndex: 19891015, // 图层层级
            dataType: 'point', // 数据类型，点类型
            data: [
                {
                    lng:106.457175,
                    lat:29.589819,
                    name:'10'
                },
                {
                    lng:106.4577,
                    lat:29.585917,
                    name:'10'
                },
                {
                    lng:106.458603,
                    lat:29.585199,
                    name:'10'
                },
                {
                    lng:106.456806,
                    lat:29.588473,
                    name:'10'
                },
                {
                    lng:106.458913,
                    lat:29.587805,
                    name:'10'
                },
                {
                    lng:106.457673,
                    lat:29.588822,
                    name:'10'
                },
                {
                    lng:106.454655,
                    lat:29.584056,
                    name:'10'
                },
                {
                    lng:106.459155,
                    lat:29.58819,
                    name:'10'
                },
                {
                    lng:106.456905,
                    lat:29.58512,
                    name:'10'
                },
                {
                    lng:106.458872,
                    lat:29.585784,
                    name:'10'
                }
            ], // 数据
            //dataRangeControl: false, // 值阈控件
            drawType: 'simple', // 展示形式
            drawOptions: {
                // 绘制参数
                fillStyle: 'rgba(200, 200, 50, 1)', // 填充颜色
                //strokeStyle: 'rgba(0, 0, 255, 1)', // 描边颜色
                //lineWidth: 4, // 描边宽度
                shadowColor: 'rgba(255, 255, 255, 1)', // 投影颜色
                shadowBlur: 35,  // 投影模糊级数
                globalCompositeOperation: 'lighter', // 颜色叠加方式
                label: { // 显示label文字
                    show: true, // 是否显示
                    font: "20px", // 设置字号
                    // minZoom: 7, // 最小显示的级别
                    fillStyle: 'rgba(255, 0, 0, 1)' // label颜色
                },
                size: 5 // 半径
            }
        });
        //poitlayer.setMapv(mapv);
        //文本图层
        // var textlayer = new Mapv.Layer({
        //     //mapv: mapv, // 对应的mapv实例
        //     zIndex: 19891015, // 图层层级
        //     dataType: 'point', // 数据类型，点类型
        //     data: [
        //         {
        //             geometry:{
        //                 type:'Point',
        //                 coordinates:[106.457175,29.589819]
        //             },
        //             text:'巴渝居民馆'
        //         },
        //         {
        //             geometry:{
        //                 type:'Point',
        //                 coordinates:[106.4577,29.585917]
        //             },
        //             text:'宝善宫'
        //         },
        //         {
        //             geometry:{
        //                 type:'Point',
        //                 coordinates:[106.458603,29.585199]
        //             },
        //             text:'磁器口牌坊'
        //         },
        //         {
        //             geometry:{
        //                 type:'Point',
        //                 coordinates:[106.456806,29.588473]
        //             },
        //             text:'横街'
        //         },
        //         {
        //             geometry:{
        //                 type:'Point',
        //                 coordinates:[106.458913,29.587805]
        //             },
        //             text:'老字号汇总'
        //         },
        //         {
        //             geometry:{
        //                 type:'Point',
        //                 coordinates:[106.457673,29.588822]
        //             },
        //             text:'少妇尿童'
        //         },
        //         {
        //             geometry:{
        //                 type:'Point',
        //                 coordinates:[106.454655,29.584056]
        //             },
        //             text:'西门'
        //         },
        //         {
        //             geometry:{
        //                 type:'Point',
        //                 coordinates:[106.459155,29.58819]
        //             },
        //             text:'小重庆碑'
        //         },
        //         {
        //             geometry:{
        //                 type:'Point',
        //                 coordinates:[106.456905,29.58512]
        //             },
        //             text:'鑫记杂货铺'
        //         },
        //         {
        //             geometry:{
        //                 type:'Point',
        //                 coordinates:[106.458872,29.585784]
        //             },
        //             text:'钟家大院'
        //         }
        //     ], // 数据
        //     dataRangeControl: false, // 值阈控件
        //     drawType: 'simple', // 展示形式
        //     drawOptions: {
        //         // 绘制参数
        //         fillStyle: 'rgba(200, 200, 50, 1)', // 填充颜色
        //         //strokeStyle: 'rgba(0, 0, 255, 1)', // 描边颜色
        //         //lineWidth: 4, // 描边宽度
        //         shadowColor: 'rgba(255, 255, 255, 1)', // 投影颜色
        //         shadowBlur: 35,  // 投影模糊级数
        //         globalCompositeOperation: 'lighter', // 颜色叠加方式
        //         size: 5 ,// 半径
        //         label:{
        //             show:true,
        //             font:"11px",
        //             fillStyle:'rgba(255, 255, 255, 1)' // label颜色
        //         }
        //     }
        // });
        // textlayer.setMapv(mapv);
        // textData=[
        //     {
        //         geometry:{
        //             type:'Point',
        //             coordinates:[106.457175,29.589819]
        //         },
        //         text:'巴渝居民馆'
        //     },
        //     {
        //         geometry:{
        //             type:'Point',
        //             coordinates:[106.4577,29.585917]
        //         },
        //         text:'宝善宫'
        //     },
        //     {
        //         geometry:{
        //             type:'Point',
        //             coordinates:[106.458603,29.585199]
        //         },
        //         text:'磁器口牌坊'
        //     },
        //     {
        //         geometry:{
        //             type:'Point',
        //             coordinates:[106.456806,29.588473]
        //         },
        //         text:'横街'
        //     },
        //     {
        //         geometry:{
        //             type:'Point',
        //             coordinates:[106.458913,29.587805]
        //         },
        //         text:'老字号汇总'
        //     },
        //     {
        //         geometry:{
        //             type:'Point',
        //             coordinates:[106.457673,29.588822]
        //         },
        //         text:'少妇尿童'
        //     },
        //     {
        //         geometry:{
        //             type:'Point',
        //             coordinates:[106.454655,29.584056]
        //         },
        //         text:'西门'
        //     },
        //     {
        //         geometry:{
        //             type:'Point',
        //             coordinates:[106.459155,29.58819]
        //         },
        //         text:'小重庆碑'
        //     },
        //     {
        //         geometry:{
        //             type:'Point',
        //             coordinates:[106.456905,29.58512]
        //         },
        //         text:'鑫记杂货铺'
        //     },
        //     {
        //         geometry:{
        //             type:'Point',
        //             coordinates:[106.458872,29.585784]
        //         },
        //         text:'钟家大院'
        //     }
        // ];
        // var textDataSet = new mapv.DataSet(textData);
        // var textOptions = {
        //     draw: 'text',
        //     font: '14px Arial',
        //     fillStyle: 'white',
        //     shadowColor: 'yellow',
        //     shadowBlue: 10,
        //     zIndex: 11,
        //     shadowBlur: 10
        // };
        // var textMapvLayer = new mapv.baiduMapLayer(map, textDataSet, textOptions);
    })
}

function guiji_reli(tablename) {
    tablename = 'realtimedata_20180425_0502_merge_people_time';
    $("#map").css('display',"none");
    // $("#map").empty();
    $("#container_echarts").css('display',"block");
    $("#table").css('display',"none");
    var dom = document.getElementById("container_echarts");
    var myChart = echarts.init(dom);
    var app = {};
    option = null;
    app.title = '磁器口游客热力图';
    myChart.showLoading();
    var timelist=['04-25','04-26','04-27','04-28','04-29','04-30','05-01','05-02','05-03','05-04'];
    var spotxy = new Array();
    spotxy['巴渝民居馆']=[106.457175,29.589819];
    spotxy['宝善宫']=[106.4577,29.585917];
    spotxy['磁器口牌坊']=[106.458603,29.585199];
    spotxy['横街']=[106.456806,29.588473];
    spotxy['老字号总汇']=[106.458913,29.587805];
    spotxy['少妇尿童']=[106.457673,29.588822];
    spotxy['西门']=[106.454655,29.584056];
    spotxy['小重庆碑']=[106.459155,29.58819];
    spotxy['鑫记杂货铺']=[106.456905,29.58512];
    spotxy['钟家大院']=[106.458872,29.585784];
    var mydatetime ='2018-04';
    $.post("./php/ailv_reli.php?tablename="+tablename+"&datetime="+mydatetime,function (data) {
        var option ={
            baseOption:{
                timeline: {
                    axisType: 'category',
                    orient: 'vertical',
                    autoPlay: true,
                    inverse: true,
                    playInterval: 1000,
                    left: null,
                    right: 30,
                    top: 50,
                    bottom: 20,
                    width: 55,
                    height: null,
                    label: {
                        normal: {
                            textStyle: {
                                color: '#ddd'
                            }
                        },
                        emphasis: {
                            textStyle: {
                                color: '#fff'
                            }
                        }
                    },
                    symbol: 'circle',
                    lineStyle: {
                        color: '#555'
                    },
                    checkpointStyle: {
                        color: '#bbb',
                        borderColor: '#777',
                        borderWidth: 2
                    },
                    controlStyle: {
                        showNextBtn: false,
                        showPrevBtn: false,
                        normal: {
                            color: '#666',
                            borderColor: '#666'
                        },
                        emphasis: {
                            color: '#aaa',
                            borderColor: '#aaa'
                        }
                    },
                    data: timelist
                },
                title: {
                    text: '磁器口游客热力图',
                    subtext: 'Develop By paulhee',
                    sublink :'https://www.didiaosuo.com',
                    left: 'center',
                    textStyle: {
                        color: '#fff'
                    }
                },
                backgroundColor: 'rgba(64,74,89,0.8)',
                // geo: {
                //     map: '',
                //     label: {
                //         emphasis: {
                //             show: false
                //         }
                //     },
                //     roam: true,//是否开启鼠标缩放和平移漫游
                //     itemStyle: {
                //         normal: {
                //             areaColor: '#323c48',
                //             borderColor: '#404a59'
                //         },
                //         emphasis: {
                //             areaColor: '#2a333d'
                //         }
                //     }
                // },
                bmap: {
                    center: [106.456187, 29.587515],
                    zoom: 17,
                    roam: true
                },
                // visualMap:{
                //     // pieces: [
                //     //     {min: 300, label: '严重污染'},            // (300, Infinity]
                //     //     {min: 200, max: 300, label: '重度污染'},  // (200, 300]
                //     //     {min: 150, max: 200, label: '中度污染'},  // (150, 200]
                //     //     {min: 100, max: 150, label: '轻度污染'},  // (100, 150]
                //     //     {min: 50, max: 100, label: '良'},   // (50, 100]
                //     //     {min: 0, max: 50, label: '优'}       // (0, 50]
                //     // ],
                //     min: 0,
                //     max: 500,
                //     splitNumber: 5,
                //     // inRange: {
                //     //     color: ['#E0022B', '#E09107', '#A3E00B'].reverse()
                //     // },
                //     color: ['#A3E00B', '#E09107', '#E0022B'],
                //     textStyle: {
                //         color: '#fff'
                //     },
                //     right:5
                // },
                visualMap: {
                    left:5,
                    top:1,
                    min: 0,
                    max: 5000,
                    seriesIndex: 0,
                    calculable: true,
                    inRange: {
                        color: ['#E0022B', '#E09107', '#A3E00B'].reverse()
                    }
                },
                series: [
                    {
                        name:'磁器口游客',
                        type: 'heatmap',
                        coordinateSystem: 'bmap',
                        data:[],//seriesdata
                        zlevel:19891015,
                        label:{
                            show:true
                        }
                    }]
            },
            options:[]
        };
        var responseJson = JSON.parse(data);
        for (var i =0;i<responseJson.length;i++){
            var seriesdata = new Array();
            for(var j =0;j<responseJson[i].data.length;j++){
                var item = responseJson[i].data[j];
                var spotName = item['spotName'];
                var count = item['count'];
                var X = spotxy[spotName][0];
                var Y = spotxy[spotName][1];
                seriesdata.push([X,Y,count]);
            }
            option.options.push({
                title: {
                    text: responseJson[i].datetime+'重庆市磁器口景区游客热力图'
                },
                series: {
                    data: seriesdata
                }
            });
        };
        myChart.setOption(option);

        // myChart.setOption(
        //     option = {
        //         timeline: {
        //             axisType: 'category',
        //             orient: 'vertical',
        //             autoPlay: false,
        //             inverse: true,
        //             playInterval: 1000,
        //             left: null,
        //             right: 10,
        //             top: 20,
        //             bottom: 20,
        //             width: 55,
        //             height: null,
        //             label: {
        //                 normal: {
        //                     textStyle: {
        //                         color: '#ddd'
        //                     }
        //                 },
        //                 emphasis: {
        //                     textStyle: {
        //                         color: '#fff'
        //                     }
        //                 }
        //             },
        //             symbol: 'none',
        //             lineStyle: {
        //                 color: '#555'
        //             },
        //             checkpointStyle: {
        //                 color: '#bbb',
        //                 borderColor: '#777',
        //                 borderWidth: 2
        //             },
        //             controlStyle: {
        //                 showNextBtn: false,
        //                 showPrevBtn: false,
        //                 normal: {
        //                     color: '#666',
        //                     borderColor: '#666'
        //                 },
        //                 emphasis: {
        //                     color: '#aaa',
        //                     borderColor: '#aaa'
        //                 }
        //             },
        //             data: timelist
        //         },
        //         title: {
        //             text: '重庆市空气质量AQI热力图',
        //             subtext: 'Develop By paulhee',
        //             sublink :'https://www.didiaosuo.com',
        //             left: 'center',
        //             textStyle: {
        //                 color: '#fff'
        //             }
        //         },
        //         backgroundColor: 'rgba(64,74,89,0.8)',
        //         // geo: {
        //         //     map: '',
        //         //     label: {
        //         //         emphasis: {
        //         //             show: false
        //         //         }
        //         //     },
        //         //     roam: true,//是否开启鼠标缩放和平移漫游
        //         //     itemStyle: {
        //         //         normal: {
        //         //             areaColor: '#323c48',
        //         //             borderColor: '#404a59'
        //         //         },
        //         //         emphasis: {
        //         //             areaColor: '#2a333d'
        //         //         }
        //         //     }
        //         // },
        //         bmap: {
        //             center: [107.72009,29.871354],
        //             zoom: 8.5,
        //             roam: true
        //         },
        //         // visualMap:{
        //         //     // pieces: [
        //         //     //     {min: 300, label: '严重污染'},            // (300, Infinity]
        //         //     //     {min: 200, max: 300, label: '重度污染'},  // (200, 300]
        //         //     //     {min: 150, max: 200, label: '中度污染'},  // (150, 200]
        //         //     //     {min: 100, max: 150, label: '轻度污染'},  // (100, 150]
        //         //     //     {min: 50, max: 100, label: '良'},   // (50, 100]
        //         //     //     {min: 0, max: 50, label: '优'}       // (0, 50]
        //         //     // ],
        //         //     min: 0,
        //         //     max: 500,
        //         //     splitNumber: 5,
        //         //     // inRange: {
        //         //     //     color: ['#E0022B', '#E09107', '#A3E00B'].reverse()
        //         //     // },
        //         //     color: ['#A3E00B', '#E09107', '#E0022B'],
        //         //     textStyle: {
        //         //         color: '#fff'
        //         //     },
        //         //     right:5
        //         // },
        //         visualMap: {
        //             right:5,
        //             min: 0,
        //             max: 500,
        //             seriesIndex: 0,
        //             calculable: true,
        //             inRange: {
        //                 color: ['#E0022B', '#E09107', '#A3E00B'].reverse()
        //             }
        //         },
        //         series: [
        //         {
        //             name:'AQI',
        //             type: 'heatmap',
        //             coordinateSystem: 'bmap',
        //             data:seriesdata,
        //             zlevel:19891015
        //         },
        //         {
        //             name:'cq_map',
        //             type: 'map',
        //             map: 'MY',
        //             roam:true,
        //             itemStyle:{
        //                 normal:{
        //                     opacity:0.5,
        //                     borderWidth:2,
        //                     borderColor:'#cccccc',
        //                     areaColor:'rgba(128, 128, 128, 0)',
        //                 }
        //             },
        //             emphasis:{
        //                 itemStyle:{
        //
        //                 }
        //             },
        //             zlevel:19891010
        //         }]
        //     }
        // );
        // if (!app.inNode) {
        //     // 添加百度地图插件
        //     var bmap = myChart.getModel().getComponent('bmap').getBMap();
        //     bmap.addControl(new BMap.MapTypeControl());
        // }
        myChart.hideLoading();
    });
    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }
}