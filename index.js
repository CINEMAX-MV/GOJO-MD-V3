const {
    default: makeWASocket,
    getAggregateVotesInPollMessage, 
    useMultiFileAuthState,
    DisconnectReason,
    getDevice,
    fetchLatestBaileysVersion,
    jidNormalizedUser,
    getContentType,
    Browsers,
    delay,
    makeInMemoryStore,
    makeCacheableSignalKeyStore,
    downloadContentFromMessage,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    prepareWAMessageMedia,
    proto
} = require('@whiskeysockets/baileys')
const fs = require('fs')
const P = require('pino')
const FileType = require('file-type')
const moment = require('moment-timezone')
const l = console.log
var config = require('./settings')
// Other requires and bot setup lines (if any)

// Call start.js

const qrcode = require('qrcode-terminal')
const NodeCache = require('node-cache')
const util = require('util')
const mongoose = require('mongoose'); 
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require("cheerio")
var prefix = config.PREFIX
const news = config.news
var prefixRegex = config.PREFIX === "false" || config.PREFIX === "null" ? "^" : new RegExp('^[' + config.PREFIX + ']');
const {
    smsg,
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson,
    fetchBuffer,
    getFile
} = require('./lib/functions')
const {
    sms,
    downloadMediaMessage
} = require('./lib/msg')
var { updateCMDStore,isbtnID,getCMDStore,getCmdForCmdId,connectdb,input,get,updb,updfb } = require("./lib/database")
var { get_set , input_set } = require('./lib/set_db')        
const axios = require('axios')
 function genMsgId() {
  const lt = 'GojoTech';
  const prefix = "3EB";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomText = prefix;

  for (let i = prefix.length; i < 22; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomText += characters.charAt(randomIndex);
  }   
 return randomText;
}    

const {
    File
} = require('megajs')
const path = require('path')
const msgRetryCounterCache = new NodeCache()
const ownerNumber = config.OWNER_NUMBER



//===================SESSION============================
if (!fs.existsSync(__dirname + '/lib/session/creds.json')) {
    if (config.SESSION_ID) {
      const sessdata = config.SESSION_ID.replace(" ")
      const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
      filer.download((err, data) => {
        if (err) throw err
        fs.writeFile(__dirname + '/lib/session/creds.json', data, () => {
          console.log("Session download completed !!")
        })
      })
    }
  }
// <<==========PORTS===========>>
const express = require("express");
const app = express();
const port = process.env.PORT || 8000;


//====================================
async function connectToWA() {
    const {
        version,
        isLatest
    } = await fetchLatestBaileysVersion()
    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(__dirname + '/lib//session/')
    const conn = makeWASocket({
    logger: P({
        level: "fatal"
    }).child({
        level: "fatal"
    }),
    generateHighQualityLinkPreview: true,
    auth: state,
    defaultQueryTimeoutMs: undefined,
    msgRetryCounterCache
})

    conn.ev.on('connection.update', async (update) => {
        const {
            connection,
            lastDisconnect
        } = update
        if (connection === 'close') {
            if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
                connectToWA()
            }
        } else if (connection === 'open') {


//──────────────────────────────────────────────────────────────────   
		
		
            console.log('Installing plugins 🔌... ')
            const path = require('path');
            fs.readdirSync("./plugins/").forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() == ".js") {
                    require("./plugins/" + plugin);
                }
            });
            console.log('Plugins installed ✅')
            console.log('Bot connected ✅')
