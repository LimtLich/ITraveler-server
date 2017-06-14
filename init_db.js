var requireDir = require('require-dir')
var model = requireDir('./db/models')

Promise.all(Object.keys(model)
    .map((k) => {
        return model[k].sync({
            force: true
        })
    })).then(function() {
    console.log("ok")
}).catch(function(err) {
    console.log(err)
})
