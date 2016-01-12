// const debug = require('debug')('peermusic:sync:reducers')

const initialState = {
  providers: {}
}

module.exports = (state = initialState, action) => {
  var reducer = {
  }

  return reducer[action.type] ? reducer[action.type]() : state
}
