const { Model, DataTypes } = require("sequelize");
const database = require('../database');


class User extends Model {}

User.init({
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    id_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {sequelize: database, modelName: 'User'});

module.exports = User;