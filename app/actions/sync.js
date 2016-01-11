const debug = require('debug')('peermusic:sync:actions')
const events = require('events')
const inherits = require('inherits')

inherits(Peers, events.EventEmitter)
var peers = new Peers()

var actions = {
  'REGISTER_PEER': (peer, peerId) => {
    peers.add(peer, peerId)
    setTimeout(() => peer.send({test: 'hi!'}, 'test'), 300)
  },
  'DEREGISTER_PEER': (peer, peerId) => {
    peers.remove(peerId)
  },
  'GET_INVENTORY': () => {
    return null
  },
  'GET_SONG': (id) => {
    return null
  },
  'GET_COVER': (id) => {
    return null
  },
  'GET_SIMILARITY': (id) => {
    return null
  },
  'START_CONTINUAL_SYNC': () => {

  },
  'ANSWER_REQUEST': (data) => {
    debug('hoho', data)
  }
}

peers.on('data', actions.ANSWER_REQUEST)
peers.on('close', actions.DEREGISTER_PEER)

module.exports = actions

function Peers () {
  this.remotes = {}

  this.add = (peer, peerId) => {
    var self = this
    self.remotes[peerId] = peer
    peer.on('data', (data) => self.emit('data', data))
    peer.on('close', (data) => self.emit('close', peer, peerId))
  }

  this.remove = (peerId) => {
    delete this.peers[peerId]
  }
}
