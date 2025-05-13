import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { generateAnimation } from "../controllor/animation.controllor.js";

const fileRouter = Router();

// Upload directory setup
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, file.originalname); 
  }
});

const upload = multer({ storage });

// File upload route
fileRouter.post("/upload", upload.single("photo"), (req, res) => {
  console.log("File upload received"); // Debug log
  if (!req.file) {
    return res.status(400).send("No file received");
  }
  res.send(`File saved as: ${req.file.originalname}`);
});

fileRouter.post("/generateAnimation", (req, res) => {
  console.log("Generate animation request received", req.body);
  generateAnimation(req, res); 
});

fileRouter.post("/uploadBackground", upload.single("photo"), (req, res) => {
  console.log("File upload received"); // Debug log
  if (!req.file) {
    return res.status(400).send("No file received");
  }
  res.send(`File saved as: ${req.file.originalname}`);
});


fileRouter.post("/addBackground", (req , res)=> {
  console.log("Inside the background animation");
})

export default fileRouter;