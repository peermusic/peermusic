const debug = require('debug')('peermusic:devices:reducers')

const device = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_DEVICE':
      return {
        description: !action.description || action.description === '' ? null : action.description,
        peerId: action.peerId
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
      return [...state.slice(0, action.index), ...state.slice(action.index + 1)]
    default:
      return state
  }
}

module.exports = devices
