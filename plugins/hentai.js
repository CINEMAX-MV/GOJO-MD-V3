const { cmd } = require('../lib/command');
const { fetchJson } = require('../lib/functions');

cmd({
    pattern: "hentai",
    react: '💓',
    category: "download",
    desc: "Search and download movies from PixelDrain",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
// Fetch api
const searchVid = `https://apis-keith.vercel.app/dl/hentaivid`
let response = await fetchJson(searchVid);

//Select first video
const selectVid = response.result[0];

let cap = `
> *Title :* ${selectVid.title}
> *Link :* ${selectVid.link}
> *Category :* ${selectVid.category}
> *Share_Count :* ${selectVid.share_count}
> *Views_Count :* ${selectVid.views_count}
`
await conn.sendMessage(
    from, 
    { 
        video: {
            url: selectVid.media.video_url
        },
        caption: cap
    },
{quoted: mek});

 } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
