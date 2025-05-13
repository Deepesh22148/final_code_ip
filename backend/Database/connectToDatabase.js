import dotenv from 'dotenv'
import mongoose from "mongoose";
dotenv.config();


const connectToDatabase = async () => {
    try{
        await mongoose.connect(process.env["DATABASE_URL"]);
        console.log("Connected to Database");
    }
    catch (e) {
        console.log(e)
        console.log("Error connecting to Database");
    }
}

export default connectToDatabase
