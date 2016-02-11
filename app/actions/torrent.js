const debug = require('debug')('peermusic:torrent:actions')
var WebTorrent = require('webtorrent')

var client

var actions = {
  INIT_WEBTORRENT: () => {
    if (client && !client.destroyed) {
      debug('torrent client already running')
      return
    }

    client = new WebTorrent()
    debug('WebTorrent client initialised')

    window.onunload = actions.DESTROY_WEBTORRENT
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
