const debug = require('debug')('peermusic:sync:actions')
const events = require('events')
const inherits = require('inherits')

module.exports = {
  'REGISTER_PEER': registerPeer,
  'DEREGISTER_PEER': deregisterPeer,
  'PROCESS_INCOMING_DATA': processIncomingData
}

inherits(Peers, events.EventEmitter)
var peers = new Peers()

peers.on('data', processIncomingData)
peers.on('close', deregisterPeer)

function registerPeer (peer, peerId) {
  peers.add(peer, peerId)
  setTimeout(() => peers.broadcast({test: 'hi!'}), 300)
}

function deregisterPeer (peer, peerId) {
  peers.remove(peerId)
}

function processIncomingData (data) {
  debug('hoho', data)
}

function Peers () {
  var self = this
  self.remotes = {}

  self.add = (peer, peerId) => {
    self.remotes[peerId] = peer
    peer.on('data', (data) => self.emit('data', data))
    peer.on('close', (data) => self.emit('close', peer, peerId))
  }

  self.remove = (peerId) => {
    delete this.peers[peerId]
  }

  self.send = (data, peerId) => {
    if (!self.remotes[peerId]) {
      debug('cannot send to unregistered peer', peerId)
      return
    }
    self.remotes[peerId].send(data)
  }

  self.broadcast = (data) => {
    for (let peerId in self.remotes) {
      self.remotes[peerId].send(data)
    }
  }
}
