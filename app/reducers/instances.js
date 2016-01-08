const debug = require('debug')('peermusic:instances:reducers')

const instances = (
  state = {
    keyPair: null,
    swarm: null,
    whitelist: [],
    hubUrls: [],
    receivedInvites: {},
    receivedInvitesList: [],
    issuedInvites: [],
    issuedInvitesList: [],
    inviteList: {}
  },
  action
) => {
  var index, issuedInvites, issuedInvitesList, receivedInvites, receivedInvitesList, whitelist
  switch (action.type) {
    case 'SET_KEYPAIR':
      return {...state, keyPair: action.keyPair}

    case 'ADD_HUB_URL':
      if (state.hubUrls.indexOf(action.hubUrl) !== -1) return state
      return {...state, hubUrls: [...state.hubUrls, action.hubUrl]}

    case 'ISSUE_INVITE':
      issuedInvitesList = [...state.issuedInvitesList, {
        description: action.description,
        sharedSignPubKey: action.sharedSignPubKey,
        uri: action.uri
      }]
      issuedInvites = [...state.issuedInvites, action.sharedSignPubKey]
      return {...state, issuedInvitesList, issuedInvites}

    case 'RECEIVE_INVITE':
      receivedInvitesList = [...state.receivedInvitesList, {
        description: action.description,
        theirPubKey: action.theirPubKey
      }]
      receivedInvites = Object.assign({}, state.receivedInvites, action.invite)
      return {...state, receivedInvitesList, receivedInvites}

    case 'INVITE_VALIDATED':
      debug('closing invite')
      whitelist = [...state.whitelist, action.peerId]
      if (action.sharedSignPubKey) {
        debug('closing issued invite')
        index = state.issuedInvites.indexOf(action.sharedSignPubKey)
        issuedInvites = state.issuedInvites.filter((_, i) => i !== index)
        // removing from pending invite list
        issuedInvitesList = []
        index = null
        state.issuedInvitesList.some(function (elem, i) {
          if (elem.sharedSignPubKey === action.sharedSignPubKey) {
            index = i
            return true
          }
        })
        issuedInvitesList = state.issuedInvitesList.filter((_, i) => i !== index)
        return {...state, whitelist, issuedInvites, issuedInvitesList}
      }
      receivedInvites = Object.assign({}, state.receivedInvites)
      delete receivedInvites[action.peerId]
      // removing from pending invite list
      receivedInvitesList = []
      index = null
      state.receivedInvitesList.some(function (elem, i) {
        if (elem.theirPubKey === action.peerId) {
          index = i
          return true
        }
      })
      receivedInvitesList = state.receivedInvitesList.filter((_, i) => i !== index)
      return {...state, whitelist, receivedInvites, receivedInvitesList}

    case 'DISCARD_RECEIVED_INVITE':
      receivedInvitesList = [...state.receivedInvitesList.slice(0, action.index), ...state.receivedInvitesList.slice(action.index + 1)]
      return {...state, receivedInvitesList}

    case 'DISCARD_ISSUED_INVITE':
      issuedInvitesList = [...state.issuedInvitesList.slice(0, action.index),
        ...state.issuedInvitesList.slice(action.index + 1)]
      console.log(issuedInvitesList)
      return {...state, issuedInvitesList}

    case 'REMOVE_PEER':
      debug('removing peer', action.peerId)
      index = state.whitelist.indexOf(action.peerId)
      whitelist = [...state.whitelist.slice(0, index),
        ...state.whitelist.slice(index + 1)]
      return {...state, whitelist}

    default:
      return state
  }
}

module.exports = instances
