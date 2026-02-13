const axios = require('axios');
const { cmd } = require('../lib/command');
const { fetchJson } = require('../lib/functions');
const config = require('../settings');

const searchCache = new Map();       // chatId -> search results
const qualityCache = new Map();      // chatId -> { poster, title, links }

/* .baiscopes <keyword> */
cmd({
    pattern: 'baiscopes',
    react: '🔎',
    category: 'movie',
    desc: 'Baiscopes.lk movie search',
    use: '.baiscopes <keyword>',
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    if (!q) return reply('*උදාහරණයක් ලෙස “.baiscopes fast x” වැනිවක් ටයිප් කරන්න*');
    const res = await fetchJson(`https://darksadas-yt-baiscope-search.vercel.app/?query=${encodeURIComponent(q)}`);
    if (!res?.data?.length) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return conn.sendMessage(from, { text: '*ප්‍රතිඵලයක් නැහැ ❌*' }, { quoted: mek });
    }

    searchCache.set(from, res.data);
    let txt = `*_📽️ BAISCOPES MOVIE SEARCH RESULT 🎬_* \n\n*🔍 සෙවුම:* ${q}\n\n`;
    res.data.forEach((v, i) => txt += `${i + 1}. ${v.title}\n`);
    txt += '\n👉 *කරුණාකර* `.bdl <number>` *ලෙස යොමු කරන්න*';

    await conn.sendMessage(from, { text: txt, footer: config.FOOTER }, { quoted: mek });
});

/* .bdl <number> */
cmd({
    pattern: 'bdl',
    react: '🎥',
    desc: 'movie downloader',
    use: '.bdl <number>',
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    const idx = parseInt(q.trim()) - 1;
    const list = searchCache.get(from);
    if (!list || isNaN(idx) || !list[idx]) return reply('*අවලංගු අංකයක්!*');

    const { link: infoUrl, img: poster } = list[idx];
    const info = await fetchJson(`https://darksadas-yt-baiscope-info.vercel.app/?url=${infoUrl}&apikey=pramashi`);
    if (!info?.data) return reply('*තොරතුරු ලබාගැනීමේදී දෝෂයක්!*');

    const d = info.data;
    qualityCache.set(from, { poster, title: d.title, links: d.dl_links });

    const caption = [
        `*🎬 චිත්‍රපටය:* _${d.title || 'N/A'}_`,
        `*📆 නිකුත් වීමේ දිනය:* _${d.date || 'N/A'}_`,
        `*⭐ IMDb:* _${d.imdb || 'N/A'}_`,
        `*🕐 ධාවන කාලය:* _${d.runtime || 'N/A'}_`,
        `*🈂️ උපසිරැසි කලේ:* _${d.subtitle_author || 'N/A'}_`,
        `*🎭 කාණ්ඩ:* ${Array.isArray(d.genres) ? d.genres.join(', ') : 'N/A'}`
    ].join('\n');

    let txt = `${caption}\n\n*📥 ලැබිය හැකි ගුණාත්මතාවන්:* \n`;
    d.dl_links.forEach((v, i) => txt += `${i + 1}. ${v.quality} - ${v.size}\n`);
    txt += '\n👉 *පහලින් තෝරන්න:* `.cdl <number>`';

    await conn.sendMessage(from, {
        image: { url: poster.replace('-150x150', '') },
        caption: txt,
        footer: config.FOOTER
    }, { quoted: mek });
});

/* .cdl <number> */
cmd({
    pattern: 'cdl',
    react: '⬇️',
    dontAddCommandList: true,
    use: '.cdl <number>',
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    const idx = parseInt(q.trim()) - 1;
    const cache = qualityCache.get(from);
    if (!cache || isNaN(idx) || !cache.links[idx]) return reply('*අවලංගු අංකය!*');

    const { poster, title, links } = cache;
    const driveUrl = links[idx].link;

    try {
        const dl = await fetchJson(`https://darksadas-yt-baiscope-dl.vercel.app/?url=${driveUrl}&apikey=pramashi`);
        const gDrive = dl?.data?.dl_link?.trim();
        if (!gDrive?.startsWith('https://drive.baiscopeslk')) return reply('*අවලංගු බාගත කිරීමේ ලිංකුවකි!*');

        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
        await conn.sendMessage(from, { text: '*📤 චිත්‍රපටය යවමින් පවතියි...*' });

        await conn.sendMessage(config.JID || from, {
            document: { url: gDrive },
            caption: `*🎬 නම:* ${title}\n`,
            mimetype: 'video/mp4',
            jpegThumbnail: await (await axios.get(poster, { responseType: 'arraybuffer' })).data,
            fileName: `${title}.mp4`
        });

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
        await conn.sendMessage(from, { text: '*🎉 චිත්‍රපටය සාර්ථකව එවිනි!*' }, { quoted: mek });
        qualityCache.delete(from);
    } catch (e) {
        console.error(e);
        reply('*🚨 දෝෂයක් ඇතිවිය, නැවත උත්සාහ කරන්න!*');
    }
});