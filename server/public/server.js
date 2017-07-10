
var redis = require('redis')
var client = redis.createClient(6379, '127.0.0.1', {})
client.auth('limt123')

var exec = {
    login(req, res) {
        var code = req.query.code
        var axios = require('axios')
        var appid = 'wxd0c4b4bff82e0eb1'
        var appsecret = '96d398394f035b667ac5ae53377010e9'

        if (!req.cookies.sessionID) {
            return axios.post('https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + appsecret + '&js_code=' + code + '&grant_type=authorization_code').then((res) => {
                var sessionID = req.sessionID
                client.hmset(sessionID, {
                    'openid': res.data.openid,
                    'session_key': res.data.session_key
                }, redis.print)
                return sessionID
            })
        }

    },
    createTravel(req, res) {
        var travel = require('../../db/models/travel')
        var obj = req.query
        console.log(obj)
        client.hgetall(req.cookies.sessionID, function(err, res) {
            if (err) {
                console.log('Error:' + err);
                return err
            } else {
                console.dir(res)
                return travel.create({
                    openid: res.openid,
                    title: obj.title,
                    place: obj.place,
                    cover_img: obj.cover_img,
                    date: obj.date
                }).then((res) => {
                    return res.guid
                })
            }

        })


    },
    getTravelInfo(req, res) {
        var travel = require('../../db/models/travel')
        var guid = req.query.guid
        return travel.findOne({
            where: {
                guid: guid
            }
        }).then((res) => {
            if (res) {
                return res
            } else {
                return Promise.reject('游记不存在')
            }
        })
    },
    editTravel(req, res) {
        var travel = require('../../db/models/travel')
        var travel_detail = require('../../db/models/travel_detail')
        var travelID = req.query.travelID
        var travelInfo = JSON.parse(req.query.travelInfo)
        var paragraphContent = JSON.parse(req.query.paragraphContent)
        var detailUpsertList = []
        var indexList = []
        console.log(req.query)
        return travel.findOne({
            where: {
                guid: travelID
            }
        }).then((res) => {
            if (res) {
                return res.update(travelInfo)
            }
        }).then(() => {
            paragraphContent.forEach((e) => {
                indexList.push(e.index)
                detailUpsertList.push(Promise.resolve().then(() => {
                    return travel_detail.findOne({
                        where: {
                            $and: {
                                travel_guid: travelID,
                                index: e.index
                            }
                        }
                    }).then((detail) => {
                        if (detail) {
                            return detail.update(e)
                        } else {
                            return travel_detail.create(e)
                        }
                    })
                }))
            })
            return Promise.all(detailUpsertList)
        }).then(() => {
            return travel_detail.destroy({
                where: {
                    $and: {
                        travel_guid: travelID,
                        index: {
                            $notIn: indexList
                        }
                    }
                }
            }).then(() => {
                return 'success'
            })
        })
    },
    getTravels(req, res) {
        var travel = require('../../db/models/travel')
        var travel_detail = require('../../db/models/travel_detail')
        travel.hasMany(travel_detail)
        return travel.findAll({
            where: {
                openid: req.session.openid
            },
            include: travel_detail
        })
    }
}


module.exports = (req, res, next) => {
    var action = req.params.action
    Promise.resolve(action).then(function(result) {
        return exec[result](req, res, next)
    }).then(function(result) {
        res.send(result)
    }).catch(function(error) {
        res.status(500).send(error.toString())
    })
}
