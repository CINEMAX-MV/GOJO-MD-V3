const { File } = require('megajs');
const fs = require('fs');
const fileType = require("file-type");
const { igdl } = require('ruhend-scraper');
const googleTTS = require("google-tts-api");
const axios = require('axios');
const config = require('../settings');
var imgmsg = '*© ᴄʀᴇᴀᴛᴇᴅ ʙy sayura · · ·*'
var descg = 'Gojo-ᴍᴅ'
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson
} = require('../lib/functions');
const {cmd , commands} = require('../lib/command')
const os = require("os")
const path = require('path');
const { tmpdir } = require('os');
const fetch = require('node-fetch');
const Crypto = require("crypto");
const ffmpeg = require('fluent-ffmpeg');

// Convert video to WebP format
async function videoToWebp(videoBuffer) {
  const webpFilePath = path.join(tmpdir(), Crypto.randomBytes(6).readUIntLE(0, 6).toString(36) + ".webp");
  const mp4FilePath = path.join(tmpdir(), Crypto.randomBytes(6).readUIntLE(0, 6).toString(36) + ".mp4");

  // Write the video buffer to a temporary file
  fs.writeFileSync(mp4FilePath, videoBuffer);

  // Convert the video to WebP using ffmpeg
  await new Promise((resolve, reject) => {
    ffmpeg(mp4FilePath)
      .on("error", reject)
      .on("end", () => resolve(true))
      .addOutputOptions([
        "-vcodec", 'libwebp', 
        "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
        "-loop", '0', 
        "-ss", "00:00:00", 
        '-t', "00:00:05", 
        "-preset", "default", 
        '-an', 
        "-vsync", '0'
      ])
      .toFormat("webp")
      .save(webpFilePath);
  });

  // Read the WebP file into a buffer, delete temporary files
  const webpBuffer = fs.readFileSync(webpFilePath);
  fs.unlinkSync(webpFilePath);
  fs.unlinkSync(mp4FilePath);

  return webpBuffer;
}

function toAudio(inputFile, outputFile) {
  return ffmpeg(inputFile, [
    "-vn", // Disable video
    "-ac", "2", // Set audio channels to 2
    "-b:a", "128k", // Set audio bitrate to 128 kbps
    "-ar", "44100", // Set audio sample rate to 44100 Hz
    "-f", "mp3" // Set output format to mp3
  ], outputFile, "mp3");
}

function toPTT(inputFile, outputFile) {
  return ffmpeg(inputFile, [
    "-vn", // Disable video
    "-c:a", "libopus", // Set audio codec to libopus
    "-b:a", "128k", // Set audio bitrate to 128 kbps
    "-vbr", "on", // Enable variable bitrate
    "-compression_level", "10" // Set compression level to 10
  ], outputFile, "opus");
}

function toVideo(inputFile, outputFile) {
  return ffmpeg(inputFile, [
    "-c:v", "libx264", // Set video codec to libx264
    "-c:a", "aac", // Set audio codec to AAC
    "-ab", "128k", // Set audio bitrate to 128 kbps
    "-ar", "44100", // Set audio sample rate to 44100 Hz
    "-crf", "32", // Set Constant Rate Factor to 32 (lower = higher quality)
    "-preset", "slow" // Use slow preset for better compression
  ], outputFile, "mp4");
}



const commandConfig = {
  pattern: "toimg",
  react: '🔮',
  alias: ['photo', "stic"],
  desc: "Convert sticker to image",
  category: "convert",
  use: ".sticker <Reply to sticker>",
  filename: __filename
};

cmd(commandConfig, async (client, message, chat, {
  from,
  quoted,
  reply
}) => {
  try {
    const isStickerMessage = quoted ? quoted.type === "stickerMessage" : false;

    if (isStickerMessage) {
      const randomFileName = getRandom('');
      const downloadedFile = await quoted.download(randomFileName);
      const fileInfo = await fileType.fromBuffer(downloadedFile);

      await fs.promises.writeFile('./' + fileInfo.ext, downloadedFile);

      const options = {
        quoted: message
      };

      await client.sendMessage(from, {
        image: fs.readFileSync('./' + fileInfo.ext),
        caption: "> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ ꜱayura mhiranga· · · 💭"
      }, options);
      
      fs.unlinkSync('./' + fileInfo.ext);
    } else {
      return await reply("Please reply to a sticker to convert it into an image.");
    }
  } catch (error) {
    reply("*Error !!*");
    console.error(error);
  }
});

