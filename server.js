//express_demo.js 文件
var express = require('express');
var app = express();
var https = require('https');
var http = require('http')
var fs = require('fs');

var options = {
	key:fs.readFileSync('./ssl/214102035480717.key'),
	cert:fs.readFileSync('./ssl/214102035480717.pem'),
}
 
app.get('/', function (req, res) {
   res.send('Hello World');
})
 
http.createServer(app).listen(80);
https.createServer(options,app).listen(443);
console.log("HTTPS Web Server Start,Port:443")
console.log("应用实例，访问地址为 http://80")