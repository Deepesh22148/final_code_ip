import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import connectToDatabase from "./Database/connectToDatabase.js";
import dotenv from "dotenv";
import authRouter from "./route/auth.route.js";
import fileRouter from "./route/file.route.js";
import { getAnimations } from './controllor/animation.controllor.js';

dotenv.config();

const app = express();
const port = process.env["PORT"] || 3000;

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/auth" , authRouter)
app.use("/api/v1/file" , fileRouter)


app.get('/animations/:userId/:filename', getAnimations);

app.get('/', (req, res) => {
    res.send("Server is ready to listen");
})
app.listen(port , async ()=> {
    console.log("Server started on port 3000");
    await connectToDatabase();
})
