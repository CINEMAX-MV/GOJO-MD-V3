// plugins/youtube.js
// compact YT-search command – fixed brackets & error-handling

const { cmd } = require('../lib/command');
const yts = require('yt-search');

cmd(
  {
    pattern: 'youtube',
    alias: ['ytsearch'],
    use: '.yts gojo md whatsapp bot',
    react: '🎁',
    desc: 'Search and get details from YouTube.',
    category: 'search',
    filename: __filename,
  },

  async (
    conn,
    mek,
    m,
    { from, q, sender, reply }
  ) => {
    try {
      if (!q) return reply('*Please give me words to search*');

      const res = await yts(q);
      if (!res.videos.length) return reply('*No results found*');

      const txt = res.videos
        .slice(0, 15) // first 15 hits
        .map(
          v =>
            `*🌸ᴛɪᴛʟᴇ* ${v.title}\n*🔗ᴜʀʟ* ${v.url}\n*⌛ᴅᴜʀᴀᴛɪᴏɴ* ${v.timestamp}\n*👀ᴠɪᴇᴡꜱ* ${v.views}\n*📤ᴜᴘʟᴏᴀᴅ* ${v.ago}`
        )
        .join('\n\n');

      await conn.sendMessage(
        from,
        {
          text: txt,
          contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterName: 'Gojo-ᴍᴅ ✻',
              serverMessageId: 999,
            },
          },
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error(e);
      reply('*Error:* ' + e.message);
    }
  }
);
