// plugins/jid.js

module.exports = {
  name: "jid",
  description: "Show full JID information including names and types",
  async execute(msg, sock) {
    try {
      const remoteJid = msg.key.remoteJid; // group or user chat
      const senderJid = msg.key.participant || remoteJid;
      const botJid = sock.user.id;
      const isGroup = remoteJid.endsWith("@g.us");

      // Fetch group metadata if group
      let groupName = "N/A";
      let senderName = "N/A";

      if (isGroup) {
        const metadata = await sock.groupMetadata(remoteJid);
        groupName = metadata.subject || "Unnamed Group";

        const sender = metadata.participants.find(p => p.id === senderJid);
        senderName = sender?.admin ? `👑 ${sender.id}` : sender?.id || senderJid;
      } else {
        const contact = await sock.onWhatsApp(senderJid);
        senderName = contact?.[0]?.notify || senderJid;
      }

      const fullText = `🔍 *JID FULL DETAILS*

👥 *Group Name:* ${isGroup ? groupName : "❌ Not a Group"}
👥 *Group JID:* ${isGroup ? remoteJid : "❌"}

👤 *Sender Name:* ${senderName}
👤 *Sender JID:* ${senderJid}

🤖 *Bot JID:* ${botJid}

💬 *Chat Type:* ${isGroup ? "Group" : "Private"}
🕐 *Message ID:* ${msg.key.id}
`;

      await sock.sendMessage(remoteJid, {
        text: fullText
      }, { quoted: msg });

    } catch (err) {
      console.error("Error in .jid command:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Error getting JID info!"
      }, { quoted: msg });
    }
  }
};