await conn.sendMessage(config.OWNER_NUMBER + "@s.whatsapp.net", {
text: "*👨‍💻 GOJO MD 👨‍💻 successfully connected* ✓\n\n Use .Update command to see GOJO md new update news \n\n> ◦ *Official  Chanel* - ```https://whatsapp.com/channel/0029VbB9tgf4NVih7bqzzf0s```\n> ◦ ᴊᴏɪɴ ᴏᴜʀ sᴜᴘᴘᴏʀᴛ ɢʀᴏᴜᴘ ᴠɪᴀ ᴛʏᴘᴇ: .joinsup\n*👨‍💻 GOJO ᴍᴅ 👨‍💻 ᴡʜᴀᴛꜱᴀᴘᴘ ᴜꜱᴇʀ ʙᴏᴛ*\n*ᴄʀᴇᴀᴛᴇᴅ ʙʏ • sayura mihiranga*",
contextInfo: {
externalAdReply: {
title: "👨‍💻 GOJO MD 👨‍💻\nSuccessfully Connected !",	
thumbnailUrl: "https://raw.githubusercontent.com/gojo18888/Photo-video-/refs/heads/main/file_000000003a2861fd8da00091a32a065a.png",
sourceUrl: "",
mediaType: 1,
renderLargerThumbnail: true
}}}) 
    }
  })




        
      

//==================================Welcome================================
	

conn.forwardMessage = async (jid, message, forceForward = false, options = {}) => {
            let vtype
            if (options.readViewOnce) {
                message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
                vtype = Object.keys(message.message.viewOnceMessage.message)[0]
                delete (message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
                delete message.message.viewOnceMessage.message[vtype].viewOnce
                message.message = {
                    ...message.message.viewOnceMessage.message
                }
            }

            let mtype = Object.keys(message.message)[0]
            let content = await generateForwardMessageContent(message, forceForward)
            let ctype = Object.keys(content)[0]
            let context = {}
            if (mtype != "conversation") context = message.message[mtype].contextInfo
            content[ctype].contextInfo = {
                ...context,
                ...content[ctype].contextInfo
            }
            const waMessage = await generateWAMessageFromContent(jid, content, options ? {
                ...content[ctype],
                ...options,
                ...(options.contextInfo ? {
                    contextInfo: {
                        ...content[ctype].contextInfo,
                        ...options.contextInfo
                    }
                } : {})
            } : {})
            await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
            return waMessage
             }



	


	
//==================================================================


	
// respon cmd pollMessage
async function getMessage(key) {
    if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg?.message;
    }
    return {
        conversation: "Hai",
    };
}

conn.ev.on('messages.update', async chatUpdate => {
    for (const { key, update } of chatUpdate) {
        if (update.pollUpdates && key.fromMe) {
            const pollCreation = await getMessage(key);
            if (pollCreation) {
                const pollUpdate = await getAggregateVotesInPollMessage({
                    message: pollCreation,
                    pollUpdates: update.pollUpdates,
                });
                var toCmd = pollUpdate.filter(v => v.voters.length !== 0)[0]?.name;
                if (toCmd == undefined) return;
                var prefCmd = prefix + toCmd;

                try {
                    setTimeout(async () => {
                        await gss.sendMessage(key.remoteJid, { delete: key });
                    }, 10000);
                } catch (error) {
                    console.error("Error deleting message:", error);
                }

                gss.appenTextMessage(prefCmd, chatUpdate);
            }
        }
    }
});



