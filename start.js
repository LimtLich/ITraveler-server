var express = require('express')
var config = require('./config')
var https = require('https');

var serverEntry = require('./server/entry')

var fs = require('fs');

var options = {
	key:fs.readFileSync('./ssl/214102035480717.key'),
	cert:fs.readFileSync('./ssl/214102035480717.pem'),
}

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port

var app = express()
serverEntry(app)
app.use("/", express.static('./dist'))

https.createServer(options,app).listen(443);
console.log("HTTPS Web Server Start ,Port:443")

module.exports = app.listen(port, function(err) {
    if (err) {
        console.log(err)
        return
    }
    console.log('Listening at http://localhost:' + port + '\n')
})
