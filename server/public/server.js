﻿var redis = require('redis')
var client = redis.createClient(6379, '127.0.0.1', {})
client.auth('limt123')

var exec = {
    login(req, res) {
        var code = req.query.code
        var axios = require('axios')
        var appid = 'wxd0c4b4bff82e0eb1'
        var appsecret = '96d398394f035b667ac5ae53377010e9'
        if (req.cookies.sessionID) {
            client.hgetall(req.cookies.sessionID, function(err, res) {
                if (err) {
                    console.log('Error:' + err);
                    return err
                } else {
                    if (res) {
                        // console.dir(res)
                    } else {
                        return axios.post('https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + appsecret + '&js_code=' + code + '&grant_type=authorization_code').then((res) => {
                            client.hmset(req.cookies.sessionID, {
                                'openid': res.data.openid,
                                'session_key': res.data.session_key
                            }, redis.print)
                            // client.expire(req.sessionID, 3600 * 24)
                        })
                    }
                }
            })

        } else {
            return axios.post('https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + appsecret + '&js_code=' + code + '&grant_type=authorization_code').then((res) => {
                client.hmset(req.sessionID, {
                    'openid': res.data.openid,
                    'session_key': res.data.session_key
                }, redis.print)
                // client.expire(req.sessionID, 3600 * 24)
            }).then(() => {
                return req.sessionID
            })

        }
    },
    createTravel(req, res) {
        var travel = require('../../db/models/travel')
        var obj = req.query
        return new Promise(function(resolve, reject) {
            client.hgetall(req.cookies.sessionID, function(err, res) {
                // console.dir(res)
                resolve(res.openid)
            })
        }).then((openid) => {
            return travel.create({
                openid: openid,
                title: obj.title,
                place: obj.place,
                cover_img: obj.cover_img,
                date: obj.date
            }).then((res) => {
                return res.guid
            })
        })

    },
    getTravelInfo(req, res) {
        var guid = req.query.guid
        var travel = require('../../db/models/travel')
        var travel_detail = require('../../db/models/travel_detail')
        travel.hasMany(travel_detail)

        return travel.findOne({
            where: {
                guid: guid
            },
            include: travel_detail,
            attributes: {
                exclude: ['openid']
            }
        }).then((res) => {
            if (res) {
                return res
            } else {
                return Promise.reject('travel not exit')
            }
        })
    },
    editTravel(req, res) {
        var travel = require('../../db/models/travel')
        var travel_detail = require('../../db/models/travel_detail')
        var travelID = req.query.travelID
        var travelInfo = JSON.parse(req.query.travelInfo)
        var detailUpsertList = []
        var indexList = []
        return travel.findOne({
            where: {
                guid: travelID
            }
        }).then((res) => {
            if (res) {
                return res.update(travelInfo)
            }
        }).then(() => {
        	console.log(travelInfo.travel_details)
            travelInfo.travel_details.forEach((e) => {
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
            }).then(()=>{
            	return 'success'
            })
        })
    },
    getTravels(req, res) {
        var travel = require('../../db/models/travel')
        console.log('cookies', req.cookies)
        return new Promise(function(resolve, reject) {
            client.hgetall(req.cookies.sessionID, function(err, res) {
                // console.dir(res)
                resolve(res.openid)
            })
        }).then((openid) => {
            return travel.findAll({
                where: {
                    openid: openid
                },
                attributes: {
                    exclude: ['openid']
                }
            })
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