const initialState = {
  songId: 0,
  currentDuration: 0,
  volume: 0.2,
  playing: false,
  history: {currentIndex: 0, songs: []}
}

const history = (state = {currentIndex: 0, songs: []}, action) => {
  switch (action.type) {
    case 'HISTORY_BACK':
      return {...state, currentIndex: state.currentIndex -= 1}
    case 'HISTORY_NEXT':
      return {...state, currentIndex: state.currentIndex += 1}
    case 'PLAYER_SET_SONG':
      if (action.ignoreHistory) {
        return state
      }

      // Remove the history before the current index
      var songs = [...state.songs.slice(0, state.currentIndex + 1)]
      var index = songs.length === 0 ? 0 : state.currentIndex += 1

      // Make sure that we only save a max of 25 history elements
      if (index > 25) {
        index = 25
        songs.splice(0, 1)
      }

      return {...state, songs: [...songs, action.id], currentIndex: index}
    case 'REMOVE_SONG':
      // TODO Cleanup history.songs on remove song!
    default:
      return state
  }
}

const player = (state = initialState, action) => {
  switch (action.type) {
    case 'PLAYER_SET_VOLUME':
      return {...state, volume: action.volume}
    case 'PLAYER_SET_PLAYING':
      return {...state, playing: action.playing}
    case 'PLAYER_CURRENT_DURATION':
      return {...state, currentDuration: action.currentDuration}
    case 'PLAYER_SET_SONG':
      return {
        ...state,
        songId: action.id,
        currentDuration: 0,
        playing: true,
        history: history(state.history, action)
      }
    case 'HISTORY_BACK':
    case 'HISTORY_NEXT':
      return {...state, history: history(state.history, action)}
    default:
      return state
  }
}

module.exports = player
