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
    default:
      return state
  }
}

const songs = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_SONG':
      return {...state, [action.song.id]: action.song}
    case 'TOGGLE_SONG_FAVORITE':
      return state.map(s => song(s, action))
    case 'REMOVE_SONG':
      return state.filter(x => x.id !== action.id)
    case 'CLEAR_DATA':
      return []
    case 'UPDATE_SYNCABLE_SONGS':
      return mergeSongObjects(state, action.songs, action.peerId)
    default:
      return state
  }
}

module.exports = songs
