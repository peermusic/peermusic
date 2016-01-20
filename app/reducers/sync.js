// const debug = require('debug')('peermusic:sync:reducers')

const initialState = {
  providers: {},
  forFriends: []
}

module.exports = (state = initialState, action) => {
  var reducer = {
    'SET_PROVIDER_LIST': () => {
      return {...state, providers: action.providers}
    },

    'SHIFT_SYNC_FOR_FRIENDS': () => {
      return {...state, forFriends: state.forFriends.slice(1)}
    },

    'PUSH_SYNC_FOR_FRIENDS': () => {
      return {...state, forFriends: [...state.forFriends, action.id]}
    }
  }

  return reducer[action.type] ? reducer[action.type]() : state
}
