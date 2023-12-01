/**
 * Module script to establish connections
 */

import {updateNumVis} from './page.module.js'
import {conn} from './status.module.js'

export let latest, ws, memory = []

// set up the connection to the server
function initServerConnection() {
    ws = new WebSocket('ws://localhost:40510')

    ws.onopen = function() {
        conn('Connected to server')
        ws.send('Hello, base!')
    }
    ws.onmessage = incomingMessage
}

function incomingMessage(message) {
    receiveData(message)
    updateNumVis()
}

function recieveData(message) {
    conn('Receiving data')
    latest = JSON.parse(message.data)
    memory.push(JSON.parse(JSON.stringify(latest)))
    if (memory.length > 100) memory.shift()
}

export {initServerConnection}