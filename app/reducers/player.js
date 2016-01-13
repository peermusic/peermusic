var shuffle = require('shuffle-array')

const initialState = {
  songId: 0,
  currentDuration: 0,
  volume: 0.2,
  playing: false,
  history: {currentIndex: 0, songs: []},
  userQueue: [],
  automaticQueue: [],
  possibleQueue: [],
  randomPlayback: false,
  repeatPlayback: true,
  radioPlayback: false
}

const automaticQueue = (state = [], action) => {
  switch (action.type) {
    case 'SHUFFLE_AUTOMATIC_QUEUE':
      return shuffle(state, {copy: true})
    case 'PLAYBACK_AUTOMATIC_QUEUE':
      return [...action.songs]
    case 'PLAYBACK_AUTOMATIC_QUEUE_PUSH':
      return [...state, ...action.songs]
    case 'PLAYBACK_AUTOMATIC_QUEUE_POP':
      return [...state.slice(1, state.length)]
    case 'REMOVE_SONG':
    // TODO Cleanup on remove song!
    default:
      return state
  }
}

const userQueue = (state = [], action) => {
  switch (action.type) {
    case 'PLAYBACK_USER_QUEUE_PUSH':
      return [...state, action.id]
    case 'PLAYBACK_USER_QUEUE_POP':
      return [...state.slice(1, state.length)]
    case 'REMOVE_SONG':
    // TODO Cleanup on remove song!
    default:
      return state
  }
}

const history = (state = {currentIndex: 0, songs: []}, action) => {
  switch (action.type) {
    case 'HISTORY_BACK':
      return {...state, currentIndex: state.currentIndex - 1}
    case 'HISTORY_NEXT':
      return {...state, currentIndex: state.currentIndex + 1}
    case 'PLAYER_SET_SONG':
      if (action.ignoreHistory) {
        return state
      }

      // Remove the history before the current index
      var songs = [...state.songs.slice(0, state.currentIndex + 1)]
      var index = songs.length === 0 ? 0 : state.currentIndex + 1

      // Make sure that we only save a max of 25 history elements
      if (index > 25) {
        index = 25
        songs.splice(0, 1)
      }

      return {...state, songs: [...songs, action.id], currentIndex: index}
    case 'REMOVE_SONG':
    // TODO Cleanup .songs on remove song!
    default:
      return state
  }
}

const player = (state = initialState, action) => {
  switch (action.type) {
    case 'PLAYER_SET_VOLUME':
      return {...state, volume: action.volume}
    case 'PLAYER_SET_PLAYING':
      return {...state, playing: action.playing}
    case 'PLAYER_CURRENT_DURATION':
      return {...state, currentDuration: action.currentDuration}
    case 'PLAYER_SET_SONG':
      return {
        ...state,
        songId: action.id,
        currentDuration: 0,
        playing: true,
        history: history(state.history, action)
      }
    case 'HISTORY_BACK':
    case 'HISTORY_NEXT':
      return {...state, history: history(state.history, action)}
    case 'PLAYBACK_USER_QUEUE_PUSH':
    case 'PLAYBACK_USER_QUEUE_POP':
      return {...state, userQueue: userQueue(state.userQueue, action)}
    case 'SHUFFLE_AUTOMATIC_QUEUE':
    case 'PLAYBACK_AUTOMATIC_QUEUE':
    case 'PLAYBACK_AUTOMATIC_QUEUE_PUSH':
    case 'PLAYBACK_AUTOMATIC_QUEUE_POP':
      return {...state, automaticQueue: automaticQueue(state.automaticQueue, action)}
    case 'SAVE_POSSIBLE_SONG_QUEUE':
      return {...state, possibleQueue: action.songs}
    case 'TOGGLE_RANDOM_PLAYBACK':
      return {...state, randomPlayback: !state.randomPlayback}
    case 'TOGGLE_REPEAT_PLAYBACK':
      return {...state, repeatPlayback: !state.repeatPlayback}
    case 'TOGGLE_RADIO_PLAYBACK':
      return {...state, radioPlayback: !state.radioPlayback}
    default:
      return state
  }
}

module.exports = player
