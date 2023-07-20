import express from "express";
import * as dotenv from "dotenv";
// import cors from "cors";
dotenv.config({path:"./src/config/config.env"});
// import connection from "./db/connection"

// import routes from "./routes/routes";

const app = express();
const port = process.env.PORT || 3000;

// connection.sync().then(() => {
//     console.log("Database synced successfully");
// });

app.use(express.json());
// app.use(cors())
// app.use('/api', routes)
app.get("*", (req, res) => {
	res.status(400).send("Page not found");
});
app.listen(port, () => {
	console.log(`server is starting on port ${port}`);
});