import express, { type Express } from "express";
import path from "path";
import { fileURLToPath } from "url";
import userRouter from "./src/routes/index.js";
import morgan from "morgan"
import dotenv from "dotenv";
//database
import mongoose from "mongoose";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express()
const port: number = parseInt(process.env.PORT as string) || 3000;

//database connection
const mongoDB =  "mongodb://127.0.0.1:27017/testdb";
mongoose.connect(mongoDB)
mongoose.Promise = Promise;
const db: mongoose.Connection = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan("dev"))

app.use(express.static(path.join(__dirname, "../public")))

app.get("/", (req, res) => {
  res.status(200).send("OK");
});


app.use("/", userRouter)

app.listen(port, () => {
    console.log("Server running on port " + port)
})