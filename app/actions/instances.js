const Connect = require('connect-instances')
const debug = require('debug')('peermusic:instances:actions')
const nacl = require('tweetnacl')

var connections

var actions = {
  INSTANCES_CONNECT: () => {
    return (dispatch, getState) => {
      const state = getState()

      function generateKeyPair () {
        var keyPair = nacl.box.keyPair()
        keyPair = {
          secretKey: nacl.util.encodeBase64(keyPair.secretKey),
          publicKey: nacl.util.encodeBase64(keyPair.publicKey)
        }
        dispatch({
          type: 'SET_KEYPAIR',
          keyPair
        })
        return keyPair
      }

      var keyPair = state.instances.keyPair
      if (!keyPair) keyPair = generateKeyPair()
      debug('my UUID:', keyPair.publicKey)

      var hubUrls = [...state.instances.hubUrls]
      var whitelist = [...state.instances.whitelist]
      var opts = {
        namespace: 'peermusic',
        receivedInvites: {...state.instances.receivedInvites},
        issuedInvites: [...state.instances.issuedInvites]
      }

      debug('connecting to', hubUrls)
      connections = new Connect(keyPair, whitelist, hubUrls, opts)

      connections.metaSwarm.on('accept', function (peerId, sharedSignPubKey) {
        debug('invite validated', peerId, sharedSignPubKey)
        actions.INVITE_VALIDATED(peerId, sharedSignPubKey)(dispatch, getState)
      })
      connections.metaSwarm.on('connect', function (peer, peerId) {
        debug('peer connected', peerId)
      })
    }
  },

  ISSUE_INVITE: (description, hubUrl) => {
    var invite = connections.issueInvite(hubUrl)
    return (dispatch) => {
      dispatch({
        type: 'ISSUE_INVITE',
        description,
        sharedSignPubKey: invite[0],
        uri: invite[1]
      })
      dispatch({
        type: 'ADD_HUB_URL',
        hubUrl
      })
    }
  },

  RECEIVE_INVITE: (description, uri) => {
    var invite = connections.receiveInvite(uri)
    return (dispatch) => {
      dispatch({
        type: 'RECEIVE_INVITE',
        description,
        theirPubKey: invite[1],
        invite: invite[2]
      })
      dispatch({
        type: 'ADD_HUB_URL',
        hubUrl: invite[0]
      })
    }
  },

  DISCARD_RECEIVED_INVITE: (index) => {
    return (dispatch) => {
      dispatch({
        type: 'DISCARD_RECEIVED_INVITE',
        index
      })
    }
  },

  DISCARD_ISSUED_INVITE: (index) => {
    return (dispatch) => {
      dispatch({
        type: 'DISCARD_ISSUED_INVITE',
        index
      })
    }
  },

  INVITE_VALIDATED: (peerId, sharedSignPubKey) => {
    return (dispatch, getState) => {
      var receivedInvites = getState().instances.receivedInvites
      var issuedInvites = getState().instances.issuedInvites
      var invite

      if (receivedInvites[peerId]) {
        var receivedInvitesList = getState().instances.receivedInvitesList
        invite = receivedInvitesList.filter(x => x.theirPubKey === peerId)[0]
      }
      if (issuedInvites.indexOf(sharedSignPubKey) !== -1) {
        var issuedInvitesList = getState().instances.issuedInvitesList
        invite = issuedInvitesList.filter(x => x.sharedSignPubKey === sharedSignPubKey)[0]
      }

      dispatch({
        type: 'ADD_FRIEND',
        description: invite.description,
        peerId
      })
      dispatch({
        type: 'INVITE_VALIDATED',
        peerId,
        sharedSignPubKey
      })
    }
  },

  REMOVE_PEER: (peerId, index) => {
    return (dispatch) => {
      dispatch({
        type: 'REMOVE_FRIEND',
        index
      })
      dispatch({
        type: 'REMOVE_PEER',
        peerId
      })
    }
  }
}

module.exports = actions
