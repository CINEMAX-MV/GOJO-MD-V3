// commands/movis.js – GOJO-MD watermark + space-fix  (no size-limit)

const { cmd }   = require('../lib/command');
const { fetchJson } = require('../lib/functions');

const API = 'https://api-vishwa.vercel.app';
const WM  = '🔰 *GOJO-MD* 🔰';          // watermark text

cmd({
  pattern : /^(mv|movis)$/i,           // .mv  හෝ .movis
  alias   : ['smovie','sinhaladub','mv'],
  react   : '📑',
  category: 'movie',
  desc    : 'Search SinhalaDub movies and download',
  filename: __filename
}, async (conn, m, mek, { from, isOwner, q, reply }) => {

  if (!q)       return reply('*.mv <title>* ලෙස දාන්න.');
  if (!isOwner) return reply('Owner only.');

  /* ─── 1. search  ─────────────────────────────────────── */
  let { data:list=[] } =
      await fetchJson(`${API}/sinhaladub?q=${encodeURIComponent(q)}`);

  // 2nd-try: remove spaces → “dead pool” ⇒ “deadpool”
  if (!list.length && q.includes(' ')) {
    const alt = q.replace(/\s+/g,'');
    ({ data:list=[] } =
      await fetchJson(`${API}/sinhaladub?q=${encodeURIComponent(alt)}`));
  }

  if (!list.length) return reply('No results.');

  const movies = list.slice(0,10);
  const searchMsg = await conn.sendMessage(from,{
    image:{url:movies[0].image},
    caption:`📽️ *${q}*\n\n`+
            movies.map((v,i)=>`*${i+1}.* ${v.title}`).join('\n')+
            `\n\n🔢 1-${movies.length}\n\n${WM}`
  },{quoted:mek});

  /* ─── 2. pick movie ───────────────────────────────────── */
  const pick = await waitNumber(conn,from,searchMsg.key.id,movies.length);
  const sel  = movies[pick-1];

  /* ─── 3. details / link list ─────────────────────────── */
  const { data:info={} } =
      await fetchJson(`${API}/sinhaladub-info?url=${encodeURIComponent(sel.link)}`);
  const links = info.links || [];
  if (!links.length) return reply('Links empty.');

  const qualMsg = await conn.sendMessage(from,{
    image:{url:sel.image},
    caption:`🎥 *${info.title}*\n\n`+
            links.map((l,i)=>
              `*${i+1}.* ${l.quality} (${l.fileSize})`).join('\n')+
            `\n\n🔢 pick\n\n${WM}`
  },{quoted:searchMsg});

  /* ─── 4. pick quality & send ─────────────────────────── */
  const qPick = await waitNumber(conn,from,qualMsg.key.id,links.length);
  const link  = links[qPick-1];

  await conn.sendMessage(from,{react:{text:'⬇️',key:qualMsg.key}});

  await conn.sendMessage(from,{
    document : { url: link.link },
    fileName : `${info.title}-${link.quality}-GOJO-MD.mp4`,
    mimetype : 'video/mp4',
    caption  : `🎬 *${info.title} – ${link.quality}*\n\n${WM}`
  },{quoted:qualMsg});

  await conn.sendMessage(from,{react:{text:'✅',key:qualMsg.key}});
});

/* helper – wait for numeric reply to the given stanza */
function waitNumber(conn,jid,quotedID,max){
  return new Promise(res=>{
    const h = ({ messages })=>{
      const m = messages[0];
      if (!m || m.key.remoteJid !== jid) return;

      const txt = m.message?.conversation ||
                  m.message?.extendedTextMessage?.text || '';
      const isReply =
        m.message?.extendedTextMessage?.contextInfo?.stanzaId === quotedID;
      const n = parseInt(txt.trim());

      if (isReply && n>0 && n<=max){
        conn.ev.off('messages.upsert',h);
        res(n);
      }
    };
    conn.ev.on('messages.upsert',h);
  });
}
