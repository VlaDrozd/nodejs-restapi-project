const Sequelize = require("sequelize");

const DB = process.env.DB;

const database = new Sequelize(`postgres://postgres:postgres@${DB}:5432`);

module.exports = database;
