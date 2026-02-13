const axios = require('axios');
const { cmd } = require("../lib/command");
const config = require("../settings");

const apilink = "https://miku-rest-api.vercel.app/api/pornhub";

cmd({
    pattern: "xxp",
    alias: ["pornhub2"],
    react: "🔞",
    desc: "Pornhub Fast Downloader",
    category: "download",
    use: ".ph < search term >",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("Type search term ❓");

        const res = await axios.get(`${apilink}/search?query=${encodeURIComponent(q)}`);
        const results = res.data?.result;

        if (!results || results.length === 0) return reply("No results found ❌");

        let msg = "*🔞 Pornhub Downloader 🔥*\n\n";
        results.slice(0, 10).forEach((v, i) => {
            msg += `*${i + 1}.* ${v.title}\n`;
        });
        msg += `\n_Reply with number to download_`;

        const sent = await conn.sendMessage(from, { text: msg }, { quoted: mek });

        conn.ev.once('messages.upsert', async ({ messages }) => {
            const userMsg = messages?.[0];
            if (!userMsg?.message) return;

            const txt = userMsg.message.conversation || userMsg.message.extendedTextMessage?.text;
            const isReply = userMsg.message?.extendedTextMessage?.contextInfo?.stanzaId === sent.key.id;

            if (!isReply) return;

            const num = parseInt(txt.trim()) - 1;
            if (num < 0 || num >= results.length) return reply("Invalid selection ❌");

            const link = results[num].link;
            const videoRes = await axios.get(`${apilink}/download?url=${encodeURIComponent(link)}`);
            const data = videoRes.data;

            if (!data?.video) return reply("Download link not found ❌");

            await conn.sendMessage(from, {
                document: { url: data.video },
                mimetype: "video/mp4",
                fileName: `${results[num].title}.mp4`,
                caption: `*${results[num].title}*\n\n${config.FOOTER}`
            }, { quoted: userMsg });
        });

    } catch (e) {
        console.log(e);
        await reply("Error occurred ⚠️");
    }
});
