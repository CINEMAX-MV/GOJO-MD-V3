const { cmd, commands } = require('../lib/command');
const yts = require('yt-search');
const { fetchJson } = require('../lib/functions');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');

// If you're using Node <18, enable fetch:
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Function to extract the video ID from youtu.be or YouTube links
function extractYouTubeId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|playlist\?list=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Convert any YouTube URL to full watch link
function convertYouTubeLink(q) {
    const videoId = extractYouTubeId(q);
    if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return q;
}

// SONG2
cmd({
    pattern: "song2",
    alias: "play2",
    desc: "To download songs.",
    react: "🎵",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("*`Need Title`*");
        q = convertYouTubeLink(q);
        const search = await yts(q);
        const data = search.videos[0];
        const url = data.url;

        const downMsg = `*Downloading ...📥*\n> gojo-ᴍᴅ ✻`;
        const upMsg = `*Uploading ...📤*\n> gojo-ᴍᴅ ✻`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.thumbnail },
            caption: downMsg,
            contextInfo: {
                mentionedJid: ['94743826406@s.whatsapp.net'],
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterName: "gojo-ᴍᴅ ✻",
                    serverMessageId: 999
                }
            }
        }, { quoted: mek });

        const down = await fetchJson(`https://apis-keith.vercel.app/download/dlmp3?url=${url}`);
        await conn.sendMessage(from, {
            text: upMsg,
            edit: sentMsg.key,
        });

        const laraDown = down.result.downloadUrl;

        await conn.sendMessage(from, {
            audio: { url: laraDown },
            mimetype: "audio/mpeg",
            contextInfo: {
                externalAdReply: {
                    title: "gojo-ᴍᴅ",
                    body: "© ᴄʀᴇᴀᴛᴇᴅ by sayura mihiranga",
                    mediaType: 1,
                    sourceUrl: url,
                    thumbnailUrl: down.result.image,
                    renderLargerThumbnail: true,
                    showAdAttribution: true
                }
            }
        }, { quoted: mek });

        await conn.sendMessage(from, { delete: sentMsg.key });
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// SONG3
cmd({
    pattern: "song3",
    alias: "play3",
    react: "🎶",
    desc: "Download YouTube song",
    category: "main",
    use: '.song <query>',
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        q = convertYouTubeLink(q);
        if (!q) return reply("*`Need YT_URL or Title`*");

        const search = await yts(q);
        const data = search.videos[0];
        const url = data.url;

        const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(url)}`;
        const res = await fetch(apiUrl);
        const sadiya = await res.json();

        if (!sadiya?.result?.downloadUrl) return reply("Download failed. Try again later.");

        await conn.sendMessage(from, {
            audio: { url: sadiya.result.downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${data.title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: data.title.length > 25 ? `${data.title.substring(0, 22)}...` : data.title,
                    body: "ꜱayura mihiranga",
                    mediaType: 1,
                    thumbnailUrl: data.thumbnail.replace('default.jpg', 'hqdefault.jpg'),
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        reply("An error occurred. Please try again.");
    }
});
