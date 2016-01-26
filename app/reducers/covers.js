const cover = (state = {}, action) => {
  switch (action.type) {
    case 'GET_COVER':
      return {
        id: action.id,
        url: action.url,
        filename: action.filename
      }
    default:
      return state
  }
}

const covers = (state = [], action) => {
  switch (action.type) {
    case 'GET_COVER':
      return [...state, cover(undefined, action)]
    default:
      return state
  }
}

module.exports = covers
