const initialState = {
  initialPopover: true,
  playingNextPanel: false,
  horizontalNavigations: {},
  mobileNavigation: false
}

const interfaceStatus = (state = initialState, action) => {
  switch (action.type) {
    case 'HIDE_INITIAL_POPOVER':
      return {...state, initialPopover: false}
    case 'TOGGLE_PLAYING_NEXT_PANEL':
      return {...state, playingNextPanel: !state.playingNextPanel}
    case 'TOGGLE_MOBILE_NAVIGATION':
      return {...state, mobileNavigation: !state.mobileNavigation}
    case 'TOGGLE_HORIZONTAL_NAVIGATION':
      let tmp = {...state.horizontalNavigations}
      tmp[action.identifier] = action.index
      return {...state, horizontalNavigations: tmp}
    default:
      return state
  }
}

module.exports = interfaceStatus
