var Sequelize = require('sequelize')
var sequelize = require('../sequelize')

var travel_detail = sequelize.define(
    'travel_detail', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true
        },
        travel_guid: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        index: Sequelize.INTEGER,
        key: Sequelize.STRING,
        value: Sequelize.STRING,
    }, {
        underscored: true
    })


module.exports = travel_detail
