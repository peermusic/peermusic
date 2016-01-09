const instances = (
  state = {
    keyPair: null,
    swarm: null,
    whitelist: [],
    hubUrls: [],
    receivedInvites: {},
    receivedInvitesList: [],
    issuedInvites: [],
    issuedInvitesList: []
  },
  action
) => {
  var reducer = {
    'SET_KEYPAIR': x => ({...state, keyPair: action.keyPair}),

    'ADD_HUB_URL': x => {
      if (state.hubUrls.indexOf(action.hubUrl) !== -1) return state
      return {...state, hubUrls: [...state.hubUrls, action.hubUrl]}
    },

    'ISSUE_INVITE': x => {
      var issuedInvitesList = [...state.issuedInvitesList, {
        description: action.description,
        sharedSignPubKey: action.sharedSignPubKey,
        uri: action.uri
      }]
      var issuedInvites = [...state.issuedInvites, action.sharedSignPubKey]

      return {...state, issuedInvitesList, issuedInvites}
    },

    'RECEIVE_INVITE': x => {
      var receivedInvitesList = [...state.receivedInvitesList, {
        description: action.description,
        theirPubKey: action.theirPubKey
      }]
      var receivedInvites = Object.assign({}, state.receivedInvites, action.invite)

      return {...state, receivedInvitesList, receivedInvites}
    },

    'INVITE_VALIDATED': x => {
      var whitelist = [...state.whitelist, action.peerId]

      if (action.sharedSignPubKey) {
        // closing issued invite:

        var index = state.issuedInvites.indexOf(action.sharedSignPubKey)
        var issuedInvites = state.issuedInvites.filter((_, i) => i !== index)

        var issuedInvitesList = []
        index = null
        state.issuedInvitesList.some(function (elem, i) {
          if (elem.sharedSignPubKey === action.sharedSignPubKey) {
            index = i
            return true
          }
        })
        issuedInvitesList = state.issuedInvitesList.filter((_, i) => i !== index)

        return {...state, whitelist, issuedInvites, issuedInvitesList}
      } else {
        // closing received invite

        var receivedInvites = Object.assign({}, state.receivedInvites)
        delete receivedInvites[action.peerId]

        var receivedInvitesList = []
        index = null
        state.receivedInvitesList.some(function (elem, i) {
          if (elem.theirPubKey === action.peerId) {
            index = i
            return true
          }
        })
        receivedInvitesList = state.receivedInvitesList.filter((_, i) => i !== index)

        return {...state, whitelist, receivedInvites, receivedInvitesList}
      }
    },

    'DISCARD_RECEIVED_INVITE': x => {
      var receivedInvitesList = [...state.receivedInvitesList.slice(0, action.index), ...state.receivedInvitesList.slice(action.index + 1)]
      return {...state, receivedInvitesList}
    },

    'DISCARD_ISSUED_INVITE': x => {
      var issuedInvitesList = [...state.issuedInvitesList.slice(0, action.index),
        ...state.issuedInvitesList.slice(action.index + 1)]
      return {...state, issuedInvitesList}
    },

    'REMOVE_PEER': x => {
      var index = state.whitelist.indexOf(action.peerId)
      var whitelist = [...state.whitelist.slice(0, index),
        ...state.whitelist.slice(index + 1)]
      return {...state, whitelist}
    }
  }

  return reducer[action.type] ? reducer[action.type]() : state
}

module.exports = instances
