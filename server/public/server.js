
var exec = {
    createTravel(req, res) {
        var travel = require('../../db/models/travel')
        var obj = req.query
        console.log(obj)
        return travel.create({
            title: obj.title,
            place: obj.place,
            cover_img: obj.cover_img,
            date: obj.date
        }).then((res) => {
            return res.guid
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
          console.log(indexList)
            // return travel_detail.destroy({
            //     where: {
            //         $and: {
            //             travel_guid: travelID,
            //             index: {
            //                 $notIn: indexList
            //             }
            //         }
            //     }
            // })
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
