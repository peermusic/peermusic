const debug = require('debug')('peermusic:devices:reducers')

const device = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_DEVICE':
      return {
        description: !action.description || action.description === '' ? null : action.description,
        peerId: action.peerId,
        sharingLevel: action.sharingLevel
      }
    default:
      return state
  }
}

const devices = (state = [], action) => {
  switch (action.type) {
    case 'ADD_DEVICE':
      debug('adding device')
      return [...state, device(undefined, action)]
    case 'REMOVE_DEVICE':
      var index = state.findIndex((device) => device.peerId = action.peerId)
      if (index === -1) return state
      return [...state.slice(0, index), ...state.slice(index + 1)]
    default:
      return state
  }
}

module.exports = devices