conn.ev.on('messages.update', async(mes) => {
        for(const { key, update } of mes) {
            if(update.pollUpdates) {
                const pollCreationmg = await getMessage(key)
                const pollCreation = pollCreationmg.message;
                if(pollCreation) {
                    const from = key.remoteJid;
                    const botNumber = await jidNormalizedUser(conn.user.id);
                    const pollMessage = await getAggregateVotesInPollMessage({
                        message: pollCreation,
                        pollUpdates: update.pollUpdates,
                    })
                    let bodyName = pollMessage.find(poll => poll.voters.length > 0)?.name || '';
                    let bodyIndex = pollMessage.findIndex(poll => poll.name === bodyName) || '';
                    
                    let voter = (pollMessage.find(poll => poll.voters.length > 0)?.voters[0] == 'me')?botNumber  :pollMessage.find(poll => poll.voters.length > 0)?.voters[0];
                    function extractMentionedJid(data) {
                        let messageKeys = ['pollCreationMessage', 'pollCreationMessageV1', 'pollCreationMessageV2', 'pollCreationMessageV3'];
                    
                        for (let key of messageKeys) {
                            if (data[key]  && data[key].mentionedJid) {
                                return data[key].mentionedJid;
                            }
                        }
                    
                        return null; 
                    }function extractpollname(data) {
                        let messageKeys = ['pollCreationMessage', 'pollCreationMessageV1', 'pollCreationMessageV2', 'pollCreationMessageV3'];
                    
                        for (let key of messageKeys) {
                            if (data[key]  && data[key].name) {
                                return data[key].name;
                            }
                        }
                    
                        return null; 
                    }
                    const mentionedJid = extractMentionedJid(pollCreation);
                    const poll = extractpollname(pollCreation);
                    const isRequester= mentionedJid?.includes(voter)
                    const pollSender = pollCreationmg.key.remoteJid.includes('@g.us') ? pollCreationmg.key.participant : pollCreationmg.key.remoteJid;
                    const dat = {
                                body: bodyIndex+ 1,
                                voted:bodyName,
                                from: from,
                                isRequester : isRequester? isRequester:false,
                                mentionedJid: mentionedJid,
                                pollSender: pollSender,
                                poll:poll,
                                voter: voter,
                                type: 'poll'
                }
                
                    await conn.sendMessage(botNumber, { text: JSON.stringify(dat,null,2) } )
                    //conn.sendMessage(botNumber, { text: JSON.stringify(pollCreation,null,2) } )
                    //conn.sendMessage(botNumber, { text: JSON.stringify(pollMessage,null,2) } )
                    //conn.sendMessage(botNumber, { text: JSON.stringify(update?.pollUpdates,null,2) } )
                   
                    //events.commands.map(async(command) => {
                      //  if (body && command.on === "poll") {
                        //command.function(conn, mes, m,{from, l,  body, isGroup, sender,  botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants,  isItzcp, groupAdmins, isBotAdmins, isAdmins, reply,react})
                        //}});
                }
            }
        }
    })	



	
