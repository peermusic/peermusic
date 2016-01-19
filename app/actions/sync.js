const debug = require('debug')('peermusic:sync:actions')
const events = require('events')
const inherits = require('inherits')
var coversActions = require('./covers.js')
var fs = require('file-system')(['image/jpeg', 'image/jpg'])
var musicSimilarity = require('music-similarity')

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
      debug('processing incoming data', data)

      var networkActions = {
        REQUEST_INVENTORY: () => {
          actions.SEND_INVENTORY(peerId)(dispatch, getState)
        },

        SEND_INVENTORY: () => {
          actions.RECEIVE_INVENTORY(data.songs, peerId)(dispatch, getState)
        },

        REQUEST_COVER: () => {
          actions.SEND_COVER(data.id, data.song, peerId)(dispatch, getState)
        },

        SEND_COVER: () => {
          actions.RECEIVE_COVER(data.coverId, data.cover)(dispatch, getState)
        },

        REQUEST_SIMILAR: () => {
          actions.SEND_SIMILAR(data.song, peerId)(dispatch, getState)
        },

        SEND_SIMILAR: () => {
          actions.RECEIVE_SIMILAR(data.song, data.songs)(dispatch, getState)
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
    return null
  },

  REQUEST_COVER: (id, song) => {
    peers.broadcast({
      type: 'REQUEST_COVER',
      id,
      song
    })
  },

  SEND_COVER: (coverId, song, peerId) => {
    return (dispatch, getState) => {
      const cover = getState().covers.filter(s => s.id === coverId)[0]

      // We don't have the cover locally, let's grab it from connected servers
      if (!cover) {
        require('./covers.js').GET_COVER(song.album, song.artist, coverId, (payload) => {
          peers.send({
            type: 'SEND_COVER',
            cover: payload,
            coverId
          }, peerId)
        })(dispatch, getState)
        return
      }

      // Get cover from filesystem
      fs.getDataUrl(cover.filename, (err, data) => {
        if (err) throw new Error('Error getting file: ' + err)
        peers.send({
          type: 'SEND_COVER',
          cover: data,
          coverId
        }, peerId)
      })
    }
  },

  RECEIVE_COVER: (coverId, payload) => {
    return (dispatch, getState) => {
      require('./covers.js').SAVE_COVER(coverId, coverId + '.jpeg', payload)(dispatch, getState)
    }
  },

  REQUEST_SIMILAR: (song) => {
    peers.broadcast({
      type: 'REQUEST_SIMILAR',
      song
    })
  },

  SEND_SIMILAR: (song, peerId) => {
    return (dispatch, getState) => {
      musicSimilarity(getState().scrapingServers, song, function (list) {
        peers.send({
          type: 'SEND_SIMILAR',
          song,
          songs: list
        }, peerId)
      })
    }
  },

  RECEIVE_SIMILAR: (song, songs) => {
    return (dispatch, getState) => {
      require('./player.js').SET_RADIO_SONGS(songs, song, true)(dispatch, getState)
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
    debug('broadcasting to ' + Object.keys(self.remotes).length + ' peers', data.type)
    for (let peerId in self.remotes) {
      self.remotes[peerId].send(data)
    }
  }
}

window.ri = actions.REQUEST_INVENTORY
module.exports = actions
