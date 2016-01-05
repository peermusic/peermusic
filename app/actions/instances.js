var Connect = require('connect-instances')
var nacl = require('tweetnacl')

var swarm

var actions = {
  // Connect to associated instances
  INSTANCES_CONNECT: () => {
    return (dispatch, getState) => {
      // Get the current state (just after loading)
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

      swarm = new Connect(keyPair, peers, hubUrls, opts)
    }
  },

  ISSUE_INVITE: () => {
  },

  RECEIVE_INVITE: () => {
    console.log(swarm)
  },

  // Add a new scraping server
  ADD_FRIEND: (description, friendUrl) => {
    return {
      type: 'ADD_FRIEND',
      description,
      friendUrl
    }
  },

  // Remove a scraping server
  REMOVE_FRIEND: (index) => {
    return {
      type: 'REMOVE_FRIEND',
      index
    }
  }

}

module.exports = actions
