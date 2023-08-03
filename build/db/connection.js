"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg = __importStar(require("pg"));
const sequelize_typescript_1 = require("sequelize-typescript");
const User_1 = require("../models/User");
const Publisher_1 = require("../models/Publisher");
const Advertiser_1 = require("../models/Advertiser");
const connection = new sequelize_typescript_1.Sequelize({
    dialect: "postgres",
    dialectModule: pg,
    host: 'ep-lively-queen-42128605-pooler.us-east-1.postgres.vercel-storage.com',
    username: 'default',
    password: 'vKHwhcx43uLm',
    database: 'verceldb',
    port: 5432,
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    models: [User_1.User, Publisher_1.Publisher, Advertiser_1.Advertiser]
});
exports.default = connection;
