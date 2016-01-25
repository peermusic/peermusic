const initialState = {
  initialPopover: true,
  playingNextPanel: false,
  mobileNavigation: false,
  importingSongs: 0,
  notifications: false,
  theme: 'classic',
  showBanNotification: true,
  remotePlaybackPanel: false
}

const interfaceStatus = (state = initialState, action) => {
  switch (action.type) {
    case 'HIDE_INITIAL_POPOVER':
      return {...state, initialPopover: false}
    case 'TOGGLE_PLAYING_NEXT_PANEL':
      return {...state, playingNextPanel: !state.playingNextPanel}
    case 'TOGGLE_REMOTE_PLAYBACK_PANEL':
      return {...state, remotePlaybackPanel: !state.remotePlaybackPanel}
    case 'TOGGLE_MOBILE_NAVIGATION':
      return {...state, mobileNavigation: !state.mobileNavigation, remotePlaybackPanel: false}
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
    case 'BAN_SONG':
      return {...state, showBanNotification: false}
    default:
      return state
  }
}

module.exports = interfaceStatus
