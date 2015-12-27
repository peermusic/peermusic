const initialState = {
  playingNextPanel: false
}

const interfaceStatus = (state = initialState, action) => {
  switch (action.type) {
    case 'TOGGLE_PLAYING_NEXT_PANEL':
      return {...state, playingNextPanel: !state.playingNextPanel}
    default:
      return state
  }
}

module.exports = interfaceStatus
