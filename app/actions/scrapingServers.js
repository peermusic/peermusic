const nacl = require('tweetnacl')

var actions = {

  // Add a new scraping server
  ADD_SCRAPING_SERVER: (description, serverUrl) => {
    // Parse the URL into parts and generate the public key of the private key
    const regex = /^peermusic:\/\/([^#]*)#([^:]*):(.*)$/
    const matches = serverUrl.replace(regex, '$1~~~$2~~~$3').split('~~~')
    const keyPair = nacl.sign.keyPair.fromSecretKey(nacl.util.decodeBase64(matches[2]))

    return {
      type: 'ADD_SCRAPING_SERVER',
      description,
      serverUrl,
      url: 'http://' + matches[0],
      id: matches[1],
      keyPair: {
        publicKey: nacl.util.encodeBase64(keyPair.publicKey),
        secretKey: nacl.util.encodeBase64(keyPair.secretKey)
      }
    }
  },

  // Remove a scraping server
  REMOVE_SCRAPING_SERVER: (index) => {
    return {
      type: 'REMOVE_SCRAPING_SERVER',
      index
    }
  }

}

module.exports = actions
