import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config({path:"./src/config/config.env"});
import connection from "./db/connection"

import routes from "./routes/routes";

const app = express();
const port = process.env.PORT || 3000;

connection.sync().then(() => {
    console.log("Database synced successfully");
});

app.use(express.json());

const allowedOrigins = ['http://localhost:3000', "https://ad-network-ui.vercel.app"];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
  exposedHeaders: 'Token'
};

app.use(cors(options));

app.use('/api', routes);

app.get("*", (req, res) => {
	res.status(400).send("Page not found");
});
app.listen(port, () => {
	console.log(`server is starting on port ${port}`);
});