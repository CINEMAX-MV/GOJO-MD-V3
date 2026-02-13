/*
Dont Remove Credit;
        CREDIT BY 𝐒𝐔𝐋𝐀-𝐌𝐃 OWNER SULAKSHA MADARA 
        SUPPORT - https://whatsapp.com/channel/0029Vb65iOZKwqSNKecV8V07
        
 Credit Remove කරන්න තරම් තිරිසනෙක් වෙන්න එපා ඕයි ☹️
*/

const axios = require('axios');
const config = require('../settings');
const { cmd, commands } = require('../lib/command');

const fs = require("fs");

cmd({
    pattern: "vv",
    react: "🛸",
    alias: ["retrive", "viewonce"],
    desc: "Fetch and resend a ViewOnce message content (image/video/voice).",
    category: "misc",
    use: "<query>",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        if (!m.quoted) return reply("Please reply to a ViewOnce message.");

        const mime = m.quoted.type;
        let ext, mediaType;
        
        if (mime === "imageMessage") {
            ext = "jpg";
            mediaType = "image";
        } else if (mime === "videoMessage") {
            ext = "mp4";
            mediaType = "video";
        } else if (mime === "audioMessage") {
            ext = "mp3";
            mediaType = "audio";
        } else {
            return reply("Unsupported media type. Please reply to an image, video, or audio message.");
        }

        var buffer = await m.quoted.download();
        var filePath = `${Date.now()}.${ext}`;

        fs.writeFileSync(filePath, buffer); 

        let mediaObj = {};
        mediaObj[mediaType] = fs.readFileSync(filePath);

        await conn.sendMessage(m.chat, mediaObj);

        fs.unlinkSync(filePath);

    } catch (e) {
        console.log("Error:", e);
        reply("An error occurred while fetching the ViewOnce message.", e);
    }
});

/*Plugin වටේ යවන්න එපා ඈ*/
