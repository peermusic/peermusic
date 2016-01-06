const instances = (
  state = {
    keyPair: null,
    swarm: null,
    hubUrls: [],
    receivedInvites: {},
    receivedInvitesList: [],
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

    case 'RECEIVE_INVITE':
      var receivedInvitesList = state.receivedInvitesList
      receivedInvitesList.push({
        description: action.description,
        theirPubKey: action.theirPubKey
      })

      // same here. Why is receivedInvites set?
      return Object.assign(state, {
        receivedInvitesList
      })

    default:
      return state
  }
}

module.exports = instances
