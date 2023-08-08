import * as pg from 'pg';
import { Sequelize } from "sequelize-typescript";
import { User } from "../models/User";
import { Publisher } from "../models/Publisher";
import { Advertiser } from "../models/Advertiser";

const connection = new Sequelize({
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
  models: [User, Publisher, Advertiser]
});

// connection.truncate({ cascade: true, restartIdentity: true });

export default connection;