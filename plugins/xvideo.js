const { cmd } = require('../lib/command');
const axios = require('axios');

let hamsterConn = null;
const replyCache = {}; 

cmd({
    pattern: "xhsearch",
    alias: ["hamster", "xhamster"],
    desc: "Search and download videos from dtzhamster.netlify.app",
    react: "🔞",
    category: "adult",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    hamsterConn = conn;
    const query = args.join(" ").trim();

    if (!query) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        return reply('🔎 Type something to search.\n\n📌 Example: `.xhsearch sri lanka`');
    }

    await conn.sendMessage(from, { react: { text: "🔍", key: mek.key } });

    try {
        const searchUrl = `https://dtzhamster.netlify.app/search?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl);

        if (!Array.isArray(data.results) || data.results.length === 0) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply("❌ No results found. Try a different keyword.");
        }

        const results = data.results.slice(0, 25);
        let text = `*🔞 XHamster Results for:* \`${query}\`\n━━━━━━━━━━━━━━━━━━\n`;
        results.forEach((r, i) => {
            const title = r.title.length > 60 ? r.title.slice(0, 57) + "..." : r.title;
            text += `${i + 1}. ${title}\n`;
        });
        text += "━━━━━━━━━━━━━━━━━━\n🔁 _Reply with a number to download._";

        const msg = await conn.sendMessage(from, {
            image: { url: results[0].thumbnail || 'https://telegra.ph/file/63dcfdb47c0a2a5e2cde7.jpg' },
            caption: text,
            footer: "© GOJO MD | XHamster Search",
            headerType: 4,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "GOJO MD | Adult Search",
                    body: "Powered by dtzhamster.netlify.app",
                    mediaType: 1,
                    thumbnailUrl: "https://telegra.ph/file/63dcfdb47c0a2a5e2cde7.jpg",
                    sourceUrl: "https://dtzhamster.netlify.app",
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

        if (msg?.key?.id) {
            replyCache[msg.key.id] = results;
        }

        await conn.sendMessage(from, { react: { text: "✅", key: msg.key } });
    } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("⚠️ Error while searching.");
    }
});

// Reply Listener for Download
if (!global.__hamsterReplyListener) {
    global.__hamsterReplyListener = true;

    const { setTimeout } = require('timers');
    function waitForConn() {
        if (!hamsterConn) return setTimeout(waitForConn, 500);
        hamsterConn.ev.on("messages.upsert", async ({ messages }) => {
            const msg = messages[0];
            if (!msg?.message) return;

            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
            const quotedId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
            if (!quotedId || !(quotedId in replyCache)) return;

            const index = parseInt(text.trim(), 10);
            if (isNaN(index) || index < 1 || index > replyCache[quotedId].length) {
                await hamsterConn.sendMessage(msg.key.remoteJid, { react: { text: "❌", key: msg.key } });
                return;
            }

            const video = replyCache[quotedId][index - 1];
            try {
                await hamsterConn.sendMessage(msg.key.remoteJid, { react: { text: "⏬", key: msg.key } });

                const dlUrl = `https://dtzxhamsterdl.netlify.app/?url=${encodeURIComponent(video.url)}`;

                // Send as MP4 Document
                await hamsterConn.sendMessage(msg.key.remoteJid, {
                    document: { url: dlUrl },
                    mimetype: "video/mp4",
                    fileName: `${video.title || 'xhamster'}.mp4`,
                    caption: `*🎬 ${video.title}*\n\n📥 Source: ${video.url}\n_Powered by GOJO MD_`
                }, { quoted: msg });

                await hamsterConn.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } });
            } catch (e) {
                console.error(e);
                await hamsterConn.sendMessage(msg.key.remoteJid, { react: { text: "❌", key: msg.key } });
                hamsterConn.sendMessage(msg.key.remoteJid, { text: "❌ Failed to download video!" }, { quoted: msg });
            }
        });
    }

    waitForConn();
}
