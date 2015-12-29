var engine = require('player-engine')()
var coversActions = require('./covers.js')
var shuffle = require('shuffle-array')

var actions = {

  // Synchronize the player engine with the loaded state
  PLAYER_SYNCHRONIZE: () => {
    return (dispatch, getState) => {
      // Bind the event listeners to the actions
      engine.on('timeupdate', duration => dispatch(actions.PLAYER_CURRENT_DURATION(duration)))
      engine.on('ended', () => dispatch(actions.PLAYBACK_NEXT()))

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
  PLAYER_SET_SONG: (id, ignoreHistory = false) => {
    return (dispatch, getState) => {
      var state = getState()

      // Don't write multiple times in the history if we are playing the same song
      if (state.player.songId === id) {
        ignoreHistory = true
      }

      // Get the song and the filename
      const song = getSong(id, state)
      const filename = song ? song.filename : false

      // Load and play the file in the engine
      engine.load(filename)
      engine.play()

      // Try and load an cover art
      coversActions.GET_COVER(song.album, song.artist, song.coverId)(dispatch, getState)

      // Update the view
      dispatch({
        type: 'PLAYER_SET_SONG',
        id,
        ignoreHistory
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

  // Play a song and queue the next songs to be played
  PLAYBACK_SONG: (songs, index, push = false) => {
    return (dispatch, getState) => {
      const state = getState()

      songs = songs.map(x => x.id || x)

      if (!push) {
        // Take the first song and play it
        dispatch(actions.PLAYER_SET_SONG(songs[index]))
        dispatch({type: 'SAVE_POSSIBLE_SONG_QUEUE', songs})
        // Remove the played songs
        songs = [...songs.slice(0, index), ...songs.slice(index + 1)]
      }

      if (state.player.randomPlayback) {
        // Random playback, shuffle all possible songs
        shuffle(songs)
      } else {
        // Normal playback, take the songs *after* the clicked song
        songs = [...songs.slice(index)]
      }

      // Queue the rest, but *not* for single songs
      if (songs.length > 0 && !push) {
        dispatch({
          type: 'PLAYBACK_AUTOMATIC_QUEUE',
          songs
        })
      }

      if (songs.length > 0 && push) {
        dispatch({
          type: 'PLAYBACK_AUTOMATIC_QUEUE_PUSH',
          songs
        })
      }
    }
  },

  // Set the previous song for the player out of the history
  PLAYBACK_BACK: () => {
    return (dispatch, getState) => {
      const history = getState().player.history
      var id = history.songs[history.currentIndex - 1]
      dispatch(actions.PLAYER_SET_SONG(id, true))
      dispatch({
        type: 'HISTORY_BACK'
      })
    }
  },

  // Queue a song for playback
  PLAYBACK_USER_QUEUE: (id) => {
    return {
      type: 'PLAYBACK_USER_QUEUE_PUSH',
      id
    }
  },

  // Set the next song for the player
  PLAYBACK_NEXT: () => {
    return (dispatch, getState) => {
      const state = getState()

      // If we have a queue entry, it *always* takes priority
      const userQueue = state.player.userQueue
      if (userQueue.length > 0) {
        dispatch(actions.PLAYER_SET_SONG(userQueue[0]))
        dispatch({
          type: 'PLAYBACK_USER_QUEUE_POP'
        })
        return
      }

      // We have a history entry set, let's use that one.
      const history = state.player.history
      if (history.songs.length - 1 > history.currentIndex) {
        const id = history.songs[history.currentIndex + 1]
        dispatch(actions.PLAYER_SET_SONG(id, true))
        dispatch({
          type: 'HISTORY_NEXT'
        })
        return
      }

      // If we are on infinite playback, make sure that we have songs added to the automatic queue
      const automaticQueue = state.player.automaticQueue
      if (state.player.repeatPlayback && automaticQueue.length <= 15) {
        const index = !state.player.randomPlayback ? 0 : Math.floor(Math.random() * state.player.possibleQueue.length);
        actions.PLAYBACK_SONG(state.player.possibleQueue, index, true)(dispatch, getState)
      }

      // Take the automatically queued songs
      // (e.g. songs of a album or the radio songs)
      if (automaticQueue.length > 0) {
        dispatch(actions.PLAYER_SET_SONG(automaticQueue[0]))
        dispatch({
          type: 'PLAYBACK_AUTOMATIC_QUEUE_POP'
        })
        return
      }

      // Nothing set, let's pause on the last track
      console.log('Queue empty')
      dispatch(actions.PLAYER_SET_PLAYING(false))
      dispatch(actions.PLAYER_SEEK(0))
    }
  },

  // Toggle random playback
  TOGGLE_RANDOM_PLAYBACK: () => {
    return (dispatch, getState) => {
      const state = getState()

      if (!state.player.randomPlayback) {
        dispatch({type: 'SHUFFLE_AUTOMATIC_QUEUE'})
      }

      dispatch({type: 'TOGGLE_RANDOM_PLAYBACK'})
    }
  },

  // Toggle repeat playback
  TOGGLE_REPEAT_PLAYBACK: () => {
    return {type: 'TOGGLE_REPEAT_PLAYBACK'}
  }

}

// Get the song off the state based on a song id
function getSong (songId, state) {
  return state.songs.filter(x => x.id === songId)[0]
}

module.exports = actions
