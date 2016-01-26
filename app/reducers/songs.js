const song = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_SONG':
    case 'ADD_PROVIDER_SONG':
      return action.song
    case 'TOGGLE_SONG_FAVORITE':
      if (state.id !== action.id) {
        return state
      }

      return {
        ...state,
        favorite: !state.favorite
      }
    case 'TOGGLE_SONG_LOCAL':
      if (state.id !== action.id) {
        return state
      }

      return {
        ...state,
        local: !state.local
      }
    case 'TOGGLE_SONG_DOWNLOADING':
      if (state.id !== action.id) {
        return state
      }

      return {
        ...state,
        downloading: action.value || !state.downloading
      }
    case 'TOGGLE_SONG_FOR_FRIEND':
      if (state.id !== action.id) {
        return state
      }

      return {
        ...state,
        forFriend: action.value || !state.forFriend
      }
    case 'SET_SONG_DURATION':
      if (state.id !== action.id) {
        return state
      }

      return {
        ...state,
        duration: action.duration
      }
    case 'FIX_SONG_FILENAME':
      if (state.id !== action.id) {
        return state
      }

      return {
        ...state,
        filename: action.filename
      }
    default:
      return state
  }
}

const songs = (state = [], action) => {
  switch (action.type) {
    case 'ADD_SONG':
      if (state.filter(x => x.local && x.id === action.song.id).length > 0) {
        return state
      }
      return [...state.filter(x => x.id !== action.song.id), song(undefined, action)]
    case 'ADD_PROVIDER_SONG':
      if (state.filter(x => x.id === action.song.id).length > 0) {
        return state
      }
      return [...state, song(undefined, action)]
    case 'SET_SONG_DURATION':
      return state.map(s => song(s, action))
    case 'TOGGLE_SONG_FAVORITE':
      return state.map(s => song(s, action))
    case 'TOGGLE_SONG_LOCAL':
      return state.map(s => song(s, action))
    case 'TOGGLE_SONG_DOWNLOADING':
      return state.map(s => song(s, action))
    case 'TOGGLE_SONG_FOR_FRIEND':
      return state.map(s => song(s, action))
    case 'REMOVE_SONG':
      return state.filter(x => x.id !== action.id)
    case 'REMOVE_PROVIDER_SONG':
      return state.filter(x => x.local || x.id !== action.id)
    case 'FIX_SONG_FILENAME':
      return state.map(s => song(s, action))
    default:
      return state
  }
}

module.exports = songs
