const l = console.log;
const os = require('os');
const config = require('../settings');
const { cmd } = require('../lib/command');

cmd({
    pattern: "alive",
    alias: "bot",
    react: "👻",
    desc: "Check if Gojo bot is online with system info.",
    category: "main",
    filename: __filename
}, async (gojo, mek, m, { from, reply }) => {
    try {
        // Bot uptime calculation
        const uptimeSeconds = process.uptime();
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);
        const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

        // System info
        const totalMemMB = (os.totalmem() / (1024 * 1024)).toFixed(2);
        const freeMemMB = (os.freemem() / (1024 * 1024)).toFixed(2);
        const usedMemMB = (totalMemMB - freeMemMB).toFixed(2);
        const cpuModel = os.cpus()[0].model;
        const cpuCores = os.cpus().length;

        // Stylish caption message
        const caption = 
`⚡ *GOJO MAX* is *ALIVE* ⚡

🟢 *System Status:* ONLINE ✅
🔋 *Bot Power Level:* ∞
⏳ *Uptime:* ${uptimeStr}

💾 *RAM Usage:* ${usedMemMB} MB / ${totalMemMB} MB
🖥️ *CPU:* ${cpuModel} (${cpuCores} cores)

👤 *Created & Managed by:* sayura

💬 Type *.menu* to explore commands!`;

        // Send image + caption
        await gojo.sendMessage(from, {
            image: { url: "https://raw.githubusercontent.com/gojo18888/Photo-video-/refs/heads/main/file_000000003a2861fd8da00091a32a065a.png" },
            caption
        }, { quoted: mek });

        // Send voice message (PTT style)
        await gojo.sendMessage(from, {
            audio: {
                url: "https://github.com/gojo18888/Photo-video-/raw/refs/heads/main/gojo-satoru%20(1).mp3"
            },
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: mek });

    } catch (e) {
        l(e);
        reply("❌ Error in .alive command:\n" + e.message);
    }
});
