module.exports = (state = [], action) => {
  var reducer = {
    'FAVORITE_SONG': () => {
      return [...state, {...action.song, favorite: true}]
    },

    'REMOVE_FAVORITE': () => {
      return state.filter(x => x.id !== action.id)
    }
  }

  return reducer[action.type] ? reducer[action.type]() : state
}
