var Sequelize = require('sequelize')
var sequelize = require('../sequelize')

var travel_detail = sequelize.define(
    'travel_detail', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        index:Sequelize.INTEGER,
        travel_guid: Sequelize.STRING,
        key: Sequelize.STRING,
        value: Sequelize.STRING,
    }, {
        underscored: true
    })


module.exports = travel_detail
