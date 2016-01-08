const Connect = require('connect-instances')
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

      var hubUrls = state.instances.hubUrls.slice()
      var whitelist = state.instances.whitelist.slice()
      var receivedInvites = Object.assign({}, state.instances.receivedInvites)
      var issuedInvites = state.instances.issuedInvites.slice()

      var opts = {
        namespace: 'peermusic',
        receivedInvites,
        issuedInvites
      }

      connections = new Connect(keyPair, whitelist, hubUrls, opts)

      connections.metaSwarm.on('accept', function (peerId, sharedSignPubKey) {
        console.log('accept invite ----------------')
        dispatch({
          type: 'ACCEPT_INVITE',
          peerId,
          sharedSignPubKey
        })
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
  }
}

module.exports = actions
