const debug = require('debug')('peermusic:sync:reducers')

const initialState = {
}

module.exports = (state = initialState, action) => {
  var reducer = {
    UPDATE_SYNCABLE_SONGS: (songs, peerId) => {
      debug('update syncable songs')
    }
  }

  return reducer[action.type] ? reducer[action.type]() : state
}
