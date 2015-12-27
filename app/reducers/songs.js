const song = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_SONG':
      return action.song
    default:
      return state
  }
}

const songs = (state = [], action) => {
  switch (action.type) {
    case 'ADD_SONG':
      if (state.filter(x => x.id === action.song.id).length > 0) {
        return state
      }
      return [...state, song(undefined, action)]
    case 'REMOVE_SONG':
      return state.filter(x => x.id !== action.id)
    case 'CLEAR_DATA':
      return []
    default:
      return state
  }
}

module.exports = songs
