var Sequelize = require('sequelize')
var sequelize = connectDB({
    host: '119.23.221.116',
    user: 'root',
    password: 'lich69669',
    dbname: 'ITravel'
})

function connectDB(opt) {
    return new Sequelize(opt.dbname, opt.user, opt.password, {
        host: opt.host,
        dialect: 'mysql',
        timezone: '+8:00',
        pool: {
            max: 12,
            min: 0,
            idle: 60000
        },
        dialectOptions: {
            requestTimeout: 60000
        },
        logging: false
            // dialect: 'sqlite',
            // storage: 'database.db',
    })
}
module.exports = sequelize
