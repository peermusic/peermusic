// const debug = require('debug')('peermusic:sync:reducers')

const initialState = {
  providers: {},
  sharingLevel: 'FRIENDS',
  forFriends: [],
  allowedPendingDownloadsForFriends: 50,
  bannedSongs: [],
  deviceListVersion: 0
}

module.exports = (state = initialState, action) => {
  var reducer = {
    'SET_PROVIDER_LIST': () => {
      return {...state, providers: action.providers}
    },

    'SET_SHARING_LEVEL_SELF': () => {
      return {...state, sharingLevel: action.sharingLevel}
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
    },

    'BAN_SONG': () => {
      return {...state, bannedSongs: [...state.bannedSongs, action.song]}
    },

    'REMOVE_BAN': () => {
      return {...state, bannedSongs: state.bannedSongs.filter(x => x.id !== action.id)}
    },

    'UPDATED_DEVICE_LIST': () => {
      return {...state, deviceListVersion: action.version
        ? action.version
        : state.deviceListVersion + 1}
    }
  }

  return reducer[action.type] ? reducer[action.type]() : state
}
