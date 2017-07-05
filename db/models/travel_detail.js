var Sequelize = require('sequelize')
var sequelize = require('../sequelize')

var travel_detail = sequelize.define(
    'travel_detail', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true
        },
        travel_guid: Sequelize.STRING,
        index: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        key: Sequelize.STRING,
        value: Sequelize.STRING,
    }, {
        underscored: true
    })


module.exports = travel_detail
