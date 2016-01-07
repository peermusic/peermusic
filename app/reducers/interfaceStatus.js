const initialState = {
  initialPopover: true,
  playingNextPanel: false
}

const interfaceStatus = (state = initialState, action) => {
  switch (action.type) {
    case 'HIDE_INITIAL_POPOVER':
      return {...state, initialPopover: false}
    case 'TOGGLE_PLAYING_NEXT_PANEL':
      return {...state, playingNextPanel: !state.playingNextPanel}
    default:
      return state
  }
}

module.exports = interfaceStatus
