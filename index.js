const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, jidNormalizedUser, getAggregateVotesInPollMessage, generateForwardMessageContent, generateWAMessageFromContent, prepareWAMessageMedia, downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const P = require('pino');
const NodeCache = require('node-cache');
const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const msgRetryCounterCache = new NodeCache();
const config = require('./settings');
const { sms } = require('./lib/msg');
const { get_set } = require('./lib/set_db');
const events = require('./lib/command'); // your commands handler
const { getGroupAdmins } = require('./lib/functions');

//====================================================
// EXPRESS SERVER
app.get("/", (req, res) => res.send("📟 Gojo-Md Working successfully!"));
app.listen(port, () => console.log(`Gojo-Md Server listening on http://localhost:${port}`));

//====================================================
// HELPER
function jsonConcat(o1, o2) { for (var key in o2) o1[key] = o2[key]; return o1; }

//====================================================
// CONNECT TO WA FUNCTION
async function connectToWA() {
    const { version } = await fetchLatestBaileysVersion();
    console.log(`Using WA v${version.join('.')}`);

    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/lib/session/');
    const conn = makeWASocket({
        logger: P({ level: 'fatal' }).child({ level: 'fatal' }),
        auth: state,
        generateHighQualityLinkPreview: true,
        msgRetryCounterCache
    });

    //================================================
    // CONNECTION UPDATE
    conn.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
        if (connection === 'close') {
            if ((lastDisconnect?.error?.output?.statusCode) !== DisconnectReason.loggedOut) {
                console.log("Reconnecting...");
                connectToWA();
            } else console.log("Logged out.");
        } else if (connection === 'open') {
            console.log("Installing plugins 🔌...");
            const pluginsPath = path.join(__dirname, 'plugins');
            if (fs.existsSync(pluginsPath)) {
                fs.readdirSync(pluginsPath).filter(f => f.endsWith('.js')).forEach(file => {
                    try { require(path.join(pluginsPath, file))(conn); console.log(`✅ Loaded plugin: ${file}`); }
                    catch (err) { console.error(`⚠️ Failed plugin ${file}: ${err.message}`); }
                });
            }
            console.log("Plugins installed ✅");
            console.log("Bot connected ✅");

            await conn.sendMessage(config.OWNER_NUMBER + "@s.whatsapp.net", { text: "*👨‍💻 GOJO MD connected!*" });
        }
    });

    //================================================
    // CREDENTIALS UPDATE
    conn.ev.on('creds.update', saveCreds);

    //================================================
    // POLL HANDLER
    conn.ev.on('messages.update', async (chatUpdate) => {
        for (const { key, update } of chatUpdate) {
            if (update.pollUpdates && key.fromMe) {
                const msg = await conn.loadMessage(key.remoteJid, key.id).catch(() => null);
                if (!msg) continue;
                const pollUpdate = await getAggregateVotesInPollMessage({ message: msg, pollUpdates: update.pollUpdates });
                const cmd = pollUpdate.find(p => p.voters.length > 0)?.name;
                if (cmd) console.log("Poll command:", cmd);
            }
        }
    });

    //================================================
    // MESSAGE HANDLER
    conn.ev.on('messages.upsert', async m => {
        try {
            const mek = m.messages[0];
            if (!mek.message) return;
            const type = getContentType(mek.message);
            const from = mek.key.remoteJid;
            const sender = mek.key.fromMe ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : (mek.key.participant || from);
            let body = type === 'conversation' ? mek.message.conversation : (type === 'extendedTextMessage' ? mek.message.extendedTextMessage.text : '');

            // merge db settings
            const dbset = await get_set('all');
            Object.assign(config, dbset);

            const prefix = config.PREFIX || '.';
            const isCmd = body.startsWith(prefix);
            const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : '';
            const args = body.trim().split(/ +/).slice(1);

            //============================================
            // RUN COMMANDS
            if (isCmd) {
                const cmdObj = events.commands.find(c => c.pattern === command || (c.alias && c.alias.includes(command)));
                if (cmdObj) {
                    try { await cmdObj.function(conn, mek, sms(conn, mek), { from, prefix, args, body, sender }); }
                    catch (e) { console.error("[PLUGIN ERROR]", e); }
                }
            }

            // BODY commands
            events.commands.filter(c => c.on === 'body').forEach(c => {
                try { c.function(conn, mek, sms(conn, mek), { from, prefix, args, body, sender }); }
                catch { }
            });

        } catch (e) { console.error(e); }
    });

    return conn;
}

//====================================================
// START BOT AFTER 3s
setTimeout(connectToWA, 3000);
