const song = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_SONG':
      return action.song
    case 'TOGGLE_SONG_FAVORITE':
      if (state.id !== action.id) {
        return state
      }

      return {
        ...state,
        favorite: !state.favorite
      }
    case 'SET_SONG_DURATION':
      if (state.id !== action.id) {
        return state
      }

      return {
        ...state,
        duration: action.duration
      }
    default:
      return state
  }
}

const songs = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_SONG':
      return {...state, [action.song.id]: action.song}
    case 'SET_SONG_DURATION':
      return state.map(s => song(s, action))
    case 'TOGGLE_SONG_FAVORITE':
      return state.map(s => song(s, action))
    case 'REMOVE_SONG':
      var newState = Object.assign({}, state)
      delete newState[action.id]
      return newState
    case 'CLEAR_DATA':
      return []
    default:
      return state
  }
}

module.exports = songs
