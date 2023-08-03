"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const User_1 = require("../models/User");
const Publisher_1 = require("../models/Publisher");
const Advertiser_1 = require("../models/Advertiser");
const connection = new sequelize_typescript_1.Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432,
    logging: false,
    models: [User_1.User, Publisher_1.Publisher, Advertiser_1.Advertiser]
});
exports.default = connection;
