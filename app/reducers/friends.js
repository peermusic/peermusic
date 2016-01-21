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
      var index = state.findIndex((friend) => friend.peerId = action.peerId)
      if (index === -1) return state
      return [...state.slice(0, index), ...state.slice(index + 1)]
    default:
      return state
  }
}

module.exports = friends
