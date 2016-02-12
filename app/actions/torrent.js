const debug = require('debug')('peermusic:torrent:actions')
var WebTorrent = require('webtorrent')
var fs = require('file-system')(['', 'audio/mp3'])

var client

var actions = {
  INIT_WEBTORRENT: () => {
    return (dispatch, getState) => {
      if (client && !client.destroyed) {
        debug('torrent client already running')
        return
      }

      client = new WebTorrent()
      debug('WebTorrent client initialised')

      window.onunload = actions.DESTROY_WEBTORRENT

      actions.SEED_TORRENTS()(dispatch, getState)
    }
  },

  DESTROY_WEBTORRENT: () => {
    if (!client || client.destroyed) {
      debug('torrent client already destroyed')
      return
    }

    client.destroy((err) => {
      if (err) throw err
      debug('WebTorrent client destroyed')
    })
  },

  SEED_TORRENTS: () => {
    return (dispatch, getState) => {
      var localSongs = getState().songs.filter((song) => song.local)

      localSongs.forEach((song) => {
        fs.getFile(song.hashName, (err, file) => {
          if (err) throw err

          file.file((file) => {
            client.seed(file, [], (torrent) => {
              debug('seeding torrent:', torrent)

              torrent.on('wire', () => {
                debug('peer connected to download torrent', torrent)
              })
            })
          })
        })
      })
    }
  },

  CANCEL_TORRENT: (songId) => {
    return (dispatch, getState) => {
      var torrent = getState().songs.find((song) => song.id === songId).torrent

      client.remove(new Buffer(torrent), (err) => {
        if (err) throw err
        debug('torrent download cancelled')
      })
    }
  },

  DOWNLOAD_TORRENT: (torrent, songId) => {
    return (dispatch, getState) => {
      torrent = new Buffer(torrent)

      client.download(torrent, (torrent) => {
        debug('added torrent file', torrent)

        torrent.on('download', function () {
          debug('downloading torrent', torrent, torrent.downloaded)
        })

        torrent.on('done', function () {
          debug('torrent finished downloading')
          torrent.files.forEach(function (file) {
            file.getBuffer(function (err, buffer) {
              if (err) throw err

              function toArrayBuffer (buffer) {
                var arrayBuffer = new ArrayBuffer(buffer.length)
                var uin8Array = new Uint8Array(arrayBuffer)
                for (var i = 0; i < buffer.length; ++i) {
                  uin8Array[i] = buffer[i]
                }
                return uin8Array
              }

              require('./sync').RECEIVE_SONG(songId, toArrayBuffer(buffer), true)(dispatch, getState)
            })
          })
        })
      })
    }
  }
}

module.exports = actions
