// const debug = require('debug')('peermusic:sync:reducers')

const initialState = {
  providers: {},
  sharingLevel: 'FRIENDS'
}

module.exports = (state = initialState, action) => {
  var reducer = {
    'SET_PROVIDER_LIST': () => {
      return {...state, providers: action.providers}
    },
    'SET_SHARING_LEVEL': () => {
      return {...state, sharingLevel: action.sharingLevel}
    }
  }

  return reducer[action.type] ? reducer[action.type]() : state
}