//==================================================================	

    conn.ev.on('creds.update', saveCreds)
    conn.ev.on('messages.upsert', async (mek) => {
      try {
            mek = mek.messages[0]
            if (!mek.message) return
	    var id_db = require('./lib/id_db')    
            mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            const m = sms(conn, mek)
	    var smg = m
            const type = getContentType(mek.message)
            const content = JSON.stringify(mek.message)
            const from = mek.key.remoteJid
            const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []


//==================================Button================================
	      
const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :(type == 'interactiveResponseMessage' ) ? mek.message.interactiveResponseMessage  && mek.message.interactiveResponseMessage.nativeFlowResponseMessage && JSON.parse(mek.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson) && JSON.parse(mek.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id :(type == 'templateButtonReplyMessage' )? mek.message.templateButtonReplyMessage && mek.message.templateButtonReplyMessage.selectedId  : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
  

//==================================NonButton================================
  	
await isbtnID(mek.message?.extendedTextMessage?.contextInfo?.stanzaId) &&
getCmdForCmdId(await getCMDStore(mek.message?.extendedTextMessage?.contextInfo?.stanzaId), mek?.message?.extendedTextMessage?.text)
? getCmdForCmdId(await getCMDStore(mek.message?.extendedTextMessage?.contextInfo?.stanzaId), mek?.message?.extendedTextMessage?.text)  : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''   
 
 //==================================================================



conn.sendPoll = (jid, name = '', values = [], selectableCount = 1) => { return conn.sendMessage(jid, { poll: { name, values, selectableCount }}) }
	      
 
	    var dbset = await  get_set('all')
config = await jsonConcat(config , dbset)    
	    prefix = config.PREFIX
var isCmd = body.startsWith(prefix)	    
var command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
var args = body.trim().split(/ +/).slice(1)
var q = args.join(' ')

    var body2 = ''
 if(smg.quoted && smg.quoted.fromMe && await id_db.check(smg.quoted.id)  ){
if (body.startsWith(prefix))  body = body.replace( prefix , '')
			     
			     
var id_body = await id_db.get_data( smg.quoted.id , body)
	
if (id_body.cmd) {
  isCmd = true
command = id_body.cmd.startsWith(prefix)?  id_body.cmd.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
args = id_body.cmd.trim().split(/ +/).slice(1)
q = args.join(' ')		
}
}
      console.log(command)
	      
            const isGroup = from.endsWith('@g.us')
            const sender = mek.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
            const senderNumber = sender.split('@')[0]
            const botNumber = conn.user.id.split(':')[0]
            const pushname = mek.pushName || 'Sin Nombre'
	    const ownbot = '94743826406'
	    const isownbot = ownbot?.includes(senderNumber)
            const gojo = '94743826406'
            const isgojo = gojo?.includes(senderNumber)
	    const developers = '94743826406'
            const isbot = botNumber.includes(senderNumber)
	    const isdev = developers.includes(senderNumber) 	    
            let epaneda =  ''
            const epada = epaneda.split(",")	    
            const isDev = [ ...epada ].map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(sender)
	    const botNumber2 = await jidNormalizedUser(conn.user.id)
            const isCreator = [ botNumber2 ].map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(sender)	  
            const isMe = isbot ? isbot : isdev
            const isOwner = ownerNumber.includes(senderNumber) || isMe
            const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : ''
            const groupName = isGroup ? groupMetadata.subject : ''
            const participants = isGroup ? await groupMetadata.participants : ''
            const groupAdmins = isGroup ? await getGroupAdmins(participants) : ''
            const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
            const isAdmins = isGroup ? groupAdmins.includes(sender) : false
            const isreaction = m.message.reactionMessage ? true : false
            const isAnti = (teks) => {
                let getdata = teks
                for (let i = 0; i < getdata.length; i++) {
                    if (getdata[i] === from) return true
                }
                return false
            }
            const reply = async(teks) => {
  return await conn.sendMessage(from, { text: teks }, { quoted: mek })
}




//==================================Nonbutton================================



function jsonConcat(o1, o2) {
 for (var key in o2) {
  o1[key] = o2[key];
 }
 return o1;
}	

        

    var dbset = await  get_set('all')
config = await jsonConcat(config , dbset)    
conn.replyad = async (teks) => {
  return await conn.sendMessage(from, { text: teks ,
contextInfo: {
    mentionedJid: [ '' ],
    groupMentions: [],
    forwardingScore: 1,
    isForwarded: true,
    
externalAdReply: { 
title: '👨‍💻 GOJO - ＭＤ 👨‍💻',
body: 'ᴀ ꜱɪᴍᴘʟᴇ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ',
mediaType: 1,
sourceUrl: "https://wa.me/94743826406" ,
thumbnailUrl: 'https://raw.githubusercontent.com/gojo18888/Photo-video-/refs/heads/main/file_000000003a2861fd8da00091a32a065a.png' ,
renderLargerThumbnail: false,
showAdAttribution: true
}
}}, { quoted: mek })
}
const NON_BUTTON = true // Implement a switch to on/off this feature...
conn.buttonMessage2 = async (jid, msgData,quotemek) => {
  if (!NON_BUTTON) {
    await conn.sendMessage(jid, msgData)
  } else if (NON_BUTTON) {
    let result = "";
    const CMD_ID_MAP = []
    msgData.buttons.forEach((button, bttnIndex) => {
const mainNumber = `${bttnIndex + 1}`;
result += `\n${mainNumber} | ${button.buttonText.displayText}\n`;

CMD_ID_MAP.push({ cmdId: mainNumber, cmd: button.buttonId });
    });

    if (msgData.headerType === 1) {
const buttonMessage = `${msgData.text}\n\n🔢 Reply you want number,${result}\n${msgData.footer}`
const textmsg = await conn.sendMessage(from, { text: buttonMessage ,
  contextInfo: {
    mentionedJid: [ '' ],
    groupMentions: [],
    forwardingScore: 1,
    isForwarded: true,
    
externalAdReply: { 
title: '👨‍💻 GOJO - ＭＤ 👨‍💻',
body: 'ᴀ ꜱɪᴍᴘʟᴇ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ',
mediaType: 1,
sourceUrl: "https://wa.me/94743826406" ,
thumbnailUrl: 'https://raw.githubusercontent.com/gojo18888/Photo-video-/refs/heads/main/file_000000003a2861fd8da00091a32a065a.png' ,
renderLargerThumbnail: false,
showAdAttribution: true
}
}}, { quoted: quotemek || mek})
await updateCMDStore(textmsg.key.id, CMD_ID_MAP);
    } else if (msgData.headerType === 4) {
const buttonMessage = `${msgData.caption}\n\n🔢 Reply you want number,${result}\n${msgData.footer}`
const imgmsg = await conn.sendMessage(jid, { image: msgData.image, caption: buttonMessage ,
contextInfo: {
    mentionedJid: [ '' ],
    groupMentions: [],
    forwardingScore: 1,
    isForwarded: true,
    
externalAdReply: { 
title: '👨‍💻 GOJO - ＭＤ 👨‍💻',
body: 'ᴀ ꜱɪᴍᴘʟᴇ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ',
mediaType: 1,
sourceUrl: "https://wa.me/94743826406" ,
thumbnailUrl: 'https://raw.githubusercontent.com/gojo18888/Photo-video-/refs/heads/main/file_000000003a2861fd8da00091a32a065a.png' ,
renderLargerThumbnail: false,
showAdAttribution: true
}
}}, { quoted: quotemek || mek})
await updateCMDStore(imgmsg.key.id, CMD_ID_MAP);
    }
  }
}

conn.replyList = async (from , list_reply , options) => {
function convertNumberList(sections) {
    let result = "";

    sections.forEach((section, sectionIndex) => {
        result += section.title? `${section.title}\n` : ''

        section.rows.forEach((row, rowIndex) => {
            result += `${row.title} || ${row.description}`;
            result += rowIndex === section.rows.length - 1 ? "" : "\n"; // Add newline unless it's the last row
        });

        result += sectionIndex === sections.length - 1 ? "" : "\n\n"; // Add extra newline unless it's the last section
    });

    return result;
}
if (!list_reply.sections) return false
list_reply[list_reply.caption? 'caption' : 'text'] = ( list_reply.title ? list_reply.title + '\n\n' : "" ) +  (list_reply.caption? list_reply.caption : list_reply.text) + '\n\n' + list_reply.buttonText + '\n\n' + await convertNumberList(list_reply.sections) + '\n\n' +list_reply.footer	
var t = { ...list_reply }
delete list_reply.sections
delete list_reply.footer
delete list_reply.buttonText
delete list_reply.title
const sentMessage = await conn.sendMessage(from, list_reply , options);	
const cmdArray = [];
t.sections.forEach((section) => {
    section.rows.forEach((row) => {
        cmdArray.push({ rowId: row.rowId, title: row.title });
    });
});
for ( let i = 0; i < cmdArray.length; i++) {	
await id_db.input_data(cmdArray[i].rowId ,cmdArray[i].title , sentMessage.key.id ) 
}}  
      
conn.buttonMessage = async (jid, msgData, quotemek) => {
  if (!NON_BUTTON) {
    await conn.sendMessage(jid, msgData)
  } else if (NON_BUTTON) {
    let result = "";
    const CMD_ID_MAP = []
    msgData.buttons.forEach((button, bttnIndex) => {
const mainNumber = `${bttnIndex + 1}`;
result += `\n${mainNumber} | ${button.buttonText.displayText}\n`;

CMD_ID_MAP.push({ cmdId: mainNumber, cmd: button.buttonId });
    });

    if (msgData.headerType === 1) {
const buttonMessage = `${msgData.text || msgData.caption}\n🔢 Reply you want number,${result}\
\n\n${msgData.footer}`
const textmsg = await conn.sendMessage(from, { text: buttonMessage ,contextInfo: {
    mentionedJid: [ '' ],
    groupMentions: [],
    forwardingScore: 1,
    isForwarded: true,
    
externalAdReply: { 
title: '👨‍💻 GOJO - ＭＤ 👨‍💻',
body: 'ᴀ ꜱɪᴍᴘʟᴇ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ',
mediaType: 1,
sourceUrl: "https://wa.me/94743826406" ,
thumbnailUrl: 'https://raw.githubusercontent.com/gojo18888/Photo-video-/refs/heads/main/file_000000003a2861fd8da00091a32a065a.png' ,
renderLargerThumbnail: false,
showAdAttribution: true
}
}}, { quoted: quotemek || mek})
await updateCMDStore(textmsg.key.id, CMD_ID_MAP);
    } else if (msgData.headerType === 4) {
const buttonMessage = `${msgData.caption}\n\n🔢 Reply you want number,${result}\n${msgData.footer}`
const imgmsg = await conn.sendMessage(jid, { image: msgData.image, caption: buttonMessage ,contextInfo: {
    mentionedJid: [ '' ],
    groupMentions: [],
    forwardingScore: 1,
    isForwarded: true,
    
externalAdReply: { 
title: '👨‍💻 GOJO - ＭＤ 👨‍💻',
body: 'ᴀ ꜱɪᴍᴘʟᴇ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ',
mediaType: 1,
sourceUrl: "https://wa.me/94743826406" ,
thumbnailUrl: 'https://raw.githubusercontent.com/gojo18888/Photo-video-/refs/heads/main/file_000000003a2861fd8da00091a32a065a.png' ,
renderLargerThumbnail: false,
showAdAttribution: true
}
}}, { quoted: quotemek || mek})
await updateCMDStore(imgmsg.key.id, CMD_ID_MAP);
    }
  }
}


conn.listMessage2 = async (jid, msgData, quotemek) => {
  if (!NON_BUTTON) {
    await conn.sendMessage(jid, msgData)
  } else if (NON_BUTTON) {
    let result = "";
    const CMD_ID_MAP = []

    msgData.sections.forEach((section, sectionIndex) => {
const mainNumber = `${sectionIndex + 1}`;
result += `\n[${mainNumber}] ${section.title}\n`;

section.rows.forEach((row, rowIndex) => {
  const subNumber = `${mainNumber}.${rowIndex + 1}`;
  const rowHeader = `   ${subNumber} | ${row.title}`;
  result += `${rowHeader}\n`;
  if (row.description) {
    result += `   ${row.description}\n\n`;
  }
  CMD_ID_MAP.push({ cmdId: subNumber, cmd: row.rowId });
});
    });

    const listMessage = `${msgData.text}\n\n${msgData.buttonText},${result}\n${msgData.footer}`
    const text = await conn.sendMessage(from, { text: listMessage ,
contextInfo: {
    mentionedJid: [ '' ],
    groupMentions: [],
    forwardingScore: 1,
    isForwarded: true,
    
externalAdReply: { 
title: '👨‍💻 GOJO - ＭＤ 👨‍💻',
body: 'ᴀ ꜱɪᴍᴘʟᴇ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ',
mediaType: 1,
sourceUrl: "https://wa.me/94743826406" ,
thumbnailUrl: 'https://raw.githubusercontent.com/gojo18888/Photo-video-/refs/heads/main/file_000000003a2861fd8da00091a32a065a.png' ,
renderLargerThumbnail: false,
showAdAttribution: true
}
}}, { quoted: quotemek || mek})
    await updateCMDStore(text.key.id, CMD_ID_MAP);
  }
}

conn.listMessage = async (jid, msgData, quotemek) => {
  if (!NON_BUTTON) {
    await conn.sendMessage(jid, msgData)
  } else if (NON_BUTTON) {
    let result = "";
    const CMD_ID_MAP = []

    msgData.sections.forEach((section, sectionIndex) => {
const mainNumber = `${sectionIndex + 1}`;
result += `\n[${mainNumber}] ${section.title}\n`;

section.rows.forEach((row, rowIndex) => {
  const subNumber = `${mainNumber}.${rowIndex + 1}`;
  const rowHeader = `   ${subNumber} | ${row.title}`;
  result += `${rowHeader}\n`;
  if (row.description) {
    result += `   ${row.description}\n\n`;
  }
  CMD_ID_MAP.push({ cmdId: subNumber, cmd: row.rowId });
});
    });

    const listMessage = `${msgData.text}\n\n${msgData.buttonText},${result}\n${msgData.footer}`
    const text = await conn.sendMessage(from, { text: listMessage, 
contextInfo: {
    mentionedJid: [ '' ],
    groupMentions: [],
    forwardingScore: 1,
    isForwarded: true,
    
externalAdReply: { 
title: '👨‍💻 GOJO - ＭＤ 👨‍💻',
body: 'ᴀ ꜱɪᴍᴘʟᴇ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ',
mediaType: 1,
sourceUrl: "https://wa.me/94743826406" ,
thumbnailUrl: 'https://raw.githubusercontent.com/gojo18888/Photo-video-/refs/heads/main/file_000000003a2861fd8da00091a32a065a.png' ,
renderLargerThumbnail: false,
showAdAttribution: true
}
}}, { quoted: quotemek || mek})
    await updateCMDStore(text.key.id, CMD_ID_MAP);
  }
}

    	    
conn.edite = async (gg, newmg) => {
  await conn.relayMessage(from, {
    protocolMessage: {
key: gg.key,
type: 14,
editedMessage: {
  conversation: newmg
}
    }
  }, {})
}	    


	

      

//==================================Button================================
            
	      /*
            const ownerdata = (await axios.get('https://gist.github.com/VajiraTechOfficial/4386c5a7d246da55047ea6abc5bd9eec/raw')).data
            config.LOGO = ownerdata.imageurl
            config.FOOTER = ownerdata.footer
            config.PAIR = ownerdata.pair
            config.NEWS = ownerdata.news*/
	      
            conn.edit = async (mek, newmg) => {
                await conn.relayMessage(from, {
                    protocolMessage: {
                        key: mek.key,
                        type: 14,
                        editedMessage: {
                            conversation: newmg
                        }
                    }
                }, {})
            }
            conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
                let mime = '';
                let res = await axios.head(url)
                mime = res.headers['content-type']
                if (mime.split("/")[1] === "gif") {
                    return conn.sendMessage(jid, {
                        video: await getBuffer(url),
                        caption: caption,
                        gifPlayback: true,
                        ...options
                    }, {
                        quoted: quoted,
                        ...options
                    })
                }
                let type = mime.split("/")[0] + "Message"
                if (mime === "application/pdf") {
                    return conn.sendMessage(jid, {
                        document: await getBuffer(url),
                        mimetype: 'application/pdf',
                        caption: caption,
                        ...options
                    }, {
                        quoted: quoted,
                        ...options
                    })
                }
                if (mime.split("/")[0] === "image") {
                    return conn.sendMessage(jid, {
                        image: await getBuffer(url),
                        caption: caption,
                        ...options
                    }, {
                        quoted: quoted,
                        ...options
                    })
                }
                if (mime.split("/")[0] === "video") {
                    return conn.sendMessage(jid, {
                        video: await getBuffer(url),
                        caption: caption,
                        mimetype: 'video/mp4',
                        ...options
                    }, {
                        quoted: quoted,
                        ...options
                    })
                }
                if (mime.split("/")[0] === "audio") {
                    return conn.sendMessage(jid, {
                        audio: await getBuffer(url),
                        caption: caption,
                        mimetype: 'audio/mpeg',
                        ...options
                    }, {
                        quoted: quoted,
                        ...options
                    })
                }
            }
conn.sendButtonMessage = async (jid, buttons, quoted, opts = {}) => {

                let header;
                if (opts?.video) {
                    var video = await prepareWAMessageMedia({
                        video: {
                            url: opts && opts.video ? opts.video : ''
                        }
                    }, {
                        upload: conn.waUploadToServer
                    })
                    header = {
                        title: opts && opts.header ? opts.header : '',
                        hasMediaAttachment: true,
                        videoMessage: video.videoMessage,
                    }

                } else if (opts?.image) {
                    var image = await prepareWAMessageMedia({
                        image: {
                            url: opts && opts.image ? opts.image : ''
                        }
                    }, {
                        upload: conn.waUploadToServer
                    })
                    header = {
                        title: opts && opts.header ? opts.header : '',
                        hasMediaAttachment: true,
                        imageMessage: image.imageMessage,
                    }

                } else {
                    header = {
                        title: opts && opts.header ? opts.header : '',
                        hasMediaAttachment: false,
                    }
                }


                let message = generateWAMessageFromContent(jid, {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2,
                            },
                            interactiveMessage: {
                                body: {
                                    text: opts && opts.body ? opts.body : ''
                                },
                                footer: {
                                    text: opts && opts.footer ? opts.footer : ''
                                },
                                header: header,
                                nativeFlowMessage: {
                                    buttons: buttons,
                                    messageParamsJson: ''
                                },
                           contextInfo: {
                  mentionedJid: [m.sender], 
                  forwardingScore: 999,
                  isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: config.C_JID,
                  newsletterName: config.C_NAME,
                  serverMessageId: 143
                },
                externalAdReply: { 
title: config.T_LINE,
body: config.B_LINE,
mediaType: 1,
sourceUrl: config.GOJO,
thumbnailUrl: config.LOGO2 ,
renderLargerThumbnail: false

                }
                           }
                            }
                        }
                    }
                },{
                    quoted: quoted
                })
                await conn.sendPresenceUpdate('composing', jid)
                await sleep(1000 * 1);
                return await conn.relayMessage(jid, message["message"], {
                    messageId: message.key.id
                })
            }


	      
