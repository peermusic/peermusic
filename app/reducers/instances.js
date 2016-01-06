const instances = (
  state = {
    keyPair: null,
    swarm: null,
    hubUrls: [],
    receivedInvites: {},
    issuedInvites: [],
    issuedInvitesList: [],
    inviteList: {}
  },
  action
) => {
  switch (action.type) {
    case 'SET_KEYPAIR':
      return {...state, keyPair: action.keyPair}

    case 'SET_HUB_URLS':
      return {...state, hubUrls:
        [...state.hubUrls, ...action.hubUrls]}

    case 'ISSUE_INVITE':
      var issuedInvitesList = state.issuedInvitesList
      issuedInvitesList.push({
        description: action.description,
        sharedSignPubKey: action.sharedSignPubKey,
        uri: action.uri
      })

      // issuedInvites is set too, why/where? Should be here!
      return Object.assign(state, {
        issuedInvitesList
      })

    default:
      return state
  }
}

module.exports = instances
