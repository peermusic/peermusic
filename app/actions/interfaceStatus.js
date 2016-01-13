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

  // Toggle the horizontal navigation for a specified key to the specified index
  TOGGLE_HORIZONTAL_NAVIGATION: (identifier, index) => {
    return {
      type: 'TOGGLE_HORIZONTAL_NAVIGATION',
      identifier,
      index
    }
  },

  // Toggle the navigation state for mobile
  TOGGLE_MOBILE_NAVIGATION: () => ({
    type: 'TOGGLE_MOBILE_NAVIGATION'
  })

}

module.exports = actions
