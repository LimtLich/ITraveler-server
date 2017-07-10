
var express = require('express')
var session = require('express-session')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var redis = require('redis')

var client = redis.createClient(6379, '127.0.0.1',{})

client.auth('limt123', function() {
    console.log('pass redis auth!')
})
client.on('ready', function(res) {
    console.log('redis ready!')
})

var getClientAddress = function(req) {
    return (req.headers['x-forwarded-for'] || '').split(',')[0] ||
        req.connection.remoteAddress;
}

module.exports = (app) => {
    app.use('/', express.static('mp'))

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({
        extended: false
    }))

    // parse application/json
    app.use(bodyParser.json())

    app.use(cookieParser())

    app.use(cookieParser('Limt'));

    app.use(session({
        secret: '1234567890QWERTY'
    }))

    app.use('/service/:permission/:type/:action', function(req, res, next) {
        console.log('in this server')
        require('./public/' + req.params.type)(req, res, next)
    })

}
