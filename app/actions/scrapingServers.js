var actions = {

  // Add a new scraping server
  ADD_SCRAPING_SERVER: (description, serverUrl) => {
    const parts = serverUrl.split('#')

    return {
      type: 'ADD_SCRAPING_SERVER',
      description,
      serverUrl,
      url: 'http://' + parts[1] + '/',
      id: parts[2],
      key: parts[3]
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
