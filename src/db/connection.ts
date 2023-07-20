import { Sequelize } from "sequelize-typescript";
import { Publisher } from "../models/Publisher";

const connection = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
  logging: false,
  models: [Publisher]
});

export default connection;