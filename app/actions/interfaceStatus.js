var actions = {

  // Hide the inital popover on first application startup
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
  }

}

module.exports = actions
