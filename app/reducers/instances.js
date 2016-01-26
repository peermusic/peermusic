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
        uri: action.uri,
        ownInstance: action.ownInstance,
        sharingLevel: action.sharingLevel
      }]
      const issuedInvites = [...state.issuedInvites, action.sharedSignPubKey]
      return {...state, issuedInvitesList, issuedInvites}
    },

    RECEIVE_INVITE: () => {
      const receivedInvitesList = [...state.receivedInvitesList, {
        description: action.description,
        theirPubKey: action.theirPubKey,
        ownInstance: action.ownInstance
      }]
      const receivedInvites = {...state.receivedInvites, ...action.invite}
      return {...state, receivedInvitesList, receivedInvites}
    },

    INVITE_VALIDATED: () => {
      if (action.sharedSignPubKey) {
        // closing issued invite:
        const issuedInvites = state.issuedInvites.filter(x => x !== action.sharedSignPubKey)
        const issuedInvitesList = state.issuedInvitesList.filter(x => x.sharedSignPubKey !== action.sharedSignPubKey)
        return {...state, issuedInvites, issuedInvitesList}
      } else {
        // closing received invite
        let receivedInvites = {...state.receivedInvites}
        delete receivedInvites[action.peerId]
        const receivedInvitesList = state.receivedInvitesList.filter(x => x.theirPubKey !== action.peerId)
        return {...state, receivedInvites, receivedInvitesList}
      }
    },

    WEBRTC_WHITELIST_ADD: () => {
      if (state.whitelist.indexOf(action.peerId) !== -1) return state
      return {...state, whitelist: [...state.whitelist, action.peerId]}
    },

    WEBRTC_WHITELIST_REMOVE: () => {
      var index = state.whitelist.indexOf(action.peerId)
      const whitelist = [
        ...state.whitelist.slice(0, index),
        ...state.whitelist.slice(index + 1)
      ]
      return {...state, whitelist}
    },

    DISCARD_RECEIVED_INVITE: () => {
      const receivedInvitesList = [
        ...state.receivedInvitesList.slice(0, action.index),
        ...state.receivedInvitesList.slice(action.index + 1)
      ]
      return {...state, receivedInvitesList}
    },

    DISCARD_ISSUED_INVITE: () => {
      const index = state.issuedInvitesList.findIndex((invite) => {
        return invite.sharedSignPubKey === action.sharedSignPubKey
      })
      const issuedInvitesList = [
        ...state.issuedInvitesList.slice(0, index),
        ...state.issuedInvitesList.slice(index + 1)
      ]
      return {...state, issuedInvitesList}
    }
  }

  return reducer[action.type] ? reducer[action.type]() : state
}

module.exports = instances
