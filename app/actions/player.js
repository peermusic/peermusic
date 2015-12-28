var engine = require('player-engine')()
var coversActions = require('./covers.js')

var actions = {

  // Synchronize the player engine with the loaded state
  PLAYER_SYNCHRONIZE: () => {
    return (dispatch, getState) => {
      // Bind the event listeners to the actions
      engine.on('timeupdate', duration => dispatch(actions.PLAYER_CURRENT_DURATION(duration)))
      engine.on('ended', () => dispatch(actions.PLAYER_NEXT_SONG()))

      // Get the current state (just after loading)
      const state = getState()

      // Set the old volume and reset playing status
      actions.PLAYER_SET_VOLUME(state.player.volume)
      dispatch(actions.PLAYER_SET_PLAYING(false))

      // Get the filename of the last played song
      const song = getSong(state.player.songId, state)
      const filename = song ? song.filename : false
      if (!filename) {
        // Old file is not here anymore :(
        dispatch(actions.PLAYER_CURRENT_DURATION(0))
      } else {
        // Old file is still here, let's load it! :)
        engine.load(filename)
        engine.seek(state.player.currentDuration)
        coversActions.GET_COVER(song.album, song.artist, song.coverId)(dispatch, getState)
      }
    }
  },

  // Set the player engine to play a song
  PLAYER_SET_SONG: (id) => {
    return (dispatch, getState) => {
      const song = getSong(id, getState())
      const filename = song ? song.filename : false
      engine.load(filename)
      engine.play()
      coversActions.GET_COVER(song.album, song.artist, song.coverId)(dispatch, getState)
      dispatch({
        type: 'PLAYER_SET_SONG',
        id
      })
    }
  },

  // Set the playing status to true or false
  PLAYER_SET_PLAYING: (playing) => {
    (playing) ? engine.play() : engine.pause()
    return {
      type: 'PLAYER_SET_PLAYING',
      playing
    }
  },

  // Seek to a position in the player
  PLAYER_SEEK: (duration) => {
    engine.seek(duration)
    return {
      type: 'PLAYER_CURRENT_DURATION',
      duration
    }
  },

  // Set the volume ofo the player
  PLAYER_SET_VOLUME: (volume) => {
    engine.volume(volume)
    return {
      type: 'PLAYER_SET_VOLUME',
      volume
    }
  },

  // Update the current duration of the player
  PLAYER_CURRENT_DURATION: (currentDuration) => {
    return {
      type: 'PLAYER_CURRENT_DURATION',
      currentDuration
    }
  },

  // Set the next song for the player (randomly)
  PLAYER_NEXT_SONG: () => {
    return (dispatch, getState) => {
      var songs = getState().songs
      var id = songs[Math.floor(Math.random() * songs.length)].id
      dispatch(actions.PLAYER_SET_SONG(id))
    }
  }

}

// Get the song off the state based on a song id
function getSong (songId, state) {
  return state.songs.filter(x => x.id === songId)[0]
}

module.exports = actions
