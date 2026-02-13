//---------- IMPORTS ----------
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidNormalizedUser,
  getAggregateVotesInPollMessage,
  getContentType
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const path = require('path');
const P = require('pino');
const NodeCache = require('node-cache');

const config = require('./settings'); // has PREFIX, OWNER_NUMBER etc
const { sms } = require('./lib/msg');
const { get_set } = require('./lib/set_db');
const events = require('./lib/command'); // core commands loader

const app = require('express')();
const port = process.env.PORT || 8000;
const msgRetryCounterCache = new NodeCache();

//---------- EXPRESS SERVER ----------
app.get("/", (req, res) => res.send("📟 GOJO‑Md Bot Running!"));
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

//---------- CONNECT TO WA ----------
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

  // reconnect & plugin load
  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      if ((lastDisconnect.error?.output?.statusCode) !== DisconnectReason.loggedOut) {
        console.log("Reconnecting...");
        connectToWA();
      } else console.log("Logged out!");
    }
    else if (connection === 'open') {
      console.log('Installing plugins 🔌...');

      const folder = path.join(__dirname, 'plugins');
      if (fs.existsSync(folder)) {
        fs.readdirSync(folder).filter(f => f.endsWith('.js')).forEach(file => {
          try {
            const plugin = require(path.join(folder, file));
            if (typeof plugin === 'function') plugin(conn);
            console.log(`✔️ Loaded: ${file}`);
          } catch (e) {
            console.error(`❌ Plugin failed: ${file}`, e.message);
          }
        });
      }
      console.log('Plugins installed ✅');
      console.log('Bot connected ✅');

      await conn.sendMessage(config.OWNER_NUMBER + "@s.whatsapp.net", {
        text: "*👨‍💻 GOJO‑Md Connected Successfully!*"
      });
    }
  });

  conn.ev.on('creds.update', saveCreds);

  // poll updates
  conn.ev.on('messages.update', async (chatUpdate) => {
    for (const { key, update } of chatUpdate) {
      if (update.pollUpdates && key.fromMe) {
        const msg = await conn.loadMessage(key.remoteJid, key.id).catch(() => null);
        if (!msg) continue;
        const pollUpdate = await getAggregateVotesInPollMessage({ message: msg, pollUpdates: update.pollUpdates });
        const cmd = pollUpdate.find(v => v.voters?.length > 0)?.name;
        if (cmd) console.log("Poll Cmd:", cmd);
      }
    }
  });

  // message handler
  conn.ev.on('messages.upsert', async data => {
    try {
      const mek = data.messages[0];
      if (!mek.message) return;
      
      const type = getContentType(mek.message);
      const from = mek.key.remoteJid;
      const sender = mek.key.fromMe ? conn.user.id.split(':')[0]+'@s.whatsapp.net' : (mek.key.participant || from);

      let body = "";
      if (type === 'conversation') body = mek.message.conversation;
      else if (type === 'extendedTextMessage') body = mek.message.extendedTextMessage.text;

      // dynamic config
      const dbset = await get_set('all');
      Object.assign(config, dbset);

      const prefix = config.PREFIX || '.';
      const isCmd = body.startsWith(prefix);
      const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : '';
      const args = body.trim().split(/ +/).slice(1);

      // execute commands
      if (isCmd) {
        const cmdObj = events.commands.find(c => c.pattern === command || (c.alias && c.alias.includes(command)));
        if (cmdObj) {
          try { await cmdObj.function(conn, mek, sms(conn, mek), { from, prefix, args, body, sender }); }
          catch (e) { console.error("[COMMAND ERROR]", e); }
        }
      }
      
      // body listeners
      events.commands.filter(c => c.on === 'body').forEach(c => {
        try { c.function(conn, mek, sms(conn, mek), { from, prefix, args, body, sender }); }
        catch {}
      });

    } catch (e) { console.error(e); }
  });

  return conn;
}

// delay start
setTimeout(connectToWA, 5000);
