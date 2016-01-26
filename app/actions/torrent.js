const debug = require('debug')('peermusic:torrent:actions')
var WebTorrent = require('webtorrent')

var client

var actions = {
  INIT_WEBTORRENT: () => {
    client = new WebTorrent()
  },

  DOWNLOAD_TORRENT: (torrent, songId) => {
    return (dispatch, getState) => {
      torrent = new Buffer(torrent)

      debug('adding new torrent file')
      client.download(torrent, (torrent) => {
        debug('torrent downloaded - saving', torrent)

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

              require('./sync').RECEIVE_SONG(songId, toArrayBuffer(buffer))(dispatch, getState)
            })
          })
        })
      })
    }
  }
}

module.exports = actions
