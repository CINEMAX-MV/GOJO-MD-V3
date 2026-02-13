const { cmd } = require("../lib/command");
const config = require('../settings'); 
cmd( { pattern: "ginfo", alias: ["groupinfo", "gcinfo"], category: "group", desc: "Show group information with photo", filename: __filename, }, async (client, message) => { if (!message.isGroup) { const reply = (text) => client.sendMessage(message.chat, { text }, { quoted: message }); return await reply("👥 This command works only in groups."); }

const reply = (text) =>
  message.reply
    ? message.reply(text)
    : client.sendMessage(message.chat, { text }, { quoted: message });

let metadata;
try {
  metadata = await client.groupMetadata(message.chat);
} catch (e) {
  return await reply("❌ Unable to fetch group metadata.");
}

const admins = metadata.participants.filter((p) => p.admin !== null);
const owner =
  metadata.owner ||
  metadata.participants.find((p) => p.admin === "superadmin")?.id;
const description = metadata.desc || "📝 No description set.";

let pp;
try {
  pp = await client.profilePictureUrl(message.chat, "image");
} catch (e) {
  pp = "https://telegra.ph/file/9e58d8c3d8ed6a22e2c42.jpg"; // fallback
}

const groupInfo = `

📛 Group Name: ${metadata.subject} 🆔 Group ID: ${metadata.id} 👤 Owner: ${owner ? "@" + owner.split("@")[0] : "Unknown"} 👥 Members: ${metadata.participants.length} 🛡️ Admins: ${admins.length} 📝 Description: ${description} `.trim();

await client.sendMessage(
  message.chat,
  {
    image: { url: pp },
    caption: groupInfo,
    mentions: owner ? [owner] : [],
  },
  { quoted: message }
);

} );

