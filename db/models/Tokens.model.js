const { Model, DataTypes } = require("sequelize");
const database = require('../database');


class Token extends Model {}

Token.init({
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    expires_in: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {sequelize: database, modelName: 'Tokens'});

module.exports = Token