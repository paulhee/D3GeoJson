var webserver = require('webserver')
var server = webserver.create();
var service = server.listen(8080,function (request,response) {
   var postRaw = request.postRaw;
   var aaa = new Array();
   aaa = postRaw.split("=");
   var url = "http://" + aaa[0];
   var md5_url = aaa[1];
   console.log(url);

   //获取源码
    var webPage = require('webpage');
});