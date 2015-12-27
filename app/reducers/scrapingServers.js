const scrapingServer = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_SCRAPING_SERVER':
      return {
        url: action.url,
        description: !action.description || action.description === '' ? null : action.description,
        authorization: action.authorization
      }
    default:
      return state
  }
}

const scrapingServers = (state = [], action) => {
  switch (action.type) {
    case 'ADD_SCRAPING_SERVER':
      return [...state, scrapingServer(undefined, action)]
    case 'REMOVE_SCRAPING_SERVER':
      return [...state.slice(0, action.index), ...state.slice(action.index + 1)]
    case 'CLEAR_DATA':
      return []
    default:
      return state
  }
}

module.exports = scrapingServers
