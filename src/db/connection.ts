import * as pg from 'pg';
import { Sequelize } from "sequelize-typescript";
import { User } from "../models/User";
import { Publisher } from "../models/Publisher";
import { Advertiser } from "../models/Advertiser";

const connection = new Sequelize({
  dialect: "postgres",
  dialectModule: pg,
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
  logging: false,
  models: [User, Publisher, Advertiser]
});

export default connection;