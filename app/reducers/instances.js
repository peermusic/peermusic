const initialState = {
  keyPair: null,
  swarm: null,
  whitelist: [],
  hubUrls: [],
  receivedInvites: {},
  receivedInvitesList: [],
  issuedInvites: [],
  issuedInvitesList: []
}

const instances = (state = initialState, action) => {
  var reducer = {
    SET_KEYPAIR: () => ({...state, keyPair: action.keyPair}),

    ADD_HUB_URL: () => {
      if (state.hubUrls.indexOf(action.hubUrl) !== -1) return state
      return {...state, hubUrls: [...state.hubUrls, action.hubUrl]}
    },

    ISSUE_INVITE: () => {
      const issuedInvitesList = [...state.issuedInvitesList, {
        description: action.description,
        sharedSignPubKey: action.sharedSignPubKey,
        uri: action.uri
      }]
      const issuedInvites = [...state.issuedInvites, action.sharedSignPubKey]
      return {...state, issuedInvitesList, issuedInvites}
    },

    RECEIVE_INVITE: () => {
      const receivedInvitesList = [...state.receivedInvitesList, {
        description: action.description,
        theirPubKey: action.theirPubKey
      }]
      const receivedInvites = {...state.receivedInvites, ...action.invite}
      return {...state, receivedInvitesList, receivedInvites}
    },

    INVITE_VALIDATED: () => {
      var whitelist = [...state.whitelist, action.peerId]

      if (action.sharedSignPubKey) {
        // closing issued invite:
        const issuedInvites = state.issuedInvites.filter(x => x !== action.sharedSignPubKey)
        const issuedInvitesList = state.issuedInvitesList.filter(x => x.sharedSignPubKey !== action.sharedSignPubKey)
        return {...state, whitelist, issuedInvites, issuedInvitesList}
      } else {
        // closing received invite
        let receivedInvites = {...state.receivedInvites}
        delete receivedInvites[action.peerId]
        const receivedInvitesList = state.receivedInvitesList.filter(x => x.theirPubKey !== action.peerId)
        return {...state, whitelist, receivedInvites, receivedInvitesList}
      }
    },

    DISCARD_RECEIVED_INVITE: () => {
      const receivedInvitesList = [
        ...state.receivedInvitesList.slice(0, action.index),
        ...state.receivedInvitesList.slice(action.index + 1)
      ]
      return {...state, receivedInvitesList}
    },

    DISCARD_ISSUED_INVITE: () => {
      const issuedInvitesList = [
        ...state.issuedInvitesList.slice(0, action.index),
        ...state.issuedInvitesList.slice(action.index + 1)
      ]
      return {...state, issuedInvitesList}
    },

    REMOVE_PEER: () => {
      var index = state.whitelist.indexOf(action.peerId)
      const whitelist = [
        ...state.whitelist.slice(0, index),
        ...state.whitelist.slice(index + 1)
      ]
      return {...state, whitelist}
    }
  }

  return reducer[action.type] ? reducer[action.type]() : state
}

module.exports = instances
