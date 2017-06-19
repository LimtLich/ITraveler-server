var Sequelize = require('sequelize')
var sequelize = require('../sequelize')

var travel = sequelize.define(
    'travel', {
        guid: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
        },
        title: Sequelize.STRING,
        place: Sequelize.STRING,
        cover_img: Sequelize.STRING,
        date: Sequelize.DATE,
    }, {
        underscored: true
    })


module.exports = travel
