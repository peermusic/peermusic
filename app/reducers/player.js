const initialState = {
  songId: 0,
  currentDuration: 0,
  volume: 0.2,
  playing: false
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
      return {...state, songId: action.id, currentDuration: 0, playing: true}
    default:
      return state
  }
}

module.exports = player
