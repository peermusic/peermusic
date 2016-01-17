const base64 = require('base64-arraybuffer')
const debug = require('debug')('peermusic:sync:actions')
const events = require('events')
const fs = require('file-system')(['', 'audio/mp3', 'audio/wav', 'audio/ogg'])
const inherits = require('inherits')
var coversActions = require('./covers.js')

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
      window.setTimeout(() => {
        actions.REQUEST_INVENTORY()
      }, 1000 * 5)
      window.setInterval(() => {
        actions.REQUEST_INVENTORY()
      }, 1000 * 60 * 5)
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
        },

        REQUEST_SONG: () => {
          actions.SEND_SONG(data.id, peerId)(dispatch, getState)
        },

        SEND_SONG: () => {
          actions.RECEIVE_SONG(data.id, data.arrayBuffer, peerId)(dispatch, getState)
        }
      }

      if (!networkActions[data.type]) {
        debug('received invalid request type', data.type)
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
      var providers = getState().sync.providers
      // we only send our song if the other peer is not one of our providers for it
      // to avoid phantoms ("he thinks we hold that song - we think he holds that song")
      var filteredSongs = getState().songs.filter(song => !providers[song.id] || providers[song.id].indexOf(peerId) === -1)
      peers.send({
        type: 'SEND_INVENTORY',
        songs: filteredSongs
      }, peerId)
    }
  },

  RECEIVE_INVENTORY: (theirSongs, peerId) => {
    return (dispatch, getState) => {
      function cleanReceivedSong (song) {
        song.addedAt = (new Date()).toString()
        song.favorited = false
        song.local = false
        return song
      }

      const songs = getState().songs

      // Ignore all songs that we have already
      const localSongs = songs.filter(x => x.local).map(x => x.id)
      var remoteSongs = theirSongs.filter(x => localSongs.indexOf(x.id) === -1).map(cleanReceivedSong)

      // Load their songs in our state object, if we don't know it yet
      // "knowing" is either holding it locally or knowing of it's remote existence
      const knownSongs = songs.map(x => x.id)
      remoteSongs.filter(x => knownSongs.indexOf(x.id) === -1).map(song => {
        dispatch({
          type: 'ADD_PROVIDER_SONG',
          song
        })
        coversActions.GET_COVER(song.album, song.artist, song.coverId)(dispatch, getState)
      })

      // Update the providers list
      remoteSongs = remoteSongs.map(x => x.id)
      var providerMap = {...getState().sync.providers}

      // Remove the current peer of the song providers
      for (let id in providerMap) {
        providerMap[id] = providerMap[id].filter(peer => peer !== peerId)
      }

      // Add the peer back to ALL the songs he holds
      for (let i in remoteSongs) {
        let id = remoteSongs[i]
        const oldProviderMap = providerMap[id] || []
        providerMap[id] = [...oldProviderMap, peerId]
      }

      // Remove songs that we don't have any providers for anymore
      for (let id in providerMap) {
        if (providerMap[id].length === 0) {
          delete providerMap[id]
          dispatch({
            type: 'REMOVE_PROVIDER_SONG',
            id: id
          })
        }
      }

      dispatch({
        type: 'SET_PROVIDER_LIST',
        providers: providerMap
      })
    }
  },

  START_SYNC_LOOP: () => {
    return null
  },

  REQUEST_SONG: (id) => {
    return (dispatch, getState) => {
      var providers = getState().sync.providers[id]
      providers.forEach((provider) => {
        peers.send({
          type: 'REQUEST_SONG',
          id: id
        }, provider)
      })
    }
  },

  SEND_SONG: (id, peerId, arrayBuffer) => {
    return (dispatch, getState) => {
      if (!arrayBuffer) {
        var hashName = getState().songs.find((song) => song.id === id).hashName
        return fs.getArrayBuffer(hashName, (err, arrayBuffer) => {
          if (err) {
            throw new Error('Error getting file: ' + err)
          }
          return actions.SEND_SONG(id, peerId, arrayBuffer)(dispatch, getState)
        })
      }
      arrayBuffer = base64.encode(arrayBuffer)
      peers.send({
        type: 'SEND_SONG',
        id,
        arrayBuffer
      }, peerId)
    }
  },

  RECEIVE_SONG: (id, arrayBuffer, peerId) => {
    return (dispatch, getState) => {
      if (!arrayBuffer) return debug('received empty arrayBuffer')

      var song = getState().songs.find((song) => song.id === id)
      if (song.local) {
        debug('discarding already received song')
        return
      }
      var filename = song.hashName

      arrayBuffer = base64.decode(arrayBuffer)
      fs.addArrayBuffer({
        filename,
        arrayBuffer
      }, (err) => { if (err) throw err })

      dispatch({
        type: 'TOGGLE_SONG_LOCAL',
        id
      })
      fs.get(filename, (err, url) => {
        if (err) throw err

        dispatch({
          type: 'FIX_SONG_FILENAME',
          id,
          filename: url
        })
      })
    }
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
    debug('sending to peer', peerId, data.type)
    if (!self.remotes[peerId]) {
      debug('cannot send to offline peer', peerId)
      return
    }
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
