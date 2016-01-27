const debug = require('debug')('peermusic:devices:reducers')

const device = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_DEVICE':
      return {
        description: !action.description || action.description === '' ? null : action.description,
        peerId: action.peerId,
        sharingLevel: action.sharingLevel
      }
    case 'SET_SHARING_LEVEL':
      if (state.peerId !== action.peerId) return state

      return {
        ...state,
        sharingLevel: action.sharingLevel
      }
    case 'SET_ONLINE_STATE_DEVICE':
      if (state.peerId !== action.peerId) return state

      return {
        ...state,
        online: action.online
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
      console.log('REMOVE_DEVICE', action.peerId, '')
      var index = state.findIndex((device) => device.peerId === action.peerId)
      if (index === -1) return state
      return [...state.slice(0, index), ...state.slice(index + 1)]
    case 'SET_SHARING_LEVEL':
      return state.map(s => device(s, action))
    case 'SET_ONLINE_STATE_DEVICE':
      return state.map(s => device(s, action))
    default:
      return state
  }
}

module.exports = devices
