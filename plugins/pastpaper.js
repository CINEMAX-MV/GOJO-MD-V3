// pastpp.js — Sri Lanka Past Paper Search & Download (reply-based)

const { cmd } = require('../lib/command');
const axios = require('axios');

let pastppConn = null;
const replyCache = {}; // { searchMsgId: [resultList] }

cmd({
    pattern: "pastpp",
    alias: ["pastpaper", "pastpapers"],
    desc: "Search and download Sri Lanka school past papers!",
    react: "📄",
    category: "education",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    pastppConn = conn;
    const query = args.join(" ").trim();

    if (!query) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        return reply('🔎 Type a past paper name, grade, or subject to search.\n\n📌 Example: `.pastpp grade 11 science`');
    }

    await conn.sendMessage(from, { react: { text: "🔍", key: mek.key } });

    try {
        const apiUrl = `https://api-pass.vercel.app/api/search?query=${encodeURIComponent(query)}&page=1`;
        const { data } = await axios.get(apiUrl);

        if (!Array.isArray(data.results) || data.results.length === 0) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply("❌ No past papers found. Try a different keyword.");
        }

        const results = data.results.slice(0, 25); // limit to 25 results
        let text = `*📄 Past Paper Results for:* \`${query}\`\n━━━━━━━━━━━━━━━━━━\n`;
        results.forEach((r, i) => {
            const title = r.title.length > 60 ? r.title.slice(0, 57) + "..." : r.title;
            text += `${i + 1}. ${title}\n`;
        });
        text += "━━━━━━━━━━━━━━━━━━\n🔁 _Reply with a number to download that paper._";

        const msg = await conn.sendMessage(from, {
            image: { url: results[0].thumbnail || 'https://raw.githubusercontent.com/gojo18888/Photo-video-/refs/heads/main/file_000000003a2861fd8da00091a32a065a.png' },
            caption: text,
            footer: "© GOJO MD | Past Paper Search",
            headerType: 4,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "GOJO MD | Auto AI",
                    body: "Powered by sayura | darkhackersl",
                    mediaType: 1,
                    thumbnailUrl: "https://raw.githubusercontent.com/gojo18888/Photo-video-/refs/heads/main/file_000000003a2861fd8da00091a32a065a.png",
                    sourceUrl: "https://github.com/darkhackersl",
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
        reply("⚠️ Error while searching past papers.");
    }
});

// Listen for reply to download
if (!global.__pastppReplyListener) {
    global.__pastppReplyListener = true;

    const { setTimeout } = require('timers');
    function waitForConn() {
        if (!pastppConn) return setTimeout(waitForConn, 500);
        pastppConn.ev.on("messages.upsert", async ({ messages }) => {
            const msg = messages[0];
            if (!msg?.message) return;

            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
            const quotedId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
            if (!quotedId || !(quotedId in replyCache)) return;

            const index = parseInt(text.trim(), 10);
            if (isNaN(index) || index < 1 || index > replyCache[quotedId].length) {
                await pastppConn.sendMessage(msg.key.remoteJid, { react: { text: "❌", key: msg.key } });
                return;
            }

            const paper = replyCache[quotedId][index - 1];
            try {
                await pastppConn.sendMessage(msg.key.remoteJid, { react: { text: "⏬", key: msg.key } });

                const { data: dl } = await axios.get(`https://api-pass.vercel.app/api/download?url=${encodeURIComponent(paper.url)}`);
                if (!dl?.download_info?.download_url) {
                    return pastppConn.sendMessage(msg.key.remoteJid, { text: "❌ Download link not found!" }, { quoted: msg });
                }

                await pastppConn.sendMessage(msg.key.remoteJid, {
                    document: { url: dl.download_info.download_url },
                    mimetype: "application/pdf",
                    fileName: dl.download_info.file_name || "pastpaper.pdf",
                    caption: `*📄 ${dl.download_info.file_title || paper.title}*\n\n📥 Source: ${paper.url}\n_Powered by GOJO MD_`
                }, { quoted: msg });

                await pastppConn.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } });
            } catch (e) {
                console.error(e);
                await pastppConn.sendMessage(msg.key.remoteJid, { react: { text: "❌", key: msg.key } });
                pastppConn.sendMessage(msg.key.remoteJid, { text: "❌ Failed to fetch the download link!" }, { quoted: msg });
            }
        });
    }

    waitForConn();
}
