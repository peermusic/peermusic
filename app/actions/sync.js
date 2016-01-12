const debug = require('debug')('peermusic:sync:actions')
const events = require('events')
const inherits = require('inherits')

inherits(Peers, events.EventEmitter)
var peers = new Peers()

var actions = {
  INITIATE_SYNC: () => {
    return (dispatch, getState) => {
      peers.on('data', function (data, peerId) {
        actions.PROCESS_INCOMING_DATA(data, peerId)(dispatch, getState)
      })
      peers.on('close', function (peer, peerId) {
        actions.DEREGISTER_PEER(peer, peerId)(dispatch, getState)
      })
    }
  },
  REGISTER_PEER: (peer, peerId) => {
    debug('registering WebRTC peer', peerId)
    peers.add(peer, peerId)
  },

  DEREGISTER_PEER: (peer, peerId) => {
    debug('deregistering WebRTC peer', peerId)
    peers.remove(peerId)
  },

  REQUEST_INVENTORY: () => {
    peers.broadcast({
      type: 'REQUEST_INVENTORY'
    })
  },

  SEND_INVENTORY: (peerId) => {
    return (dispatch, getState) => {
      peers.send({
        type: 'SEND_INVENTORY',
        songs: getState().songs
      }, peerId)
    }
  },

  RECEIVE_INVENTORY: (songs, peerId) => {
    return (dispatch, getState) => {
      dispatch({
        type: 'UPDATE_SYNCABLE_SONGS',
        songs,
        peerId
      })
    }
  },

  START_SYNC_LOOP: () => {
    return null
  },

  REQUEST_SONG: (id) => {
    return null
  },

  REQUEST_COVER: (id) => {
    return null
  },

  REQUEST_SIMILARITY: (id) => {
    return null
  },

  PROCESS_INCOMING_DATA: (data, peerId) => {
    return (dispatch, getState) => {
      debug('received', data.type)
      switch (data.type) {
        case 'REQUEST_INVENTORY':
          return actions.SEND_INVENTORY(peerId)(dispatch, getState)

        case 'SEND_INVENTORY':
          debug('peer send her inventory', peerId)
          return actions.RECEIVE_INVENTORY(data.songs, peerId)(dispatch, getState)

        default:
          debug('received invalid request type')
      }
    }
  }
}

function Peers () {
  var self = this
  self.remotes = {}

  self.add = (peer, peerId) => {
    self.remotes[peerId] = peer
    peer.on('data', (data) => self.emit('data', data, peerId))
    peer.on('close', (data) => self.emit('close', peer, peerId))
  }

  self.remove = (peerId) => {
    delete this.peers[peerId]
  }

  self.send = (data, peerId) => {
    if (!self.remotes[peerId]) {
      debug('cannot send to offline peer', peerId)
      return
    }
    debug('sending', data.type, data)
    self.remotes[peerId].send(data)
  }

  self.broadcast = (data) => {
    debug('broadcasting', data.type)
    for (let peerId in self.remotes) {
      self.remotes[peerId].send(data)
    }
  }
}

module.exports = actions
