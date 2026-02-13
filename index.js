const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const express = require('express')
const fs = require('fs')
const { state, saveCreds } = await useMultiFileAuthState('./auth_info_balieys')

const app = express()
const port = 8000

async function startBot() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    })

    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', (update) => {
        console.log('Connection update:', update)
    })

    console.log('Gojo-MD Server listening on http://localhost:' + port)
}

startBot()

app.get('/', (req, res) => res.send('GOJO-MD Bot is running!'))
app.listen(port, () => console.log(`Server running on port ${port}`))
