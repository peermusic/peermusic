const initialState = {
  initialPopover: true,
  playingNextPanel: false,
  mobileNavigation: false,
  importingSongs: 0,
  notifications: false,
  theme: 'classic',
  showBanNotification: true,
  showPlaylistHint: false
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
    case 'TOGGLE_THEME':
      return {...state, theme: action.theme}
    case 'TOGGLE_NOTIFICATIONS':
      return {...state, notifications: !state.notifications}
    case 'SHOW_PLAYLIST_HINT':
      return {...state, showPlaylistHint: true}
    case 'HIDE_PLAYLIST_HINT':
      return {...state, showPlaylistHint: false}
    case 'BAN_SONG':
      return {...state, showBanNotification: false}
    default:
      return state
  }
}

module.exports = interfaceStatus
