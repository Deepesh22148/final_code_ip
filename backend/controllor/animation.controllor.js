
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "path";
import fs from 'fs';
import { spawn } from "child_process";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pythonPath = "/opt/anaconda3/envs/animated_drawings/bin/python";
const scriptPath = "./scripts/test.py";  

const uploadDir = path.join(process.cwd(), 'uploads');


export const generateAnimation = async (req, res) => {
    console.log("Inside generateAnimation")
    try {
        const { id } = req.body;
        const fileName = `${id}-photo.jpg`;
        const inputPath = path.join(uploadDir, fileName);
        const outputDir = path.join(__dirname, `output_${id}`);
        const outputAnnotate = path.join(__dirname, 'annotations');

        if (!fs.existsSync(inputPath)) {
            return res.status(404).json({ error: 'Image file not found' });
        }
        const pythonProcess = spawn(pythonPath, [
            scriptPath,
            inputPath,
            outputDir,
            outputAnnotate
        ]);

        let pythonOutput = '';
        let pythonError = '';

        pythonProcess.stdout.on('data', (data) => {
            pythonOutput += data.toString();
            console.log(`Python Output: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            pythonError += data.toString();
            console.error(`Python Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                return res.status(200).json({
                    message: 'Animation generated successfully',
                    gifUrls: [
                        `${req.protocol}://${req.get('host')}/animations/${id}/video_dab.gif`,
                        `${req.protocol}://${req.get('host')}/animations/${id}/video_zombie.gif`,
                        `${req.protocol}://${req.get('host')}/animations/${id}/video_wave_hello.gif`,
                        `${req.protocol}://${req.get('host')}/animations/${id}/video_jumping_jacks.gif`,
                        `${req.protocol}://${req.get('host')}/animations/${id}/video_jumping.gif`
                        
                    ]
                });
            } else {
                return res.status(500).json({
                    error: 'Animation generation failed',
                    details: pythonError || 'Unknown error'
                });
            }
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


export const getAnimations = async (req, res) => {
    try {
        const { userId, filename } = req.params;
        const filePath = path.join(__dirname, `output_${userId}`, filename);
        
        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        } else {
            return res.status(404).json({ error: 'Animation file not found' });
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
