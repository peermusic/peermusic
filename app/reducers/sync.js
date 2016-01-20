// const debug = require('debug')('peermusic:sync:reducers')

const initialState = {
  providers: {}
}

module.exports = (state = initialState, action) => {
  var reducer = {
    'SET_PROVIDER_LIST': () => {
      return {...state, providers: action.providers}
    }
  }

  return reducer[action.type] ? reducer[action.type]() : state
}
