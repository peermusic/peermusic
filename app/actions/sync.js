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
        actions.DEREGISTER_PEER(peer, peerId)
      })
    }
  },

  PROCESS_INCOMING_DATA: (data, peerId) => {
    return (dispatch, getState) => {
      debug('received', data.type)

      var networkActions = {
        REQUEST_INVENTORY: () => {
          actions.SEND_INVENTORY(peerId)(dispatch, getState)
        },

        SEND_INVENTORY: () => {
          actions.RECEIVE_INVENTORY(data.songs, peerId)(dispatch, getState)
        }
      }

      if (!networkActions[data.type]) {
        debug('received invalid request type')
      }

      networkActions[data.type]()
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

  RECEIVE_INVENTORY: (theirSongs, peerId) => {
    return (dispatch, getState) => {
      debug('receiving inventory from', peerId)

      function mergeSongObject (localList, remoteList, peerId) {
        var remainder = Object.assign({}, localList)
        var mergedSongs = Object.assign({}, localList)
        var providedByPeer = []
        Object.keys(remoteList).forEach((songId) => {
          delete remainder[songId]
          if (!mergedSongs[songId]) {
            mergedSongs[songId] = remoteList[songId]
            mergedSongs[songId].addedAt = (new Date()).toString()
            mergedSongs[songId].favorited = false
            mergedSongs[songId].local = false
          }
          providedByPeer.push(songId)
        })
        var notSharedWithPeer = Object.keys(remainder)
        return {mergedSongs, providedByPeer, notSharedWithPeer}
      }

      function updateProviders (providers, providedByPeer, notSharedWithPeer, peerId) {
        var updatedProviders = Object.assign({}, providers)
        providedByPeer.forEach((songId) => {
          if (!providers[songId]) {
            updatedProviders[songId] = [peerId]
            return
          }
          if (providers[songId].indexOf(peerId) === -1) {
            updatedProviders[songId].push(peerId)
          }
        })
        notSharedWithPeer.forEach((songId) => {
          // Go through all songs that are not shared, see if the other peer
          // provided them in the past. If so remove him as he no longer does.
          var index = providers[songId].indexOf(peerId)
          if (providers[songId] && index !== -1) {
            updatedProviders[songId].splice(index, 1)
          }
        })
        return updatedProviders
      }

      var {mergedSongs, providedByPeer, notSharedWithPeer} = mergeSongObject(
        getState().songs,
        theirSongs,
        peerId
      )
      var updatedProviders = updateProviders(
        getState().sync.providers,
        providedByPeer,
        notSharedWithPeer,
        peerId
      )

      console.log('got', mergedSongs, updatedProviders)
      dispatch({
        type: 'SET_SYNCABLE_SONGS',
        songs: mergedSongs
      })
      dispatch({
        type: 'SET_PROVIDER_LIST',
        providers: updatedProviders
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
    delete self.remotes[peerId]
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
    debug('broadcasting to ' + Object.keys(self.remotes).length + ' peers', data.type)
    for (let peerId in self.remotes) {
      self.remotes[peerId].send(data)
    }
  }
}

window.ri = actions.REQUEST_INVENTORY
module.exports = actions
