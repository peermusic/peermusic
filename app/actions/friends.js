var actions = {

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
