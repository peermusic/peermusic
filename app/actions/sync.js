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
      window.setInterval(() => {
        actions.REQUEST_INVENTORY()
      }, 1000 * 6)
    }
  },

  PROCESS_INCOMING_DATA: (data, peerId) => {
    return (dispatch, getState) => {
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
      var songs = getState().songs
      var providers = getState().sync.providers
      var filteredSongs = {}
      Object.keys(songs).forEach((songId) => {
        if (!providers[songId] || providers[songId].indexOf(peerId) === -1) {
          // we only send our song if the other peer is not one of our providers for it
          // to avoid phantoms ("he thinks we hold that song - we think he holds that song")
          filteredSongs[songId] = songs[songId]
        }
      })
      console.log('filteredSongs', filteredSongs)
      peers.send({
        type: 'SEND_INVENTORY',
        songs: filteredSongs
      }, peerId)
    }
  },

  RECEIVE_INVENTORY: (theirSongs, peerId) => {
    return (dispatch, getState) => {
      function mergeSongObject (localList, remoteList, peerId) {
        var remainder = Object.assign({}, localList)
        var songsMerged = []
        var songsProvidedByPeer = []

        Object.keys(remoteList).forEach((songId) => {
          delete remainder[songId]
          if (!localList[songId]) {
            var song = remoteList[songId]
            song.addedAt = (new Date()).toString()
            song.favorited = false
            song.local = false
            songsMerged.push(song)
          }
          songsProvidedByPeer.push(songId)
        })
        var uniqueToUs = Object.keys(remainder)

        return {songsMerged, songsProvidedByPeer, uniqueToUs}
      }

      function updateProviders (providers, songsProvidedByPeer, uniqueToUs, peerId) {
        var updatedProviders = Object.assign({}, providers)
        songsProvidedByPeer.forEach((songId) => {
          if (!providers[songId]) {
            updatedProviders[songId] = [peerId]
            return
          }
          if (providers[songId].indexOf(peerId) === -1) {
            updatedProviders[songId].push(peerId)
          }
        })

        var noLongerProvided = []
        uniqueToUs.forEach((songId) => {
          if (!providers[songId]) {
            return
          }
          var index = providers[songId].indexOf(peerId)
          if (index !== -1) {
            updatedProviders[songId].splice(index, 1)
          }
          if (updatedProviders[songId].length === 0) {
            delete updatedProviders[songId]
            noLongerProvided.push(songId)
          }
        })

        return {updatedProviders, noLongerProvided}
      }

      var {songsMerged, songsProvidedByPeer, uniqueToUs} = mergeSongObject(
        getState().songs,
        theirSongs,
        peerId
      )
      var {updatedProviders, noLongerProvided} = updateProviders(
        getState().sync.providers,
        songsProvidedByPeer,
        uniqueToUs,
        peerId
      )

      songsMerged.forEach((song) => {
        dispatch({
          type: 'ADD_SONG',
          song
        })
      })
      noLongerProvided.forEach((songId) => {
        if (!getState().songs[songId].local) {
          dispatch({
            type: 'REMOVE_SONG',
            id: songId
          })
        }
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
    self.remotes[peerId].send(data)
  }

  self.broadcast = (data) => {
    // debug('broadcasting to ' + Object.keys(self.remotes).length + ' peers', data.type)
    for (let peerId in self.remotes) {
      self.remotes[peerId].send(data)
    }
  }
}

window.ri = actions.REQUEST_INVENTORY
module.exports = actions
