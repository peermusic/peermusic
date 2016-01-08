const Connect = require('connect-instances')
const debug = require('debug')('peermusic:instances')
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
      window.c = connections

      connections.metaSwarm.on('accept', function (peerId, sharedSignPubKey) {
        debug('invite accepted', peerId, sharedSignPubKey)
        dispatch({
          type: 'ACCEPT_INVITE',
          peerId,
          sharedSignPubKey
        })
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
  }
}

module.exports = actions
