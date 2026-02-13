const { cmd, commands } = require('../lib/command');
const { ytsearch, ytmp3, ytmp4 } = require('@dark-yasiya/yt-dl.js');
const scraper = require("../lib/scraper");
const axios = require('axios');
const fetch = require('node-fetch');
const { fetchJson, getBuffer } = require('../lib/functions');
const { lookup } = require('mime-types');
const fs = require('fs');
const path = require('path');


cmd({
    pattern: "apk",
    desc: "Downloads Apk",
    use: ".apk <app_name>",
    react: "📥",
    category: "download",
    filename: __filename
},
    async (conn, mek, m, { from, q, reply }) => {
        const appId = q.trim();
    if (!appId) return reply(`*Please provide an app name 📍*`);

    reply("*Downloading Your Apk...📥*");
          
    try {
        const appInfo = await scraper.aptoideDl(appId);
        const buff = await getBuffer(appInfo.link);
        
        if (!buff || !appInfo.appname) {
            return await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        }
        
        await conn.sendMessage(
            from,
            { document: buff, 
             caption: `> *© Upload By GOJO MD*`, 
             mimetype: "application/vnd.android.package-archive", 
             filename: `${appInfo.appname}.apk`,
           }, { quoted: mek }
        );
        
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
        reply("*Upload Successful ✅*");
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`Error: ${e.message}`);
    }
});
