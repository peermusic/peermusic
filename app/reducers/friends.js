const debug = require('debug')('peermusic:friends:reducers')

const friend = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_FRIEND':
      return {
        description: !action.description || action.description === '' ? null : action.description,
        peerId: action.peerId
      }
    default:
      return state
  }
}

const friends = (state = [], action) => {
  switch (action.type) {
    case 'ADD_FRIEND':
      debug('adding friend')
      return [...state, friend(undefined, action)]
    case 'REMOVE_FRIEND':
      return [...state.slice(0, action.index), ...state.slice(action.index + 1)]
    default:
      return state
  }
}

module.exports = friends
