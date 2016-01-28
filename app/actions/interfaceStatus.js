var actions = {

  // Hide the initial popover on first application startup
  HIDE_INITIAL_POPOVER: () => {
    return {
      type: 'HIDE_INITIAL_POPOVER'
    }
  },

  // Show / hide the playing next panel on the right side
  TOGGLE_PLAYING_NEXT_PANEL: () => {
    return {
      type: 'TOGGLE_PLAYING_NEXT_PANEL'
    }
  },

  // Toggle the navigation state for mobile
  TOGGLE_MOBILE_NAVIGATION: () => ({
    type: 'TOGGLE_MOBILE_NAVIGATION'
  }),

  // Toggle desktop notifications
  TOGGLE_NOTIFICATIONS: () => {
    return (dispatch, getState) => {
      const state = getState()

      if (!state.interfaceStatus.notifications && window.Notification.permission !== 'granted') {
        window.Notification.requestPermission()
      }

      dispatch({type: 'TOGGLE_NOTIFICATIONS'})
    }
  },

  TOGGLE_THEME: (theme) => {
    return (dispatch, getState) => {
      dispatch({type: 'TOGGLE_THEME', theme})
      actions.LOAD_THEME()(dispatch, getState)
    }
  },

  // Change the theme
  LOAD_THEME: () => {
    return (dispatch, getState) => {
      const theme = getState().interfaceStatus.theme
      const href = `build/theme-${theme}.css`

      // Remove the current theme stylesheet
      let currentLink = document.querySelector('#style')
      let head = currentLink.parentElement
      head.removeChild(currentLink)

      // Add the new theme stylesheet
      let newLink = document.createElement('link')
      newLink.setAttribute('id', 'style')
      newLink.setAttribute('rel', 'stylesheet')
      newLink.setAttribute('href', href)
      head.appendChild(newLink)
    }
  },

  // Show the playlist hint on the top
  SHOW_PLAYLIST_HINT: () => ({
    type: 'SHOW_PLAYLIST_HINT'
  }),

  // Hide the playlist hint on the top
  HIDE_PLAYLIST_HINT: () => {
    return (dispatch, getState) => {
      dispatch({
        type: 'HIDE_PLAYLIST_HINT'
      })
    }
  }
}

module.exports = actions
