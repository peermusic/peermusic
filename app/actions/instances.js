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

      var hubUrls = state.instances.hubUrls
      var peers = state.instances.peers
      var receivedInvites = state.instances.receivedInvites
      var issuedInvites = state.instances.issuedInvites

      var opts = {
        namespace: 'peermusic',
        receivedInvites,
        issuedInvites
      }

      connections = new Connect(keyPair, peers, hubUrls, opts)
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
    }
  }
}

module.exports = actions
