const cuid = require('cuid')
const debug = require('debug')('peermusic:sync:peers')
const EventEmitter = require('events').EventEmitter
const inherits = require('inherits')

inherits(Peers, EventEmitter)
module.exports = Peers

function Peers (dispatch, getState, peers) {
  if (!getState) throw new Error('need getState')

  var self = this
  self.remotes = {}
  self.queue = []

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
          require('../sync').RECEIVE_INVENTORY([], peerId)(dispatch, getState)
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
          require('../sync').RECEIVE_INVENTORY({}, peerId)(dispatch, getState)
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
      data = data.toString()

      if (data.startsWith('HEADER')) {
        data = JSON.parse(data.replace('HEADER', ''))

        if (!buffer[peerId]) buffer[peerId] = {}

        buffer[peerId][data.id] = {
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
      var object = JSON.parse(buffer[peerId][data.id].data)

      delete buffer[peerId][data.id]
      if (!buffer[peerId]) delete buffer[peerId]

      self.emit('data', object, peerId)
    })
  }

  self.remove = (peerId) => {
    delete self.remotes[peerId]
  }

  self.send = (object, peerId) => {
    if (object) {
      if (self.queue.find((task) => task[1] === peerId)) {
        debug('already sending to that peer - dropping send task',
          object.type ? object.type : '')
        return
      }

      if (self.queue.length > 30) {
        debug('to many packets in the backlog - dropping', object.type)
        return
      }

      self.queue.push([object, peerId])

      if (self.sending) {
        debug('already sending, queued send task #', self.queue.length, object.type)
        return
      }
    }

    self.sending = true
    var next = self.queue[0]

    self._send(next[0], next[1], () => {
      self.queue.shift()

      if (self.queue.length === 0) {
        debug('sending queue empty')
        self.sending = false
        return
      }

      self.send()
    })
  }

  self._send = (object, peerId, cb) => {
    debug('>> sending to peer', object.type, object, peerId)
    var sharingLevel = getState().sync.sharingLevel
    var devices = getState().devices

    if (!honorSharingLevel(sharingLevel, object.type, devices, peerId)) {
      cb()
      return
    }

    if (!self.remotes[peerId]) {
      debug('cannot send to offline peer', peerId)
      cb()
      return
    }

    var string = JSON.stringify(object)

    var id = cuid.slug()
    var index = 1
    var size = string.length
    var chunkSize = 15000 // trial and error
    var chunks = Math.ceil(size / chunkSize)
    var offset = 0

    function callbackOnErr (err) {
      if (err) {
        cb()
        throw err
      }
    }

    function sendChunked () {
      if (!self.remotes[peerId]) {
        debug('peer went offline - aborting transfer', peerId)
        cb()
        return
      }
      if (offset >= size) {
        cb()
        return
      }
      var chunk = string.slice(offset, offset + chunkSize)
      var msg = JSON.stringify({
        id,
        index: index++,
        chunk
      })
      offset += chunkSize
      self.remotes[peerId].write(msg, 'utf8', function (err) {
        callbackOnErr(err)
        window.setTimeout(sendChunked, Math.floor(100 / index))
      })
    }

    self.remotes[peerId].write('HEADER' + JSON.stringify({
      id,
      chunks
    }), 'utf8', function (err) {
      callbackOnErr(err)
      sendChunked()
    })
  }

  self.broadcast = (data) => {
    var sharingLevel = getState().sync.sharingLevel
    var devices = getState().devices

    for (let peerId in self.remotes) {
      if (!honorSharingLevel(sharingLevel, data.type, devices, peerId)) continue

      self.send(data, peerId)
    }
  }
}
