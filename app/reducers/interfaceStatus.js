const initialState = {
  initialPopover: true,
  playingNextPanel: false,
  mobileNavigation: false,
  importingSongs: 0,
  desktopNotifications: false
}

const interfaceStatus = (state = initialState, action) => {
  switch (action.type) {
    case 'HIDE_INITIAL_POPOVER':
      return {...state, initialPopover: false}
    case 'TOGGLE_PLAYING_NEXT_PANEL':
      return {...state, playingNextPanel: !state.playingNextPanel}
    case 'TOGGLE_MOBILE_NAVIGATION':
      return {...state, mobileNavigation: !state.mobileNavigation}
    case 'INCREMENT_IMPORTING_SONGS':
      return {...state, importingSongs: state.importingSongs + 1}
    case 'DECREMENT_IMPORTING_SONGS':
      return {...state, importingSongs: state.importingSongs - 1}
    case 'RESET_IMPORTING_SONGS':
      return {...state, importingSongs: 0}
    case 'TOGGLE_DESKTOP_NOTIFICATIONS':
      return {...state, desktopNotifications: !state.desktopNotifications}
    default:
      return state
  }
}

module.exports = interfaceStatus
