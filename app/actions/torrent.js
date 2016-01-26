var arrayBufferToBuffer = require('arraybuffer-to-buffer')
var createTorrent = require('create-torrent')
const debug = require('debug')('peermusic:torrent:actions')
var WebTorrent = require('webtorrent')
var fs = require('file-system')(['', 'audio/mp3', 'audio/wav', 'audio/ogg'])

var client

var actions = {
  INIT_WEBTORRENT: () => {
    client = new WebTorrent()
  },

  TORRENT_ADD: (songId) => {
    return (dispatch, getState) => {
      var song = getState().songs.find((song) => song.id === songId)
      client.add(song.torrent, () => {
        console.log('torrend added', arguments)
      })
    }
  }
}

module.exports = actions
