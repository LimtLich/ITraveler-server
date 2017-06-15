
var exec = {
    createTravel(req, res, next) {
        var obj = req.query
        console.log(obj)
        return "success"
    },

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
