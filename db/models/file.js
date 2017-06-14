var Sequelize = require('sequelize')
var sequelize = require('../sequelize')

var file = sequelize.define(
  'file', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      unique: true
    },
    hash: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    size: Sequelize.INTEGER,
    path: Sequelize.STRING,
    type: Sequelize.STRING,
    name: Sequelize.STRING,
    type: Sequelize.DATE,
    pic_name: Sequelize.STRING,
    date:Sequelize.DATE,
    describe: Sequelize.STRING,
  }, {
    underscored: true
  })


module.exports = file
