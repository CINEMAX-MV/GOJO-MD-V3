const { cmd } = require('../lib/command');
const axios = require('axios');

const API_URL = 'https://dizer-adaderana-news-api.vercel.app/news';

cmd(
  {
    pattern: 'derananews',
    alias: ['derana', 'news3'],
    react: '📑',
    desc: 'Get the latest Ada Derana headline',
    category: 'news',
    use: '.derana',
    filename: __filename,
  },
  async (conn, mek, m, { from, quoted }) => {
    try {
      const { data } = await axios.get(API_URL);
      if (!Array.isArray(data) || !data.length) throw new Error('No news items');

      const news = data[0];

      const caption = `📑 𝐃𝐄𝐑𝐀𝐍𝐀 𝐍𝐄𝐖𝐒 📑

* Title - ${news.title || 'Not available'}
* News  - ${news.description || 'Not available'}
* Date  - ${news.time || 'Not available'}
* Link  - ${news.new_url || 'Not available'}

> 𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 ᴏꜰꜰɪᴄɪᴀʟ GOJO ᴍᴅ`;

      await conn.sendMessage(
        from,
        {
          image: { url: news.image || '' },
          caption,
        },
        { quoted: mek }
      );
    } catch (err) {
      console.error('[DERANA-NEWS]', err);
      await conn.sendMessage(
        from,
        { text: '⚠️ දෝෂයක් සිදු විය. API එකෙන් දත්ත ලබා ගැනීමට නොහැකි විය!' },
        { quoted: mek }
      );
    }
  }
);
