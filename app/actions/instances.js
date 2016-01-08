const Connect = require('connect-instances')
const debug = require('debug')('peermusic:instances:actions')
const nacl = require('tweetnacl')

var connections

var actions = {
  INSTANCES_CONNECT: () => {
    return (dispatch, getState) => {
      const state = getState()

      var keyPair = state.instances.keyPair
      if (!keyPair) {
        keyPair = nacl.box.keyPair()
        keyPair = {
          secretKey: nacl.util.encodeBase64(keyPair.secretKey),
          publicKey: nacl.util.encodeBase64(keyPair.publicKey)
        }
        dispatch({
          type: 'SET_KEYPAIR',
          keyPair
        })
      }
      debug('my UUID:', keyPair.publicKey)

      var hubUrls = state.instances.hubUrls.slice()
      var whitelist = state.instances.whitelist.slice()
      var receivedInvites = Object.assign({}, state.instances.receivedInvites)
      var issuedInvites = state.instances.issuedInvites.slice()

      var opts = {
        namespace: 'peermusic',
        receivedInvites,
        issuedInvites
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
    return (dispatch, getState) => {
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
    return (dispatch, getState) => {
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
    console.log('trying to discard')
    return (dispatch, getState) => {
      dispatch({
        type: 'DISCARD_RECEIVED_INVITE',
        index
      })
    }
  },

  DISCARD_ISSUED_INVITE: (index) => {
    console.log('trying to discard')
    return (dispatch, getState) => {
      dispatch({
        type: 'DISCARD_ISSUED_INVITE',
        index
      })
    }
  },

  INVITE_VALIDATED: (peerId, sharedSignPubKey) => {
    debug('closing invite', peerId, sharedSignPubKey)
    return (dispatch, getState) => {
      var receivedInvites = getState().instances.receivedInvites
      var issuedInvites = getState().instances.issuedInvites
      var invite, index

      if (receivedInvites[peerId]) {
        var receivedInvitesList = getState().instances.receivedInvitesList
        receivedInvitesList.some(function (elem, i) {
          if (elem.theirPubKey === peerId) {
            index = i
            return true
          }
        })
        invite = receivedInvitesList[index]
      }
      if (issuedInvites.indexOf(sharedSignPubKey) !== -1) {
        var issuedInvitesList = getState().instances.issuedInvitesList
        issuedInvitesList.some(function (elem, i) {
          if (elem.sharedSignPubKey === sharedSignPubKey) {
            index = i
            return true
          }
        })
        invite = issuedInvitesList[index]
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
    debug('removing peer', peerId)
    return (dispatch, getState) => {
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
