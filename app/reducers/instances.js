/*
const friend = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_FRIEND':
      return {
        description: !action.description || action.description === '' ? null : action.description,
        friendUrl: action.friendUrl
      }
    default:
      return state
  }
}
*/

const instances = (state = {
  keyPair: null,
  swarm: null,
  hubUrls: [],
  receivedInvites: {},
  issuedInvites: []
}, action) => {
  switch (action.type) {
    case 'SET_KEYPAIR':
      return {...state, keyPair: action.keyPair}
    case 'SET_HUB_URLS':
      return {...state, hubUrls:
        [...state.hubUrls, ...action.hubUrls]}
    default:
      return state
  }
}

module.exports = instances
