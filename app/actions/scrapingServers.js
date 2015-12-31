var actions = {

  // Add a new scraping server
  ADD_SCRAPING_SERVER: (description, serverUrl) => {
    // Parse the URL into parts and generate the public key of the private key
    const regex = /^peermusic:\/\/([^#]*)#([^:]*):(.*)$/
    const matches = serverUrl.replace(regex, '$1~~~$2~~~$3').split('~~~')

    return {
      type: 'ADD_SCRAPING_SERVER',
      description,
      serverUrl,
      url: 'http://' + matches[0],
      id: matches[1],
      key: matches[2]
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
