// commands/movie.js – brand‑tagged result card version
// Requirements: axios, node-cache

const l = console.log;
const config = require('../settings');
const { cmd } = require('../lib/command');
const axios = require('axios');
const NodeCache = require('node-cache');

const searchCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// WhatsApp document-card එකේ දිස්වන brand watermark එක
const BRAND = '✫☘𝐆𝐎𝐉𝐎 𝐌𝐎𝐕𝐈𝐄 𝐇𝐎𝐌𝐄☢️☘';

cmd(
  {
    pattern: 'movie',
    react: '🎬',
    desc: 'Search and download Movies/TV Series',
    category: 'media',
    filename: __filename,
  },
  async (conn, mek, m, { from, q }) => {
    // User කියලා search term එකක් දුන්නෙ නැත්නම් usage info එක show කරනවා
    if (!q) {
      await conn.sendMessage(
        from,
        {
          text:
            '*🎬 Movie / TV Series Search*\n\n' +
            '📋 Usage: .movie <search term>\n' +
            '📝 Example: .movie Breaking Bad\n\n' +
            "💡 Reply 'done' to stop the process",
        },
        { quoted: mek }
      );
      return;
    }

    try {
      // ────── 1. Search with cache ──────
      const cacheKey = `film_${q.toLowerCase()}`;
      let data = searchCache.get(cacheKey);

      if (!data) {
        const url = `https://apis.davidcyriltech.my.id/movies/search?query=${encodeURIComponent(q)}`;
        let retries = 3;

        while (retries--) {
          try {
            const r = await axios.get(url, { timeout: 10000 });
            data = r.data;
            break;
          } catch (e) {
            if (!retries) throw new Error('Failed to retrieve data');
            await new Promise((r) => setTimeout(r, 1000));
          }
        }

        if (!data?.status || !data.results?.length)
          throw new Error('No results found.');

        searchCache.set(cacheKey, data);
      }

      // results array එක process කරනවා
      const films = data.results.map((f, i) => ({
        n: i + 1,
        title: f.title,
        imdb: f.imdb,
        year: f.year,
        link: f.link,
        image: f.image,
      }));

      // results text එක build කරනවා
      let txt = '*🎬 SEARCH RESULTS*\n\n';
      for (const f of films) {
        txt += `🎥 ${f.n}. *${f.title}*\n   ⭐ IMDB: ${f.imdb}\n   📅 Year: ${f.year}\n\n`;
      }
      txt += '🔢 Select number • "done" to cancel';

      // first message එක send කරනවා (image සහ caption සමඟ)
      const listMsg = await conn.sendMessage(
        from,
        { image: { url: films[0].image }, caption: txt },
        { quoted: mek }
      );

      const waiting = new Map();

      // ────── Message handler ──────
      const handler = async ({ messages }) => {
        const msg = messages?.[0];
        if (!msg?.message?.extendedTextMessage) return;
        const body = msg.message.extendedTextMessage.text.trim();
        const replyTo = msg.message.extendedTextMessage.contextInfo?.stanzaId;

        // Cancel command එක handle කරනවා
        if (body.toLowerCase() === 'done') {
          conn.ev.off('messages.upsert', handler);
          waiting.clear();
          await conn.sendMessage(from, { text: '✅ Cancelled.' }, { quoted: msg });
          return;
        }

        // First step: user film එක තෝරනවා
        if (replyTo === listMsg.key.id) {
          const film = films.find((f) => f.n === parseInt(body));
          if (!film) {
            await conn.sendMessage(from, { text: '❌ Invalid number.' }, { quoted: msg });
            return;
          }

          // download links fetch කරන API එකට request කරනවා
          const lUrl = `https://apis.davidcyriltech.my.id/movies/download?url=${encodeURIComponent(film.link)}`;
          let dl;
          let r = 3;
          while (r--) {
            try {
              dl = (await axios.get(lUrl, { timeout: 10000 })).data;
              if (!dl.status) throw new Error();
              break;
            } catch {
              if (!r) {
                await conn.sendMessage(from, { text: '❌ Fetch failed.' }, { quoted: msg });
                return;
              }
              await new Promise((d) => setTimeout(d, 1000));
            }
          }

          const links = dl.movie.download_links;

          // Video quality pick list එක generate කරනවා
          const picks = [];
          const sd = links.find((x) => x.quality === 'SD 480p' && x.direct_download);
          const hd =
            links.find((x) => x.quality === 'HD 720p' && x.direct_download) ||
            links.find((x) => x.quality === 'FHD 1080p' && x.direct_download);

          if (sd) picks.push({ n: 1, q: 'SD', ...sd });
          if (hd) picks.push({ n: 2, q: 'HD', ...hd });

          if (!picks.length) {
            await conn.sendMessage(from, { text: '❌ No links.' }, { quoted: msg });
            return;
          }

          // quality select කරන්න text එක build කරනවා
          let qTxt = `*🎬 ${film.title}*\n\n📥 Choose Quality:\n\n`;
          for (const p of picks) qTxt += `${p.n}. *${p.q}* (${p.size})\n`;
          qTxt += '\n🔢 Reply number • "done" to cancel';

          const qMsg = await conn.sendMessage(
            from,
            { image: { url: dl.movie.thumbnail || film.image }, caption: qTxt },
            { quoted: msg }
          );

          waiting.set(qMsg.key.id, { film, picks });
          return;
        }

        // Second step: user quality එක තෝරනවා
        if (waiting.has(replyTo)) {
          const { film, picks } = waiting.get(replyTo);
          const pick = picks.find((p) => p.n === parseInt(body));
          if (!pick) {
            await conn.sendMessage(from, { text: '❌ Wrong quality.' }, { quoted: msg });
            return;
          }

          // file size check කරනවා (2GBට වැඩි නම් direct link share කරනවා)
          const sz = pick.size.toLowerCase();
          const gb = sz.includes('gb') ? parseFloat(sz) : parseFloat(sz) / 1024;
          if (gb > 2) {
            await conn.sendMessage(
              from,
              { text: `⚠️ Too large. Direct link:\n${pick.direct_download}` },
              { quoted: msg }
            );
            return;
          }

          // safe filename එක generate කරනවා
          const safe = film.title.replace(/[\\/:*?"<>|]/g, '');
          const fname = `${BRAND} • ${safe} • ${pick.q}.mp4`;

          try {
            await conn.sendMessage(
              from,
              {
                document: { url: pick.direct_download },
                mimetype: 'video/mp4',
                fileName: fname,
                caption: `🎬 *${film.title}*\n📊 Size: ${pick.size}\n\n🔥 ${BRAND}`,
              },
              { quoted: msg }
            );
            await conn.sendMessage(from, { react: { text: '✅', key: msg.key } });
          } catch {
            await conn.sendMessage(
              from,
              { text: `❌ Failed. Direct link:\n${pick.direct_download}` },
              { quoted: msg }
            );
          }
        }
      };

      // WhatsApp messages.upsert event එකට handler එක register කරනවා
      conn.ev.on('messages.upsert', handler);
    } catch (e) {
      console.error(e);
      await conn.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: mek });
    }
  }
);
