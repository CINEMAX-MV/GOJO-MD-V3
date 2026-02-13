const { cmd } = require('../lib/command'); 
const fs = require('fs');    
const config = require('../settings'); 

cmd({
    pattern: "getpp",
    react: "🖼️",
    desc: "Sends the profile picture of a user by phone number (owner only)",
    category: "owner",
    use: ".getpp <phone number>",
    filename: __filename
},
async (conn, mek, m, context) => {
    try {
        // Extract context variables
        const {
            from,
            prefix,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        } = context;

        // Owner check
        if (!isOwner) return reply("🛑 This command is only for the bot owner!");

        // Input sanitization
        const input = args[0] || (quoted && quoted.sender?.split("@")[0]) || (m.mentionedJid && m.mentionedJid[0]?.split("@")[0]);
        if (!input || !/^\d{5,15}$/.test(input.replace(/[^0-9]/g, ""))) {
            return reply("📱 Please provide a valid phone number, mention a user, or reply to a message.\nExample: `.getpp 94763513529`");
        }

        const targetJid = input.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        let ppUrl;
        let userName = targetJid.split("@")[0];

        // Fetch profile picture
        try {
            ppUrl = await conn.profilePictureUrl(targetJid, "image");
        } catch {
            return reply("🖼️ This user has no profile picture or it cannot be accessed!");
        }

        // Get contact name
        try {
            const contact = await conn.getContact(targetJid);
            userName = contact.notify || contact.vname || userName;
        } catch {
            // No name available
        }

        // Send profile picture
        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: `📌 Profile picture of ${userName}`
        });

        // React success
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        context.reply("🛑 An error occurred while fetching the profile picture! Please try again later.");
        context.l("❌ Error in getpp:", e);
    }
});