if (!isMe && !isOwner && !isGroup && config.ONLY_GROUP == 'true') return 
if (!isMe && !isOwner && config.ONLY_ME == 'true') return 
        
            //==================================plugin map================================
         const events = require('./lib/command')
const cmdName = isCmd ?  command : false;
if (isCmd) {
  const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
  if (cmd) {
    if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } })

    try {
cmd.function(conn, mek, m, { from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply ,config, isCreator , isDev, botNumber2 });
    } catch (e) {
console.error("[PLUGIN ERROR] ", e);
    }
  }
}
events.commands.map(async (command) => {
  if (body && command.on === "body") {
    command.function(conn, mek, m, { from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply , config, isCreator , isDev, botNumber2 });
  } else if (mek.q && command.on === "text") {
    command.function(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply , config ,isCreator , isDev, botNumber2 });
  } else if (
    (command.on === "image" || command.on === "photo") &&
    mek.type === "imageMessage"
  ) {
    command.function(conn, mek, m, { from, prefix, l, quoted, body,  isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply , config, isCreator , isDev, botNumber2 });
  } else if (
    command.on === "sticker" &&
    mek.type === "stickerMessage"
  ) {
    command.function(conn, mek, m, { from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply , config, isCreator , isDev, botNumber2 });
  }
});





      conn.downloadAndSaveMediaMessage = async(message, filename, attachExtension = true) => {
                let quoted = message.msg ? message.msg : message
                let mime = (message.msg || message).mimetype || ''
                let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
                const stream = await downloadContentFromMessage(quoted, messageType)
                let buffer = Buffer.from([])
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk])
                }
                let type = await FileType.fromBuffer(buffer)
                trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
                    // save to file
                await fs.writeFileSync(trueFileName, buffer)
                return trueFileName
            }	      



//==================================================================	

	      
            switch (command) {
        case 'jid':
        reply(from)
        break

			    
        default:				
        if (isOwner && body.startsWith('$')) {
        let bodyy = body.split('$')[1]
        let code2 = bodyy.replace("°", ".toString()");
        try {
        let resultTest = await eval(code2);l
        if (typeof resultTest === "object") {
        reply(util.format(resultTest));
        } else {
        reply(util.format(resultTest));
        }
        } catch (err) {
        reply(util.format(err));
        }}}
        } catch (e) {
            const isError = String(e)
            console.log(isError)
        }
    })
}
app.get("/", (req, res) => {
res.send("📟 Gojo-Md Working successfully!");
});
app.listen(port, () => console.log(`gojo-Md Server listening on port http://localhost:${port}`));
setTimeout(() => {
connectToWA()
}, 3000);
    
    
