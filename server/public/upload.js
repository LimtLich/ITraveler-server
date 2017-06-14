var formidable = require('formidable')
var util = require('util')
var fs = require('fs')


var dealFile = function(fileInfo) {
  var file = require('../../db/models/file')
  var attachment = require('../../db/models/attachment')
  return file.upsert({
    hash: fileInfo.hash,
    size: fileInfo.size,
    path: "upload/files/" + fileInfo.hash,
    type: fileInfo.type,
    name: fileInfo.name
  }).then(() => {
    return attachment.create({
      file_hash: fileInfo.hash,
      name: fileInfo.name
    })
  })
}

var exec = {
  getAttachmentById(req, res, next) {
    var id = req.query.id
    if (id) {
      var fs = require('fs')
      var file = require('../../db/models/file')
      var attachment = require('../../db/models/attachment')
      attachment.belongsTo(file)
      attachment.findOne({
        include: file,
        where: {
          id: id
        }
      }).then((result) => {
        if (result != null) {
          var localFile = fs.readFileSync("upload/files/" + result.file_hash, 'binary')
          res.setHeader('Content-disposition', 'inline; filename=' + encodeURIComponent(result.name))
          res.setHeader('Content-Type', result.file.type)
          res.setHeader('Content-Length', result.file.size)
          res.write(localFile, 'binary')
          res.end()
        } else {
          res.end("no file record")
        }
      })
    } else {
      return Promise.reject("no file id")
    }
  },
  getAttachment(req, res, next) {
    var imgHash = req.query.hash
    if (imgHash) {
      var fs = require('fs')
      var localFile = fs.readFileSync("upload/files/" + imgHash, 'binary')
      res.write(localFile, 'binary')
      res.end()
    } else {
      return Promise.reject("no file record")
    }
  },
  getAllAttachment(req, res, next) {
    var fs = require('fs')
    var file = require('../../db/models/file')
    return file.findAll().then((result) => {
      if (result.length > 0) {
        return result
      } else {
        return Promise.reject('no file record')
      }
    })
  },
  setPictureAttribute(req, res, next) {
    var form = req.body.form
    var file = require('../../db/models/file')
    return file.findOne({
      where: {
        hash: form.hash
      }
    }).then((result) => {
      if (result) {
        result.pic_name = form.pic_name
        result.date = form.date
        result.describe = form.describe
        return result.save()
      } else {
        return Promise.reject('no file record')
      }
    })
  },
  deletePic(req, res, next) {
    var hash = req.body.hash
    var file = require('../../db/models/file')
    var attachment = require('../../db/models/attachment')
    return Promise.all([
      file.destroy({
        where:{
          hash:hash
        }
      }),
      attachment.destroy({
        where:{
          file_hash:hash
        }
      })
    ])
  },
  file(req) {
    return new Promise(function(resolve, reject) {
      if (req.method.toLowerCase() == 'post') {
        var form = new formidable.IncomingForm();
        form.uploadDir = "upload/temp";
        form.maxFieldsSize = 2 * 1024; //10G
        form.hash = "md5"

        if (!fs.existsSync("upload")) {
          fs.mkdirSync("upload")
        }

        if (!fs.existsSync("upload/files")) {
          fs.mkdirSync("upload/files")
        }
        if (!fs.existsSync("upload/temp")) {
          fs.mkdirSync("upload/temp")
        }

        form.on('file', function(name, file) {
          fs.rename(file.path, "upload/files/" + file.hash, function(result) {
            dealFile(file).then((result) => {
              resolve(result)
            })
          })
        })
        form.on('error', function(err) {
          console.log('error' + err)
        })
        form.parse(req)
      } else {
        reject("please post")
      }
    })
  }
}


module.exports = (req, res, next) => {
  var action = req.params.action
  Promise.resolve(action).then(function(result) {
    return exec[result](req, res, next)
  }).then(function(result) {
    if (req.params.action != "getAttachment" && req.params.action != "getAttachmentById") {
      res.send(result)
    }
  }).catch(function(error) {
    res.status(500).send(error.toString())
  })
}
