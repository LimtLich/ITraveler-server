
var express = require('express')
var session = require('express-session')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')

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
        console.log('service loading...')
        require('./public/' + req.params.type)(req, res, next)
    })

}
