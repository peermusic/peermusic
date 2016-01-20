// const debug = require('debug')('peermusic:sync:reducers')

const initialState = {
  providers: {},
  forFriends: [],
  allowedPendingDownloadsForFriends: 1
}

module.exports = (state = initialState, action) => {
  var reducer = {
    'SET_PROVIDER_LIST': () => {
      return {...state, providers: action.providers}
    },

    'SHIFT_SONG_PROVIDING_CHRONOLOGY': () => {
      return {...state, forFriends: state.forFriends.slice(1)}
    },

    'PUSH_TO_SONG_PROVIDING_CHRONOLOGY': () => {
      return {...state, forFriends: [...state.forFriends, action.id]}
    },

    'REMOVE_FROM_SONG_PROVIDING_CHRONOLOGY': () => {
      var index = state.forFriends.indexOf(action.id) + 1
      return {...state, forFriends: [...state.forFriends.slice(0, index - 1),
        ...state.forFriends.slice(index)]}
    },

    'RESET_SONG_PROVIDING_CHRONOLOGY': () => {
      return {...state, forFriends: []}
    }
  }

  return reducer[action.type] ? reducer[action.type]() : state
}
