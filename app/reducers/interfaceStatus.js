const initialState = {
  initialPopover: true,
  playingNextPanel: false,
  horizontalNavigations: {},
  mobileNavigation: false,
  importingSongs: 0
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
    case 'INCREMENT_IMPORTING_SONGS':
      return {...state, importingSongs: state.importingSongs + 1}
    case 'DECREMENT_IMPORTING_SONGS':
      return {...state, importingSongs: state.importingSongs - 1}
    case 'RESET_IMPORTING_SONGS':
      return {...state, importingSongs: 0}
    default:
      return state
  }
}

module.exports = interfaceStatus
