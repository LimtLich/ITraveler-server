var Sequelize = require('sequelize')
var sequelize = require('../sequelize')

var travel_detail = sequelize.define(
    'travel_detail', {
        id: {
            autoIncrement: true
        },
        travel_guid: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        index: Sequelize.INTEGER,
        key: Sequelize.STRING,
        value: Sequelize.STRING,
    }, {
        underscored: true
    })


module.exports = travel_detail
