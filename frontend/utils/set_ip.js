const os = require("os");
const fs = require("fs");
const path = require("path");
const port = 3000

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    const ips = Object.values(interfaces)
        .flat()
        .filter(ip => ip.family === 'IPv4' && !ip.internal)
        .map(ip => ip.address);
    return ips;
}

const localIP = getLocalIP();
console.log("Detected Local IP:", localIP[0]);

const constantsPath = path.join(__dirname, "constants.js");

fs.readFile(constantsPath, "utf8", (err, data) => {
    if (err) {
        console.error("Error reading constants.js:", err);
        return;
    }

    const newBaseURL = `export const baseURL = "http://${localIP}:${port}";`;

    const baseURLRegex = /export\s+const\s+baseURL\s*=\s*"[^"]*";/;
    let updatedData;

    if (baseURLRegex.test(data)) {
        updatedData = data.replace(baseURLRegex, newBaseURL);
    } else {
        updatedData = `${newBaseURL}\n${data}`;
    }

    fs.writeFile(constantsPath, updatedData, "utf8", (err) => {
        if (err) {
            console.error("Error writing to constants.js:", err);
            return;
        }
        console.log(" Successfully updated baseURL in constants.js");
    });
});
