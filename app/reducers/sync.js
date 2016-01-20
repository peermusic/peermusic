// const debug = require('debug')('peermusic:sync:reducers')

const initialState = {
  providers: {},
  downloads: []
}

module.exports = (state = initialState, action) => {
  var reducer = {
    'SET_PROVIDER_LIST': () => {
      return {...state, providers: action.providers}
    },

    PERSIST_DOWNLOAD: () => {
      if (state.downloads.indexOf(action.id) !== -1) return state
      return {...state, downloads: [...state.downloads, action.id]}
    },

    CLEAR_DOWNLOAD: () => {
      if (state.downloads.indexOf(action.id) === -1) return state
      var index = state.downloads.indexOf(action.id)
      return {...state, downloads: state.downloads.filter((_, i) => i !== index)}
    }
  }

  return reducer[action.type] ? reducer[action.type]() : state
}
