var engine = require('player-engine')()
var fs = require('file-system')(64 * 1024 * 1024, ['audio/mp3', 'audio/wav', 'audio/ogg'])

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
      const filename = getSongFile(state.player.songId, state)
      if (!filename) {
        // Old file is not here anymore :(
        dispatch(actions.PLAYER_CURRENT_DURATION(0))
      } else {
        // Old file is still here, let's load it! :)
        fs.get(filename, (err, url) => {
          if (err) throw 'Error getting file: ' + err
          engine.load(url)
          engine.seek(state.player.currentDuration)
        })
      }
    }
  },

  // Set the player engine to play a song
  PLAYER_SET_SONG: (id) => {
    return (dispatch, getState) => {
      const filename = getSongFile(id, getState())
      fs.get(filename, (err, url) => {
        if (err) throw 'Error getting file: ' + err

        engine.load(url)
        engine.play()
        dispatch({
          type: 'PLAYER_SET_SONG',
          id
        })
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

// Get the filename off the state based on a song id
function getSongFile (songId, state) {
  const song = state.songs.filter(x => x.id === songId)[0]
  return (song) ? song.filename : false
}

module.exports = actions
