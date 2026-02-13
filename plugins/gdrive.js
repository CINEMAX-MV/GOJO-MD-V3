const { cmd } = require('../lib/command');
const fetch = require('node-fetch');

cmd({
  pattern: 'gdrive',
  alias: ['drive'],
  desc: 'Download Google Drive files by ID or full link',
  category: 'download',
  react: '📂',
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply('❌ *Link එකක් හෝ file ID එකක් දෙන්න!*\nඋදා: `.gdrive https://drive.google.com/file/d/FILE_ID/view?usp=sharing`');

    // 🔍 Extract Google Drive File ID
    const match = q.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]{10,})/);
    if (!match) return reply('❌ Valid Google Drive link එකක් නොවෙයි.');

    const fileId = match[1];
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // 🌐 Fetch the file
    const res = await fetch(url);

    // 🛑 Check if the file is available
    const contentType = res.headers.get('content-type');
    if (!res.ok || contentType.includes('text/html')) {
      return reply('⚠️ Download කරන්න බෑ. File එක *public* කරලා තියෙනවද බලන්න.');
    }

    // 📄 Extract file name from headers or use default
    const contentDisposition = res.headers.get('content-disposition') || '';
    const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
    const filename = filenameMatch ? filenameMatch[1] : `GDrive-File.bin`;

    const buffer = await res.buffer();

    // 📤 Send the file
    await conn.sendMessage(from, {
      document: buffer,
      fileName: filename,
      mimetype: contentType,
    }, { quoted: mek });

  } catch (e) {
    console.error('[GDRIVE ERROR]', e);
    reply('❌ File එක download කරන්න ගියාම වැරදි එනවා. අලුත් link එකක් check කරන්න.');
  }
});
