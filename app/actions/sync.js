const base64 = require('base64-arraybuffer')
const debug = require('debug')('peermusic:sync:actions')
const events = require('events')
const inherits = require('inherits')
var coversActions = require('./covers.js')
var fs = require('file-system')(['image/jpeg', 'image/jpg', '', 'audio/mp3', 'audio/wav', 'audio/ogg'])
var musicSimilarity = require('music-similarity')

inherits(Peers, events.EventEmitter)
var peers

var actions = {
  INITIATE_SYNC: () => {
    return (dispatch, getState) => {
      peers = new Peers(dispatch, getState)

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

        REQUEST_SONG: () => {
          var song = getState().songs.find((song) => song.id === data.id)
          if (!song || !song.local) {
            debug('received request for a song we dont hold')

            actions.REQUEST_SONG_FOR_FRIEND(data.id)(dispatch, getState)
            return
          }
          actions.SEND_SONG(data.id, peerId)(dispatch, getState)
        },

        SEND_SONG: () => {
          var song = getState().songs.find((song) => song.id === data.id)
          if (!song.downloading || song.local) {
            debug('received a song that we are no longer interested in', song)
            return
          }
          actions.RECEIVE_SONG(data.id, data.arrayBuffer, peerId)(dispatch, getState)
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
        },

        MULTICAST_SHARING_LEVEL: () => {
          actions.RECEIVE_SHARING_LEVEL(data.sharingLevel, peerId)(dispatch, getState)
        }
      }

      if (!networkActions[data.type]) {
        return debug('received invalid request type', data.type)
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
    return {type: 'IGNORE'}
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

      const state = getState()
      const songs = state.songs
      const bannedSongs = state.sync.bannedSongs.map(x => x.id)
      theirSongs = theirSongs.filter(x => bannedSongs.indexOf(x.id) === -1)

      // Ignore all songs that we have already or that we explicitly banned
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
      remoteSongs = theirSongs.map(x => x.id)
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

  // Ban a song (do not display anymore)
  BAN_SONG: (id) => {
    return (dispatch, getState) => {
      const song = getState().songs.find(x => x.id === id)

      if (getState().interfaceStatus.showBanNotification === false) {
        dispatch({type: 'BAN_SONG', song})
        dispatch({type: 'REMOVE_PROVIDER_SONG', id})
        return
      }

      let confirm = require('../components/Confirm.jsx')
      confirm('This will completely ban the song from ever showing up again.', 'Okay, ban the song', 'Nevermind').then((value) => {
        if (value === true) {
          dispatch({type: 'BAN_SONG', song})
          dispatch({type: 'REMOVE_PROVIDER_SONG', id})
        }
      })
    }
  },

  REMOVE_BAN: (id) => ({
    type: 'REMOVE_BAN',
    id
  }),

  START_SYNC_LOOP: () => {
    return null
  },

  START_DOWNLOAD_LOOP: (timeout, interval) => {
    return (dispatch, getState) => {
      window.setTimeout(continueDownloads, timeout)
      window.setInterval(continueDownloads, interval)
      function continueDownloads () {
        var downloading = getState().songs.filter((song) => song.downloading)
        downloading.forEach((song) => {
          actions.REQUEST_SONG(song.id)(dispatch, getState)
        })
      }
    }
  },

  START_SHARING_LEVEL_SYNC_LOOP: (timeout, interval) => {
    return (dispatch, getState) => {
      window.setTimeout(muticastSharingLevel, timeout)
      window.setInterval(muticastSharingLevel, interval)
      function muticastSharingLevel () {
        actions.MULTICAST_SHARING_LEVEL()(dispatch, getState)
      }
    }
  },

  REQUEST_SONG: (id) => {
    return (dispatch, getState) => {
      debug('trying to download', id)

      var song = getState().songs.find((song) => song.id === id)
      if (song.local) {
        return
      }

      if (!song.downloading) {
        dispatch({
          type: 'TOGGLE_SONG_DOWNLOADING',
          id
        })
      }

      var providers = getState().sync.providers[id]
      providers.forEach((provider) => {
        peers.send({
          type: 'REQUEST_SONG',
          id: id
        }, provider)
      })
    }
  },

  REQUEST_SONG_FOR_FRIEND: (id) => {
    return (dispatch, getState) => {
      var stash = getState().sync.forFriends
      var song = getState().songs.some((song) => song.id === id)

      if (!song) {
        debug('peer tries to download a song we dont know yet - skipping', id)
        return
      }

      if (stash.indexOf(id) !== -1) {
        debug('we are already trying to download the song for a friend - skipping')
        return
      }

      if (song.downloading) {
        debug('we are already downloading the requested song for ourselves - skipping')
        return
      }

      var allowedPendingDownloadsForFriends = getState().sync.allowedPendingDownloadsForFriends
      if (stash.length >= allowedPendingDownloadsForFriends) {
        debug('list of pending downloads for friends too long - dropping oldest')

        var oldId = stash[0]
        var oldSong = getState().songs.find((song) => song.id === oldId)

        dispatch({
          type: 'TOGGLE_SONG_DOWNLOADING',
          id: oldId,
          value: false
        })

        if (oldSong.local && oldSong.favorite !== true) {
          debug('we probably only kept that song around for a friend - deleting', oldSong.title)

          require('./songs').REMOVE_SONG(oldId)(dispatch, getState)
        }

        dispatch({
          type: 'REMOVE_FROM_SONG_PROVIDING_CHRONOLOGY',
          id: oldId
        })
      }

      dispatch({
        type: 'PUSH_TO_SONG_PROVIDING_CHRONOLOGY',
        id
      })

      actions.REQUEST_SONG(id)(dispatch, getState)
    }
  },

  SEND_SONG: (id, peerId, arrayBuffer) => {
    return (dispatch, getState) => {
      if (!arrayBuffer) {
        var hashName = getState().songs.find((song) => song.id === id).hashName

        return fs.getArrayBuffer(hashName, (err, arrayBuffer) => {
          if (err) throw new Error('Error getting file: ' + err)

          return actions.SEND_SONG(id, peerId, arrayBuffer)(dispatch, getState)
        })
      }

      var base64String = base64.encode(arrayBuffer)

      var send = true
      var index = 1
      var size = base64String.length
      var chunkSize = 15000 // trial and error
      var chunks = Math.ceil(size / chunkSize)
      var offset = 0

      peers.remotes[peerId].write('HEADER' + JSON.stringify({
        type: 'SEND_SONG',
        id,
        chunks
      }), 'utf8')

      sendChunked()
      function sendChunked () {
        do {
          var chunk = base64String.slice(offset, offset + chunkSize)
          var msg = JSON.stringify({
            type: 'SEND_SONG',
            id: id,
            index: index++,
            chunk
          })
          send = peers.remotes[peerId].write(msg, 'utf8')
          offset += chunkSize
        } while (send && offset < size)
        if (offset < size) peers.remotes[peerId].once('drain', sendChunked)
      }
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

      var hashName = song.hashName

      fs.addArrayBuffer({
        filename: hashName,
        arrayBuffer
      }, postprocess)

      function postprocess () {
        var url = `filesystem:http://${window.location.host}/persistent/${hashName}`

        dispatch({
          type: 'FIX_SONG_FILENAME',
          id,
          filename: url
        })

        dispatch({
          type: 'TOGGLE_SONG_LOCAL',
          id
        })

        dispatch({
          type: 'TOGGLE_SONG_DOWNLOADING',
          id
        })
      }
    }
  },

  REMOVE_DOWNLOAD: (id) => {
    return (dispatch, getState) => {
      dispatch({
        type: 'TOGGLE_SONG_DOWNLOADING',
        id
      })
      if (getState().sync.forFriends.indexOf(id) !== -1) {
        dispatch({
          type: 'REMOVE_FROM_SONG_PROVIDING_CHRONOLOGY',
          id
        })
      }
    }
  },

  DOWNLOAD_ALBUM: (songs) => {
    return (dispatch, getState) => {
      songs.forEach((song) => {
        actions.REQUEST_SONG(song.id)(dispatch, getState)
      })
    }
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
  },

  SET_SHARING_LEVEL: (sharingLevel, peerId) => {
    return (dispatch, getState) => {
      actions.MULTICAST_SHARING_LEVEL(sharingLevel)(dispatch, getState)

      if (peerId === 'self') {
        dispatch({
          type: 'SET_SHARING_LEVEL_SELF',
          sharingLevel
        })
      }

      dispatch({
        type: 'SET_SHARING_LEVEL_FRIEND',
        sharingLevel
      })
    }
  },

  MULTICAST_SHARING_LEVEL: (sharingLevel) => {
    return (dispatch, getState) => {
      var devices = getState().devices
      if (!sharingLevel) sharingLevel = getState().sync.sharingLevel

      debug('multicasting sharing level to devices', sharingLevel)
      devices.forEach((device) => {
        peers.send({
          type: 'MULTICAST_SHARING_LEVEL',
          sharingLevel
        }, device.peerId)
      })
    }
  },

  RECEIVE_SHARING_LEVEL: (sharingLevel, peerId) => {
    return (dispatch, getState) => {
      var devices = getState().devices

      if (!devices.some((device) => device.peerId === peerId)) {
        debug('received sharing level from unkown device - skipping', peerId)
        return
      }

      debug('received sharing level update from device', sharingLevel, peerId)
      dispatch({
        type: 'SET_SHARING_LEVEL_DEVICE',
        peerId,
        sharingLevel
      })
    }
  },

  TOGGLE_DEVICE_REMOTE_PLAYBACK: (peerId) => {
    return (dispatch, getState) => {
      // TODO networking things
      dispatch({type: 'TOGGLE_DEVICE_REMOTE_PLAYBACK', peerId})
    }
  }
}

function Peers (dispatch, getState) {
  if (!getState) throw new Error('need getState')

  var self = this
  self.remotes = {}

  function honorSharingLevel (sharingLevel, type, devices, peerId) {
    switch (sharingLevel) {
      case 'LEECH':
        if (
          devices.indexOf(peerId) !== -1 ||
          type !== 'REQUEST_INVENTORY' ||
          type !== 'REQUEST_SONG' ||
          type !== 'MULTICAST_SHARING_LEVEL'
        ) {
          debug('I am a leech - cannot send:', type)
          debug('removing songs that are no longer available')
          actions.RECEIVE_INVENTORY([], peerId)(dispatch, getState)
          return false
        }
        break
      case 'PRIVATE':
        if (
          devices.indexOf(peerId) !== -1 ||
          type !== 'MULTICAST_SHARING_LEVEL'
        ) {
          debug('I am private - cannot send:', type)
          debug('removing songs that are no longer available')
          actions.RECEIVE_INVENTORY({}, peerId)(dispatch, getState)
          return false
        }
        break
      case 'FRIENDS':
      case 'EVERYONE':
        break
      default: return false
    }
    return true
  }

  self.add = (peer, peerId) => {
    self.remotes[peerId] = peer
    var buffer = {}

    peer.on('close', (data) => {
      if (buffer[peerId]) delete buffer[peerId]
      self.emit('close', peer, peerId)
    })

    peer.on('data', (data) => {
      if (!Buffer.isBuffer(data)) {
        self.emit('data', data, peerId)
        return
      }

      data = data.toString()

      if (data.startsWith('HEADER')) {
        data = JSON.parse(data.replace('HEADER', ''))
        debug('received HEADER for incoming ArrayBuffer', data)

        if (!buffer[peerId]) buffer[peerId] = {}

        buffer[peerId][data.id] = {
          // type: data.type,
          chunks: data.chunks,
          data: ''
        }
        return
      }

      data = JSON.parse(data)
      if (data.index < buffer[peerId][data.id].chunks) {
        buffer[peerId][data.id].data += data.chunk
        return
      }

      buffer[peerId][data.id].data += data.chunk
      var arrayBuffer = base64.decode(buffer[peerId][data.id].data)

      delete buffer[peerId][data.id]
      if (!buffer[peerId]) delete buffer[peerId]

      self.emit('data', {
        type: 'SEND_SONG',
        id: data.id,
        arrayBuffer
      }, peerId)
    })
  }

  self.remove = (peerId) => {
    delete self.remotes[peerId]
  }

  self.send = (data, peerId) => {
    debug('sending to peer', peerId, data.type)
    var sharingLevel = getState().sync.sharingLevel
    var devices = getState().devices

    if (!honorSharingLevel(sharingLevel, data.type, devices, peerId)) return

    if (!self.remotes[peerId]) {
      debug('cannot send to offline peer', peerId)
      return
    }

    self.remotes[peerId].send(data)
  }

  self.broadcast = (data) => {
    debug('broadcasting to ' + Object.keys(self.remotes).length + ' peers', data.type)
    var sharingLevel = getState().sync.sharingLevel
    var devices = getState().devices

    for (let peerId in self.remotes) {
      if (!honorSharingLevel(sharingLevel, data.type, devices, peerId)) continue

      self.remotes[peerId].send(data)
    }
  }
}

window.ri = actions.REQUEST_INVENTORY
module.exports = actions