cmd({
  pattern: "trt",
  alias: "translate",
  desc: "Translate text between languages",
  react: '💱',
  use: ".trt <language code> <text>",
  category: "convert",
  filename: __filename
}, async (client, message, chat, { from, q, reply }) => {
  try {
    // Split the input text into language code and the text to be translated
    const input = q.split(" ");

    if (input.length < 2) {
      return reply("❗ Please provide a language code and text. Usage: .trt <language code> <text>");
    }

    const languageCode = input[0]; // The first part is the language code
    const textToTranslate = input.slice(1).join(" "); // The rest is the text to be translated

    // Construct the translation API URL
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|${languageCode}`;

    // Get the translation response from the API
    const response = await axios.get(apiUrl);
    const translatedText = response.data.responseData.translatedText;

    // Format the translation result
    const translationInfo = `
🌍 *Translation* 🌍

🔤 *Original*: ${textToTranslate}
🔠 *Translated*: ${translatedText}
🌐 *Language*: ${languageCode.toUpperCase()}
`;

    return reply(translationInfo);
  } catch (error) {
    console.error(error);
    return reply("⚠️ An error occurred while translating the text. Please try again later.");
  }
});


cmd({
    pattern: 'sticker',
    react: '🤹‍♀️',
    alias: ['s', 'stic'],
    desc: descg,
    category: 'convert',
    use: '.sticker <Reply to image>',
    filename: __filename
}, async (conn, mek, m, { from, reply, isCmd, command, args, q, isGroup, pushname }) => {
    try {
        const isQuotedImage = m.quoted && (m.quoted.type === 'imageMessage' || (m.quoted.type === 'viewOnceMessage' && m.quoted.msg.type === 'imageMessage'))
        const isQuotedSticker = m.quoted && m.quoted.type === 'stickerMessage'

        if ((m.type === 'imageMessage') || isQuotedImage) {
            const nameJpg = getRandom('.jpg')
            const imageBuffer = isQuotedImage ? await m.quoted.download() : await m.download()
            await require('fs').promises.writeFile(nameJpg, imageBuffer)

            let sticker = new Sticker(nameJpg, {
                pack: pushname, // The pack name
                author: 'sayura mihiranga ', // The author name
                type: q.includes('--crop') || q.includes('-c') ? StickerTypes.CROPPED : StickerTypes.FULL,
                categories: ['🤩', '🎉'], // The sticker category
                id: '12345', // The sticker id
                quality: 75, // The quality of the output file
                background: 'transparent', // The sticker background color (only for full stickers)
            });

            const buffer = await sticker.toBuffer()
            return conn.sendMessage(from, { sticker: buffer }, { quoted: mek })
        } else if (isQuotedSticker) {
            const nameWebp = getRandom('.webp')
            const stickerBuffer = await m.quoted.download()
            await require('fs').promises.writeFile(nameWebp, stickerBuffer)

            let sticker = new Sticker(nameWebp, {
                pack: pushname, // The pack name
                author: 'Sayura mihiranga ', // The author name
                type: q.includes('--crop') || q.includes('-c') ? StickerTypes.CROPPED : StickerTypes.FULL,
                categories: ['🤩', '🎉'], // The sticker category
                id: '12345', // The sticker id
                quality: 75, // The quality of the output file
                background: 'transparent', // The sticker background color (only for full stickers)
            });

            const buffer = await sticker.toBuffer();
            return conn.sendMessage(from, { sticker: buffer }, { quoted: mek })
        } else {
            return await reply(imgmsg)
        }
    } catch (e) {
        reply('Error !!')
        console.error(e)
    }
})

cmd({
    pattern: "tts",
    desc: "download songs",
    category: "download",
    react: "👧",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if(!q) return reply("Need some text.")
    const url = googleTTS.getAudioUrl(q, {
  lang: 'hi-IN',
  slow: false,
  host: 'https://translate.google.com',
})
await conn.sendMessage(from, { audio: { url: url }, mimetype: 'audio/mpeg', ptt: true }, { quoted: mek })
    }catch(a){
reply(`${a}`)
}
})


cmd({
  'pattern': "tempmail",
  'desc': "Generate a temporary email address.",
  'use': ".tempmail",
  'category': "convert",
  'react': '✉️',
  'filename': __filename
}, async (_0x34a6bc, _0x3fc5d9, _0x4a988e, {
  from: _0x3b5a0f,
  quoted: _0x448fec,
  isCmd: _0x5fb88c,
  command: _0x59962d,
  isGroup: _0x5dc6dc,
  sender: _0x2dfb14,
  senderNumber: _0x42ca9a,
  reply: _0x56d575
}) => {
  try {
    const _0x521c35 = await axios.get("https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1");
    const _0x47a37b = _0x521c35.data;
    if (!_0x47a37b || _0x47a37b.length === 0x0) {
      return _0x56d575("Error: Unable to generate a temporary email. Please try again later.");
    }
    const _0x49b85e = _0x47a37b[0x0];
    await _0x34a6bc.sendMessage(_0x3b5a0f, {
      'text': "✉️ *Temporary Email Generated*\n\n📧 Email: " + _0x49b85e,
      'footer': "test"
    }, {
      'quoted': _0x3fc5d9
    });
  } catch (_0x39db87) {
    console.error(_0x39db87);
    _0x56d575("Error: " + _0x39db87.message);
  }
});

cmd({
  'pattern': "npm",
  'desc': "Search for a package on npm.",
  'react': '📦',
  'use': ".npm < name >",
  'category': "convert",
  'filename': __filename
}, async (_0x4db23e, _0x392fee, _0x249a22, {
  from: _0x46d0de,
  args: _0x27fc95,
  reply: _0x2a223a
}) => {
  if (!_0x27fc95.length) {
    return _0x2a223a("Please provide the name of the npm package you want to search for. Example: !npm express");
  }
  const _0x312942 = _0x27fc95.join(" ");
  const _0x475c9d = "https://registry.npmjs.org/" + encodeURIComponent(_0x312942);
  try {
    let _0xa476f0 = await fetch(_0x475c9d);
    if (!_0xa476f0.ok) {
      throw new Error("Package not found or an error occurred.");
    }
    let _0x1d0256 = await _0xa476f0.json();
    const _0x2cc6e2 = _0x1d0256['dist-tags'].latest;
    const _0x3565c7 = _0x1d0256.description || "No description available.";
    const _0x12dc53 = "https://www.npmjs.com/package/" + _0x312942;
    const _0x166a06 = _0x1d0256.license || "Unknown";
    const _0x5daed7 = _0x1d0256.repository ? _0x1d0256.repository.url || "Not available" : "Not available";
    let _0x2d4d5e = "\n*ＮＰＭ ＳＥＡＲＣＨ ツ*\n\n\n*🔰Npm package :* " + _0x312942 + "\n\n*📄Description :* " + _0x3565c7 + "\n\n*⏸️ Last version :* " + _0x2cc6e2 + "\n\n*🪪 License :* " + _0x166a06 + "\n\n*🪩Repostory :* " + _0x5daed7 + "\n\n*🔗Npm url :* " + _0x12dc53 + "\n\n";
    await _0x4db23e.sendMessage(_0x46d0de, {
      'text': _0x2d4d5e
    }, {
      'quoted': _0x392fee
    });
  } catch (_0x480817) {
    console.error(_0x480817);
    _0x2a223a("An error occurred: " + _0x480817.message);
  }
});

cmd({
  pattern: "audioto",
  react: '🔊',
  alias: ["toaudio", "tomp3"],
  desc: "convert to audio",
  category: "convert",
  use: ".toptt <Reply to video>",
  filename: __filename
}, async (bot, message, options, context) => {
  const {
    from,
    quoted,
    body,
    command,
    reply,
    sender,
  } = context;

  try {
    // Check if the quoted message is a video
    const isVideoMessage = quoted 
      ? quoted.type === "videoMessage" 
      : message.type === "videoMessage";

    if (!isVideoMessage) {
      await reply("Please reply to a video.");
      return;
    }

    // Download the video
    const videoData = quoted 
      ? await quoted.download() 
      : await message.download();

    // Convert video to audio using ffmpeg
    const audioData = await ffmpeg(videoData, [
      "-vn", // No video
      "-c:a", "libopus", 
      "-b:a", "128k", 
      "-vbr", "on", 
      "-compression_level", "10"
    ], "mp4", "opus");

    // Send the audio file
    const sentAudio = await bot.sendMessage(message.chat, {
      audio: audioData.options,
      mimetype: "audio/mpeg"
    }, { quoted: message });

    // Send a reaction to the conversion
    await bot.sendMessage(from, {
      react: {
        text: '🎼',
        key: sentAudio.key
      }
    });
  } catch (error) {
    await reply("*Error!!*");
    console.error(error);
  }
});

cmd({
  'pattern': "attp",
  'react': '✨',
  'alias': ['texttogif'],
  'desc': "Text to convert sticker",
  'category': "convert",
  'use': ".attp HI",
  'filename': __filename
}, async (client, message, from, {
  from: sender, 
  body: userInput, 
  isCmd, 
  command, 
  args, 
  q, 
  isGroup, 
  senderName, 
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
}) => {
  try {
    if (!userInput) {
      return await reply("Please provide text to convert to a sticker.");
    }

    let responseBuffer = await getBuffer("https://api-fix.onrender.com/api/maker/attp?text=" + userInput);

    await client.sendMessage(sender, {
      'sticker': await videoToWebp(responseBuffer)
    }, {
      'quoted': message
    });
  } catch (error) {
    console.log(error);
  }
});
