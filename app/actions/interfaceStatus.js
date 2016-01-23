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
  }

}

module.exports = actions
