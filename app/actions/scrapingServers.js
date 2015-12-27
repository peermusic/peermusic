var actions = {

  // Add a new scraping server
  ADD_SCRAPING_SERVER: (url, description, authentication) => {
    return {
      type: 'ADD_SCRAPING_SERVER',
      url,
      description,
      authentication
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
