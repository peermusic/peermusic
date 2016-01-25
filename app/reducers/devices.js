const debug = require('debug')('peermusic:devices:reducers')

const device = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_DEVICE':
      return {
        description: !action.description || action.description === '' ? null : action.description,
        peerId: action.peerId,
        sharingLevel: action.sharingLevel
      }
    case 'SET_SHARING_LEVEL_DEVICE':
      if (action.peerId !== state.peerId) return

      return {
        ...state,
        sharingLevel: action.sharingLevel
      }
    case 'TOGGLE_DEVICE_REMOTE_PLAYBACK':
      if (action.peerId !== state.peerId) return

      return {
        ...state,
        remotePlayback: !state.remotePlayback
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
    case 'SET_SHARING_LEVEL_DEVICE':
      return state.map(s => device(s, action))
    case 'TOGGLE_DEVICE_REMOTE_PLAYBACK':
      return state.map(s => device(s, action))
    default:
      return state
  }
}

module.exports = devices
