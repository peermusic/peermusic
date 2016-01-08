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
  var issuedInvites, receivedInvites
  switch (action.type) {
    case 'SET_KEYPAIR':
      return {...state, keyPair: action.keyPair}

    case 'ADD_HUB_URL':
      if (state.hubUrls.indexOf(action.hubUrl) !== -1) return state
      return {...state, hubUrls: [...state.hubUrls, action.hubUrl]}

    case 'ISSUE_INVITE':
      var issuedInvitesList = [...state.issuedInvitesList, {
        description: action.description,
        sharedSignPubKey: action.sharedSignPubKey,
        uri: action.uri
      }]
      issuedInvites = [...state.issuedInvites, action.sharedSignPubKey]
      return {...state, issuedInvitesList, issuedInvites}

    case 'RECEIVE_INVITE':
      var receivedInvitesList = [...state.receivedInvitesList, {
        description: action.description,
        theirPubKey: action.theirPubKey
      }]
      receivedInvites = [...state.receivedInvites, action.invite]
      return {...state, receivedInvitesList, receivedInvites}

    case 'ACCEPT_INVITE':
      var whitelist = [...state.whitelist, action.peerId]
      if (action.sharedSignPubKey) {
        var index = state.sharedSignPubKey.indexOf(action.sharedSignPubKey)
        console.log('removing item', index, 'from', action.sharedSignPubKey)
        issuedInvites = state.sharedSignPubKey.filter((_, i) => i !== index)
        return {...state, whitelist, issuedInvites}
      }
      receivedInvites = Object.assign({}, state.receivedInvites)
      delete receivedInvites[action.peerId]
      return {...state, whitelist, receivedInvites}

    default:
      return state
  }
}

module.exports = instances
