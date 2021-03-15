const Sequelize = require("sequelize");

const DB = process.env.DB_HOST;

const database = new Sequelize(`postgres://postgres:postgres@${DB}:5432`);

module.exports = database;
